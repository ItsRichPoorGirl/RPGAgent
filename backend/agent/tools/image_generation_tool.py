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

class ImageGenerationTool(Tool):
    """Tool for generating images using GPT-Image-1 and Imagen 4."""

    def __init__(self):
        super().__init__()
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        
        if not self.openai_api_key and not self.google_api_key:
            logger.warning("No image generation API keys found. Image generation will not be available.")

    @openapi_schema({
        "type": "function",
        "function": {
            "name": "generate_image",
            "description": "Generate high-quality AI images using GPT-Image-1 (newest OpenAI model) or Imagen 4 (Google). Creates exceptional images for design, illustration, and creative purposes.",
            "parameters": {
                "type": "object",
                "properties": {
                    "prompt": {
                        "type": "string",
                        "description": "Detailed description of the image to generate. Be specific about style, composition, colors, and visual elements."
                    },
                    "provider": {
                        "type": "string",
                        "description": "AI provider to use for image generation",
                        "enum": ["gpt-image-1", "imagen4", "auto"],
                        "default": "auto"
                    },
                    "size": {
                        "type": "string",
                        "description": "Image size/resolution",
                        "enum": ["1024x1024", "1792x1024", "1024x1792", "1024x1536", "1536x1024", "square", "landscape", "portrait"],
                        "default": "1024x1024"
                    },
                    "quality": {
                        "type": "string",
                        "description": "Image quality level",
                        "enum": ["standard", "hd", "high"],
                        "default": "hd"
                    },
                    "style": {
                        "type": "string",
                        "description": "Visual style of the generated image",
                        "enum": ["natural", "photorealistic", "artistic", "vivid"],
                        "default": "natural"
                    },
                    "save_to_file": {
                        "type": "boolean",
                        "description": "Whether to save the generated image to a file in the workspace",
                        "default": True
                    },
                    "filename": {
                        "type": "string",
                        "description": "Custom filename for the saved image (without extension). If not provided, will auto-generate.",
                        "default": None
                    }
                },
                "required": ["prompt"]
            }
        }
    })
    @xml_schema(
        tag_name="generate-image",
        mappings=[
            {"param_name": "prompt", "node_type": "content", "path": ".", "required": True},
            {"param_name": "provider", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "size", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "quality", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "style", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "save_to_file", "node_type": "attribute", "path": ".", "required": False},
            {"param_name": "filename", "node_type": "attribute", "path": ".", "required": False}
        ],
        example='''
        <!-- Use prompt as content between tags -->
        <generate-image provider="gpt-image-1" size="1024x1536" quality="high">
        A photorealistic portrait of a majestic cat with soft fur, striking eyes, and whiskers.
        </generate-image>
        
        <!-- YouTube thumbnail with auto-selection -->
        <generate-image size="1536x1024" quality="high">
        SHOCKING: AI discovers cure for aging! Excited scientist pointing at glowing test tube, vibrant blue and orange lighting, bold text space, photorealistic
        </generate-image>
        '''
    )
    async def generate_image(
        self,
        prompt: str,
        provider: Literal["gpt-image-1", "imagen4", "auto"] = "auto",
        size: Literal["1024x1024", "1792x1024", "1024x1792", "1024x1536", "1536x1024", "square", "landscape", "portrait"] = "1024x1024",
        quality: Literal["standard", "hd", "high"] = "hd",
        style: Literal["natural", "photorealistic", "artistic", "vivid"] = "natural",
        save_to_file: bool = True,
        filename: Optional[str] = None
    ) -> ToolResult:
        """Generate an image using GPT-Image-1 or Imagen 4."""
        try:
            # Auto-select provider based on availability and prompt characteristics
            selected_provider = self._select_provider(provider, prompt, style)
            
            if selected_provider == "gpt-image-1":
                return await self._generate_with_gpt_image_1(prompt, size, quality, style, save_to_file, filename)
            else:
                return await self._generate_with_imagen4(prompt, size, quality, style, save_to_file, filename)
                
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}", exc_info=True)
            return self.fail_response(f"Failed to generate image: {str(e)}")

    def _select_provider(self, provider: str, prompt: str, style: str) -> str:
        """Select the best provider based on request characteristics."""
        if provider != "auto":
            if provider == "gpt-image-1" and not self.openai_api_key:
                if self.google_api_key:
                    logger.info("GPT-Image-1 requested but not available, falling back to Imagen 4")
                    return "imagen4"
                else:
                    raise ValueError("GPT-Image-1 requested but OpenAI API key not configured")
            elif provider == "imagen4" and not self.google_api_key:
                if self.openai_api_key:
                    logger.info("Imagen 4 requested but not available, falling back to GPT-Image-1")
                    return "gpt-image-1"
                else:
                    raise ValueError("Imagen 4 requested but Google API key not configured")
            return provider

        # Enhanced auto-selection with use-case analysis
        prompt_lower = prompt.lower()
        
        # YouTube thumbnails - prioritize Imagen 4 for click-through optimization
        youtube_keywords = ["youtube", "thumbnail", "clickbait", "shocking", "reaction", "viral", "click"]
        if any(keyword in prompt_lower for keyword in youtube_keywords) and self.google_api_key:
            logger.info("Auto-selected Imagen 4 for YouTube thumbnail optimization")
            return "imagen4"
        
        # E-commerce and marketing - prioritize Imagen 4 for authentic appeal
        marketing_keywords = ["product", "ecommerce", "shopping", "lifestyle", "brand", "advertisement", "marketing"]
        if any(keyword in prompt_lower for keyword in marketing_keywords) and self.google_api_key:
            logger.info("Auto-selected Imagen 4 for marketing/e-commerce content")
            return "imagen4"
        
        # Photorealistic content - prioritize Imagen 4
        if style == "photorealistic" and self.google_api_key:
            logger.info("Auto-selected Imagen 4 for photorealistic content")
            return "imagen4"
        
        # Portrait and human subjects - prioritize Imagen 4
        human_keywords = ["person", "portrait", "face", "human", "people", "man", "woman", "child", "expression"]
        if any(keyword in prompt_lower for keyword in human_keywords) and self.google_api_key:
            logger.info("Auto-selected Imagen 4 for human subjects")
            return "imagen4"
        
        # Technical and complex scenes - prioritize GPT-Image-1
        technical_keywords = ["technical", "diagram", "blueprint", "schematic", "detailed", "complex", "intricate"]
        if any(keyword in prompt_lower for keyword in technical_keywords) and self.openai_api_key:
            logger.info("Auto-selected GPT-Image-1 for technical/complex content")
            return "gpt-image-1"
        
        # Artistic and creative content - consider both but prefer GPT-Image-1
        artistic_keywords = ["artistic", "painting", "drawing", "abstract", "fantasy", "surreal", "creative"]
        if any(keyword in prompt_lower for keyword in artistic_keywords) and self.openai_api_key:
            logger.info("Auto-selected GPT-Image-1 for artistic content")
            return "gpt-image-1"
        
        # Default preference: GPT-Image-1 for general use, Imagen 4 as fallback
        if self.openai_api_key:
            logger.info("Auto-selected GPT-Image-1 (default preference)")
            return "gpt-image-1"
        elif self.google_api_key:
            logger.info("Auto-selected Imagen 4 (fallback)")
            return "imagen4"
        else:
            raise ValueError("No image generation providers are configured")

    async def _generate_with_gpt_image_1(self, prompt, size, quality, style, save_to_file, filename):
        """Generate image using GPT-Image-1 (newest OpenAI model)."""
        logger.info(f"Generating image with GPT-Image-1: {prompt[:100]}...")

        # Normalize parameters for GPT-Image-1
        size_map = {
            "square": "1024x1024", "landscape": "1536x1024", "portrait": "1024x1536",
            "1792x1024": "1536x1024", "1024x1792": "1024x1536"  # Map to supported sizes
        }
        gpt_size = size_map.get(size, size)

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/images/generations",
                headers={"Authorization": f"Bearer {self.openai_api_key}", "Content-Type": "application/json"},
                json={
                    "model": "gpt-image-1", 
                    "prompt": prompt, 
                    "size": gpt_size,
                    "response_format": "b64_json", 
                    "n": 1
                }
            )

        if not response.is_success:
            error_data = response.json() if response.content else {}
            error_detail = error_data.get("error", {}).get("message", f"HTTP {response.status_code}")
            raise Exception(f"GPT-Image-1 API error: {error_detail}")

        result = response.json()
        image_data = result.get("data", [{}])[0]
        b64_image = image_data.get("b64_json")

        if not b64_image:
            raise Exception("No image data in GPT-Image-1 response")

        return await self._process_image_result(
            b64_image, prompt, prompt, "GPT-Image-1", 
            gpt_size, quality, style, save_to_file, filename
        )

    async def _generate_with_imagen4(self, prompt, size, quality, style, save_to_file, filename):
        """Generate image using Google's Imagen 4.""" 
        logger.info(f"Generating image with Imagen 4: {prompt[:100]}...")

        size_map = {
            "1024x1024": (1024, 1024), "1792x1024": (1792, 1024), "1024x1792": (1024, 1792),
            "1024x1536": (1024, 1536), "1536x1024": (1536, 1024),
            "square": (1024, 1024), "landscape": (1536, 1024), "portrait": (1024, 1536)
        }
        width, height = size_map.get(size, (1024, 1024))
        
        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage",
                headers={"Authorization": f"Bearer {self.google_api_key}", "Content-Type": "application/json"},
                json={
                    "prompt": prompt,
                    "config": {"width": width, "height": height, "outputFormat": "PNG", "safetySetting": "BLOCK_ONLY_HIGH"}
                }
            )

        if not response.is_success:
            error_data = response.json() if response.content else {}
            error_detail = error_data.get("error", {}).get("message", f"HTTP {response.status_code}")
            raise Exception(f"Imagen API error: {error_detail}")

        result = response.json()
        generated_images = result.get("generatedImages", [])
        if not generated_images:
            raise Exception("No image data returned from Imagen 4")

        b64_image = generated_images[0].get("imageData")
        if not b64_image:
            raise Exception("No image data in Imagen 4 response")

        return await self._process_image_result(
            b64_image, prompt, prompt, "Imagen 4", 
            f"{width}x{height}", quality, style, save_to_file, filename
        )

    async def _process_image_result(self, b64_image, original_prompt, processed_prompt, provider, size, quality, style, save_to_file, filename):
        """Process and save the generated image."""
        image_bytes = base64.b64decode(b64_image)
        
        response_data = {
            "provider": provider, "original_prompt": original_prompt, "processed_prompt": processed_prompt,
            "size": size, "quality": quality, "style": style, "image_size_bytes": len(image_bytes)
        }

        if save_to_file:
            try:
                if not filename:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    provider_prefix = provider.lower().replace(" ", "_").replace("-", "_")
                    filename = f"generated_image_{provider_prefix}_{timestamp}"
                
                filename = filename.rsplit('.', 1)[0] if filename.endswith(('.png', '.jpg', '.jpeg')) else filename
                file_path = f"generated_images/{filename}.png"
                
                os.makedirs("generated_images", exist_ok=True)
                with open(file_path, 'wb') as f:
                    f.write(image_bytes)
                
                response_data.update({"saved_to": file_path, "file_size_kb": round(len(image_bytes) / 1024, 2)})
                logger.info(f"Image saved to: {file_path}")
                
            except Exception as save_error:
                logger.error(f"Failed to save image file: {save_error}")
                response_data["save_error"] = str(save_error)

        try:
            db = DBConnection()
            public_url = await db.upload_base64_image(b64_image, "generated-images")
            response_data["public_url"] = public_url
            logger.info(f"Image uploaded to storage: {public_url}")
        except Exception as upload_error:
            logger.warning(f"Failed to upload image to storage: {upload_error}")

        success_message = f"Successfully generated image using {provider}!\n\n"
        success_message += f"**Original Prompt:** {original_prompt}\n"
        if processed_prompt != original_prompt:
            success_message += f"**Enhanced Prompt:** {processed_prompt}\n"
        success_message += f"**Specifications:** {size}, {quality} quality, {style} style\n"
        
        if response_data.get("saved_to"):
            success_message += f"**Saved to:** {response_data['saved_to']} ({response_data['file_size_kb']} KB)\n"
        if response_data.get("public_url"):
            success_message += f"**Public URL:** {response_data['public_url']}\n"
        
        success_message += "\nThe image has been generated and is ready for use!"

        return self.success_response(success_message, response_data) 