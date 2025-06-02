import os
import base64
import httpx
import json
from typing import Optional, Literal
from agentpress.tool import Tool, ToolResult, openapi_schema, xml_schema
from utils.logger import logger
from services.supabase import DBConnection
import uuid
from datetime import datetime
from PIL import Image, ImageDraw
import io
from agent.tools.imagen_prompt_enhancer import imagen_enhancer, ContentType

class ImageEditTool(Tool):
    """Tool for editing, enhancing, and modifying existing images using AI."""

    def __init__(self):
        super().__init__()
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        
        if not self.openai_api_key:
            logger.warning("OPENAI_API_KEY not found. DALL-E image editing will not work.")
        if not self.google_api_key:
            logger.warning("GOOGLE_API_KEY not found. Imagen editing capabilities may be limited.")

    def _create_center_mask(self, image_path: str, mask_size_ratio: float = 0.3) -> str:
        """Create a simple center mask for inpainting when no mask is provided."""
        try:
            with Image.open(image_path) as img:
                width, height = img.size
                
                # Create a black image (RGB)
                mask = Image.new('RGB', (width, height), color='black')
                
                # Calculate center rectangle for white area (area to be edited)
                center_w = int(width * mask_size_ratio)
                center_h = int(height * mask_size_ratio)
                left = (width - center_w) // 2
                top = (height - center_h) // 2
                right = left + center_w
                bottom = top + center_h
                
                # Draw white rectangle in center (area to be edited)
                draw = ImageDraw.Draw(mask)
                draw.rectangle([left, top, right, bottom], fill='white')
                
                # Save temporary mask
                mask_path = f"generated_images/temp_mask_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                os.makedirs("generated_images", exist_ok=True)
                mask.save(mask_path)
                
                logger.info(f"Created center mask at: {mask_path}")
                return mask_path
                
        except Exception as e:
            logger.error(f"Failed to create center mask: {e}")
            return None

    @openapi_schema({
        "type": "function",
        "function": {
            "name": "edit_image",
            "description": "Edit, modify, or enhance existing images using AI. Supports single or multiple images (up to 16), inpainting, outpainting, variations, and style modifications.",
            "parameters": {
                "type": "object",
                "properties": {
                    "images": {
                        "type": "string",
                        "description": "Path to the source image file(s) to edit. For multiple images, separate paths with commas (e.g., 'img1.png,img2.jpg,img3.png'). Maximum 16 images."
                    },
                    "prompt": {
                        "type": "string",
                        "description": "Detailed description of the desired changes or edits to make to the image(s)"
                    },
                    "edit_type": {
                        "type": "string",
                        "description": "Type of image editing operation to perform",
                        "enum": ["inpaint", "outpaint", "variation", "style_transfer", "object_removal", "background_change", "composite", "multi_edit"],
                        "default": "inpaint"
                    },
                    "mask_path": {
                        "type": "string",
                        "description": "Path to mask image for inpainting (black areas will be edited, white areas preserved). Optional - can be auto-generated.",
                        "default": None
                    },
                    "provider": {
                        "type": "string",
                        "description": "AI provider to use for image editing",
                        "enum": ["gpt-image-1", "dall-e-3", "imagen4", "auto"],
                        "default": "auto"
                    },
                    "size": {
                        "type": "string", 
                        "description": "Output image size",
                        "enum": ["1024x1024", "1536x1024", "1024x1536", "1792x1024", "1024x1792", "square", "landscape", "portrait", "original", "auto"],
                        "default": "auto"
                    },
                    "quality": {
                        "type": "string",
                        "description": "Output quality level",
                        "enum": ["standard", "hd", "high", "medium", "low"],
                        "default": "hd"
                    },
                    "mode": {
                        "type": "string",
                        "description": "Editing mode for controlling the level of changes",
                        "enum": ["subtle", "moderate", "dramatic", "auto"],
                        "default": "auto"
                    },
                    "style": {
                        "type": "string",
                        "description": "Style for the edited image",
                        "enum": ["natural", "photorealistic", "artistic", "vivid", "match_original", "enhanced"],
                        "default": "match_original"
                    },
                    "save_to_file": {
                        "type": "boolean",
                        "description": "Whether to save the edited image to a file",
                        "default": True
                    },
                    "filename": {
                        "type": "string",
                        "description": "Custom filename for the edited image (without extension)",
                        "default": None
                    }
                },
                "required": ["images", "prompt"]
            }
        }
    })
    @xml_schema(
        tag_name="edit-image",
        mappings=[
            {"param_name": "images", "node_type": "attribute", "path": ".", "required": True},
            {"param_name": "prompt", "node_type": "content", "path": ".", "required": True},
            {"param_name": "edit_type", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "mask_path", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "provider", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "size", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "quality", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "mode", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "style", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "save_to_file", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "filename", "node_type": "attribute", "path": ".", "required": False}
        ],
        alternative_mappings=[
            {"param_name": "images", "node_type": "attribute", "path": ".", "required": True},
            {"param_name": "prompt", "node_type": "attribute", "path": ".", "required": True}
        ],
        example='''
        <!-- Multi-image composite editing -->
        <edit-image images="soap.png,bath-bomb.png,incense-kit.png" size="1024x1024" quality="high" mode="moderate">
        A photorealistic gift basket containing all these items with a ribbon labeled "Relax & Unwind"
        </edit-image>
        
        <!-- Single image with prompt as attribute -->
        <edit-image images="landscape.jpg" prompt="Remove the power lines from the sky and replace with clear blue sky" edit_type="object_removal" provider="gpt-image-1" quality="high" style="photorealistic"></edit-image>
        '''
    )
    async def edit_image(
        self,
        images: str,
        prompt: str,
        edit_type: Literal["inpaint", "outpaint", "variation", "style_transfer", "object_removal", "background_change", "composite", "multi_edit"] = "inpaint",
        mask_path: Optional[str] = None,
        provider: Literal["gpt-image-1", "dall-e-3", "imagen4", "auto"] = "auto",
        size: Literal["1024x1024", "1536x1024", "1024x1536", "1792x1024", "1024x1792", "square", "landscape", "portrait", "original", "auto"] = "auto",
        quality: Literal["standard", "hd", "high", "medium", "low"] = "hd",
        mode: Literal["subtle", "moderate", "dramatic", "auto"] = "auto",
        style: Literal["natural", "photorealistic", "artistic", "vivid", "match_original", "enhanced"] = "match_original",
        save_to_file: bool = True,
        filename: Optional[str] = None
    ) -> ToolResult:
        """Edit existing image(s) using AI. Supports single or multiple images (up to 16)."""
        try:
            # Parse and validate image paths
            image_paths = [path.strip() for path in images.split(',')]
            
            # Limit to 16 images as per GPT-Image-1 specification
            if len(image_paths) > 16:
                return self.fail_response(f"Too many images provided ({len(image_paths)}). Maximum is 16 images.")
            
            # Validate all images exist
            for image_path in image_paths:
                if not os.path.exists(image_path):
                    return self.fail_response(f"Source image not found: {image_path}")

            # Handle multi-image vs single-image editing
            if len(image_paths) > 1:
                return await self._edit_multiple_images(
                    image_paths, prompt, edit_type, provider, size, quality, mode, style, save_to_file, filename
                )
            else:
                return await self._edit_single_image(
                    image_paths[0], prompt, edit_type, mask_path, provider, size, quality, mode, style, save_to_file, filename
                )
                
        except Exception as e:
            logger.error(f"Error editing image(s): {str(e)}", exc_info=True)
            return self.fail_response(f"Failed to edit image(s): {str(e)}")

    async def _edit_single_image(self, image_path, prompt, edit_type, mask_path, provider, size, quality, mode, style, save_to_file, filename):
        """Edit a single image."""
        # Load and process source image
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Load original image to get dimensions
        original_image = Image.open(image_path)
        original_size = f"{original_image.width}x{original_image.height}"
        
        # Auto-select provider based on edit type and availability
        selected_provider = self._select_provider(provider, edit_type)
        
        # Process based on edit type and provider
        if selected_provider == "gpt-image-1":
            return await self._edit_with_gpt_image_1(
                image_base64, prompt, edit_type, mask_path, 
                size, quality, mode, style, save_to_file, filename, original_size
            )
        elif selected_provider == "dall-e-3":
            return await self._edit_with_dalle3(
                image_base64, prompt, edit_type, mask_path, 
                size, quality, style, save_to_file, filename, original_size
            )
        else:
            return await self._edit_with_imagen4(
                image_base64, prompt, edit_type, mask_path,
                size, quality, style, save_to_file, filename, original_size
            )

    async def _edit_multiple_images(self, image_paths, prompt, edit_type, provider, size, quality, mode, style, save_to_file, filename):
        """Edit multiple images together (composition/multi-edit)."""
        logger.info(f"Editing {len(image_paths)} images together: {edit_type}")
        
        # Load all images
        image_data_list = []
        for image_path in image_paths:
            with open(image_path, 'rb') as f:
                image_data = f.read()
            image_data_list.append(base64.b64encode(image_data).decode('utf-8'))
        
        # Auto-select provider (prefer GPT-Image-1 for multi-image operations)
        selected_provider = self._select_provider(provider, edit_type, multi_image=True)
        
        if selected_provider == "gpt-image-1":
            return await self._multi_edit_with_gpt_image_1(
                image_data_list, image_paths, prompt, edit_type, size, quality, mode, style, save_to_file, filename
            )
        else:
            # For other providers, process individually and then composite
            return await self._multi_edit_fallback(
                image_data_list, image_paths, prompt, edit_type, size, quality, mode, style, save_to_file, filename
            )

    def _select_provider(self, provider: str, edit_type: str, multi_image: bool = False) -> str:
        """Select the best provider based on edit type and availability."""
        if provider != "auto":
            if provider == "gpt-image-1" and not self.openai_api_key:
                if self.google_api_key:
                    logger.info("GPT-Image-1 requested but not available, falling back to Imagen 4")
                    return "imagen4"
                else:
                    raise ValueError("GPT-Image-1 requested but OpenAI API key not configured")
            elif provider == "dall-e-3" and not self.openai_api_key:
                if self.google_api_key:
                    logger.info("DALL-E 3 requested but not available, falling back to Imagen 4")
                    return "imagen4"
                else:
                    raise ValueError("DALL-E 3 requested but OpenAI API key not configured")
            elif provider == "imagen4" and not self.google_api_key:
                if self.openai_api_key:
                    logger.info("Imagen 4 requested but not available, falling back to GPT-Image-1")
                    return "gpt-image-1"
                else:
                    raise ValueError("Imagen 4 requested but Google API key not configured")
            return provider

        # Auto-selection logic
        
        # Multi-image operations - prefer GPT-Image-1 which supports up to 16 images
        if multi_image and self.openai_api_key:
            logger.info("Auto-selected GPT-Image-1 for multi-image operation")
            return "gpt-image-1"
        
        # Complex editing operations - prefer GPT-Image-1
        complex_edits = ["composite", "multi_edit", "outpaint"]
        if edit_type in complex_edits and self.openai_api_key:
            logger.info(f"Auto-selected GPT-Image-1 for complex edit: {edit_type}")
            return "gpt-image-1"
        
        # High-quality variations and style transfer - prefer GPT-Image-1
        artistic_edits = ["variation", "style_transfer"]
        if edit_type in artistic_edits and self.openai_api_key:
            logger.info(f"Auto-selected GPT-Image-1 for artistic edit: {edit_type}")
            return "gpt-image-1"
        
        # Object removal and inpainting - DALL-E 3 is excellent for these
        precision_edits = ["object_removal", "inpaint"]
        if edit_type in precision_edits and self.openai_api_key:
            logger.info(f"Auto-selected DALL-E 3 for precision edit: {edit_type}")
            return "dall-e-3"
        
        # Background changes - Imagen 4 for photorealistic results
        if edit_type == "background_change" and self.google_api_key:
            logger.info("Auto-selected Imagen 4 for background change")
            return "imagen4"
        
        # Default preferences: GPT-Image-1 > DALL-E 3 > Imagen 4
        if self.openai_api_key:
            logger.info("Auto-selected GPT-Image-1 (default preference)")
            return "gpt-image-1"
        elif self.google_api_key:
            logger.info("Auto-selected Imagen 4 (fallback)")
            return "imagen4"
        else:
            raise ValueError("No image editing providers are configured")

    async def _edit_with_dalle3(self, image_base64, prompt, edit_type, mask_path, size, quality, style, save_to_file, filename, original_size):
        """Edit image using DALL-E 3."""
        logger.info(f"Editing image with DALL-E 3: {edit_type}")
        
        # Convert base64 back to bytes for file upload
        image_bytes = base64.b64decode(image_base64)
        
        # Set size
        if size != "original":
            dalle_size = size
        else:
            # Use closest supported size to original
            if "1024x1024" in original_size or min(map(int, original_size.split('x'))) <= 1024:
                dalle_size = "1024x1024"
            else:
                dalle_size = "1024x1024"  # Default fallback

        async with httpx.AsyncClient(timeout=120.0) as client:
            if edit_type in ["inpaint", "object_removal"]:
                endpoint = "https://api.openai.com/v1/images/edits"
                
                # Prepare multipart form data
                files = {
                    "image": ("image.png", image_bytes, "image/png")
                }
                
                data = {
                    "prompt": prompt,
                    "response_format": "b64_json",
                    "n": 1,
                    "size": dalle_size
                }
                
                # Add mask if provided
                if mask_path and os.path.exists(mask_path):
                    with open(mask_path, 'rb') as f:
                        mask_data = f.read()
                    files["mask"] = ("mask.png", mask_data, "image/png")
                
                response = await client.post(
                    endpoint,
                    headers={"Authorization": f"Bearer {self.openai_api_key}"},
                    files=files,
                    data=data
                )
                
            else:  # variations, style_transfer, etc.
                endpoint = "https://api.openai.com/v1/images/variations"
                
                files = {
                    "image": ("image.png", image_bytes, "image/png")
                }
                
                data = {
                    "response_format": "b64_json",
                    "n": 1,
                    "size": dalle_size
                }
                
                response = await client.post(
                    endpoint,
                    headers={"Authorization": f"Bearer {self.openai_api_key}"},
                    files=files,
                    data=data
                )

        if not response.is_success:
            error_data = response.json() if response.content else {}
            error_detail = error_data.get("error", {}).get("message", f"HTTP {response.status_code}")
            raise Exception(f"DALL-E 3 API error: {error_detail}")

        result = response.json()
        image_data = result.get("data", [{}])[0]
        b64_image = image_data.get("b64_json")

        if not b64_image:
            raise Exception("No image data in DALL-E 3 response")

        return await self._process_edit_result(
            b64_image, prompt, "DALL-E 3", edit_type,
            dalle_size, quality, style, save_to_file, filename
        )

    async def _edit_with_imagen4(self, image_base64, prompt, edit_type, mask_path, size, quality, style, save_to_file, filename, original_size):
        """Edit image using Imagen 4 (simulated - actual implementation would depend on Google's API)."""
        logger.info(f"Editing image with Imagen 4: {edit_type}")
        
        # Use advanced prompt enhancement for Imagen 4 editing
        content_type = imagen_enhancer.detect_content_type(prompt)
        
        # Create an editing-specific prompt
        edit_prompt = f"Edit this image: {prompt}"
        
        # Apply specialized enhancements based on content type and edit type
        if edit_type == "background_change" and content_type == ContentType.PORTRAIT:
            enhanced_prompt, enhancement_log = imagen_enhancer.enhance_for_portrait(edit_prompt, style)
        elif edit_type in ["composite", "multi_edit"] and content_type == ContentType.PRODUCT:
            enhanced_prompt, enhancement_log = imagen_enhancer.enhance_for_product_photography(edit_prompt, style)
        else:
            enhanced_prompt, enhancement_log = imagen_enhancer.enhance_for_imagen4(edit_prompt, style, quality, content_type)
        
        # Add edit-type specific guidance
        if edit_type == "object_removal":
            enhanced_prompt += ", seamlessly blend background, natural composition"
        elif edit_type == "background_change":
            enhanced_prompt += ", maintain subject lighting, realistic integration"
        elif edit_type == "style_transfer":
            enhanced_prompt += ", preserve subject details, apply style consistently"
        
        # Optimize prompt length
        enhanced_prompt = imagen_enhancer.optimize_prompt_length(enhanced_prompt, max_length=350)
        
        logger.info(f"Imagen 4 edit enhancement:\n{enhancement_log}")
        
        # Note: This is a placeholder implementation
        # Actual Imagen 4 editing API calls would be implemented here
        # For now, we'll fall back to generation with reference
        
        # Size mapping
        size_map = {
            "1024x1024": (1024, 1024),
            "1792x1024": (1792, 1024), 
            "1024x1792": (1024, 1792),
            "original": tuple(map(int, original_size.split('x')))
        }
        width, height = size_map.get(size, (1024, 1024))

        # This would be the actual Imagen 4 editing API call
        # For demonstration, we'll return a placeholder response
        return self.fail_response("Imagen 4 image editing is not yet implemented. Please use DALL-E 3 or GPT-Image-1 for image editing operations.")

    async def _process_edit_result(self, b64_image, prompt, provider, edit_type, size, quality, style, save_to_file, filename):
        """Process and save the edited image."""
        image_bytes = base64.b64decode(b64_image)
        
        response_data = {
            "provider": provider,
            "edit_type": edit_type,
            "prompt": prompt,
            "size": size,
            "quality": quality,
            "style": style,
            "image_size_bytes": len(image_bytes)
        }

        if save_to_file:
            try:
                if not filename:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"edited_image_{edit_type}_{timestamp}"
                
                filename = filename.rsplit('.', 1)[0] if filename.endswith(('.png', '.jpg', '.jpeg')) else filename
                file_path = f"generated_images/{filename}.png"
                
                os.makedirs("generated_images", exist_ok=True)
                with open(file_path, 'wb') as f:
                    f.write(image_bytes)
                
                response_data.update({"saved_to": file_path, "file_size_kb": round(len(image_bytes) / 1024, 2)})
                logger.info(f"Edited image saved to: {file_path}")
                
            except Exception as save_error:
                logger.error(f"Failed to save edited image: {save_error}")
                response_data["save_error"] = str(save_error)

        try:
            db = DBConnection()
            public_url = await db.upload_base64_image(b64_image, "edited-images")
            response_data["public_url"] = public_url
            logger.info(f"Edited image uploaded to storage: {public_url}")
        except Exception as upload_error:
            logger.warning(f"Failed to upload edited image to storage: {upload_error}")

        success_message = f"Successfully edited image using {provider}!\n\n"
        success_message += f"**Edit Type:** {edit_type}\n"
        success_message += f"**Prompt:** {prompt}\n"
        success_message += f"**Specifications:** {size}, {quality} quality, {style} style\n"
        
        if response_data.get("saved_to"):
            success_message += f"**Saved to:** {response_data['saved_to']} ({response_data['file_size_kb']} KB)\n"
        if response_data.get("public_url"):
            success_message += f"**Public URL:** {response_data['public_url']}\n"
        
        success_message += "\nThe edited image has been processed and is ready for use!"

        return self.success_response(success_message, response_data)

    async def _edit_with_gpt_image_1(self, image_base64, prompt, edit_type, mask_path, size, quality, mode, style, save_to_file, filename, original_size):
        """Edit image using GPT-Image-1 (newest OpenAI model)."""
        logger.info(f"Editing image with GPT-Image-1: {edit_type}")
        
        # Normalize parameters for GPT-Image-1
        size_map = {
            "square": "1024x1024", "landscape": "1536x1024", "portrait": "1024x1536",
            "auto": "1024x1024"  # Default auto selection
        }
        gpt_size = size_map.get(size, size)
        
        # Map quality parameters
        quality_map = {"medium": "standard", "low": "standard", "hd": "hd", "high": "hd"}
        gpt_quality = quality_map.get(quality, "hd")
        
        # Convert base64 back to bytes for file upload
        image_bytes = base64.b64decode(image_base64)
        
        # Enhanced prompt based on edit type and mode
        enhanced_prompt = self._enhance_edit_prompt(prompt, edit_type, mode, style)
        
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                files = {
                    'image': ('image.png', image_bytes, 'image/png')
                }
                
                data = {
                    'prompt': enhanced_prompt,
                    'size': gpt_size,
                    'quality': gpt_quality,
                    'n': 1
                }
                
                # Add mask if provided for inpainting
                if mask_path and edit_type in ["inpaint", "object_removal"]:
                    with open(mask_path, 'rb') as mask_file:
                        mask_bytes = mask_file.read()
                    files['mask'] = ('mask.png', mask_bytes, 'image/png')
                
                headers = {
                    'Authorization': f'Bearer {self.openai_api_key}'
                }
                
                # Use appropriate endpoint based on edit type
                if edit_type in ["inpaint", "object_removal"] and mask_path:
                    endpoint = "https://api.openai.com/v1/images/edits"
                else:
                    endpoint = "https://api.openai.com/v1/images/variations"
                
                response = await client.post(endpoint, files=files, data=data, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                if 'data' in result and len(result['data']) > 0:
                    image_url = result['data'][0]['url']
                    
                    # Download the generated image
                    img_response = await client.get(image_url)
                    img_response.raise_for_status()
                    edited_image_data = img_response.content
                    
                    # Convert to base64 for processing
                    edited_b64 = base64.b64encode(edited_image_data).decode('utf-8')
                    
                    return await self._process_edit_result(
                        edited_b64, enhanced_prompt, "gpt-image-1", edit_type, gpt_size, gpt_quality, style, save_to_file, filename
                    )
                else:
                    return self.fail_response("No edited image returned from GPT-Image-1")
                
        except Exception as e:
            logger.error(f"GPT-Image-1 editing failed: {e}")
            # Fallback to DALL-E 3 if available
            if self.openai_api_key:
                logger.info("Falling back to DALL-E 3 for image editing")
                return await self._edit_with_dalle3(
                    image_base64, prompt, edit_type, mask_path, size, quality, style, save_to_file, filename, original_size
                )
            else:
                return self.fail_response(f"GPT-Image-1 editing failed: {str(e)}")

    async def _multi_edit_with_gpt_image_1(self, image_data_list, image_paths, prompt, edit_type, size, quality, mode, style, save_to_file, filename):
        """Edit multiple images together using GPT-Image-1."""
        logger.info(f"Multi-editing {len(image_data_list)} images with GPT-Image-1")
        
        # Enhanced prompt for multi-image composition
        enhanced_prompt = self._enhance_multi_edit_prompt(prompt, edit_type, mode, style, len(image_data_list))
        
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                files = {}
                
                # Add all images to the request
                for i, image_b64 in enumerate(image_data_list):
                    image_bytes = base64.b64decode(image_b64)
                    files[f'image_{i}'] = (f'image_{i}.png', image_bytes, 'image/png')
                
                # Normalize size for multi-image
                size_map = {
                    "square": "1024x1024", "landscape": "1536x1024", "portrait": "1024x1536",
                    "auto": "1024x1024", "original": "1024x1024"
                }
                gpt_size = size_map.get(size, "1024x1024")
                
                data = {
                    'prompt': enhanced_prompt,
                    'size': gpt_size,
                    'quality': quality if quality in ["standard", "hd"] else "hd",
                    'n': 1
                }
                
                headers = {
                    'Authorization': f'Bearer {self.openai_api_key}'
                }
                
                # Use composition endpoint (this might need to be adjusted based on actual GPT-Image-1 API)
                endpoint = "https://api.openai.com/v1/images/generations"
                
                response = await client.post(endpoint, files=files, data=data, headers=headers)
                response.raise_for_status()
                result = response.json()
                
                if 'data' in result and len(result['data']) > 0:
                    image_url = result['data'][0]['url']
                    
                    # Download the composed image
                    img_response = await client.get(image_url)
                    img_response.raise_for_status()
                    composed_image_data = img_response.content
                    
                    # Convert to base64 for processing
                    composed_b64 = base64.b64encode(composed_image_data).decode('utf-8')
                    
                    return await self._process_edit_result(
                        composed_b64, enhanced_prompt, "gpt-image-1", f"multi_{edit_type}", gpt_size, quality, style, save_to_file, filename
                    )
                else:
                    return self.fail_response("No composed image returned from GPT-Image-1")
                
        except Exception as e:
            logger.error(f"GPT-Image-1 multi-editing failed: {e}")
            return await self._multi_edit_fallback(
                image_data_list, image_paths, prompt, edit_type, size, quality, mode, style, save_to_file, filename
            )

    async def _multi_edit_fallback(self, image_data_list, image_paths, prompt, edit_type, size, quality, mode, style, save_to_file, filename):
        """Fallback for multi-image editing when GPT-Image-1 is not available."""
        logger.info("Using fallback approach for multi-image editing")
        
        # For now, process the first image as the primary edit
        # This is a simplified fallback - could be enhanced with image composition logic
        return await self._edit_single_image(
            image_paths[0], f"{prompt} (incorporating elements from {len(image_paths)} images)", 
            edit_type, None, "auto", size, quality, mode, style, save_to_file, filename
        )

    def _enhance_edit_prompt(self, prompt: str, edit_type: str, mode: str, style: str) -> str:
        """Enhance edit prompt based on type, mode, and style."""
        enhancements = []
        
        # Add mode-specific guidance
        if mode == "subtle":
            enhancements.append("with subtle, natural-looking changes")
        elif mode == "moderate":
            enhancements.append("with noticeable but realistic modifications")
        elif mode == "dramatic":
            enhancements.append("with bold, striking transformations")
        
        # Add style-specific guidance
        if style == "photorealistic":
            enhancements.append("maintaining photorealistic quality and natural lighting")
        elif style == "artistic":
            enhancements.append("with artistic interpretation and enhanced visual appeal")
        elif style == "enhanced":
            enhancements.append("with improved quality, contrast, and visual impact")
        elif style == "match_original":
            enhancements.append("preserving the original style and aesthetic")
        
        # Add edit-type specific guidance
        if edit_type == "object_removal":
            enhancements.append("seamlessly blending the background to hide any trace of removed elements")
        elif edit_type == "background_change":
            enhancements.append("ensuring proper lighting and perspective consistency")
        elif edit_type == "style_transfer":
            enhancements.append("applying the new style while preserving important details")
        
        enhanced = prompt
        if enhancements:
            enhanced += " " + ", ".join(enhancements)
        
        return enhanced

    def _enhance_multi_edit_prompt(self, prompt: str, edit_type: str, mode: str, style: str, num_images: int) -> str:
        """Enhance prompt for multi-image editing operations."""
        base_prompt = f"Combine {num_images} images: {prompt}"
        
        if edit_type == "composite":
            base_prompt += f" Create a cohesive composition that naturally integrates all {num_images} images"
        elif edit_type == "multi_edit":
            base_prompt += f" Apply consistent edits across all {num_images} images"
        
        return self._enhance_edit_prompt(base_prompt, edit_type, mode, style) 