"""
Advanced prompt enhancement for Google's Imagen 4 model.
Provides content-specific optimization, style enhancements, and quality improvements.
"""

import re
from typing import List, Dict, Tuple, Optional
from enum import Enum

class ContentType(Enum):
    PORTRAIT = "portrait"
    LANDSCAPE = "landscape"
    PRODUCT = "product"
    YOUTUBE_THUMBNAIL = "youtube_thumbnail"
    MARKETING = "marketing"
    ARTISTIC = "artistic"
    TECHNICAL = "technical"
    LIFESTYLE = "lifestyle"
    GENERAL = "general"

class ImagenPromptEnhancer:
    """Advanced prompt enhancement specifically optimized for Google's Imagen 4 model."""
    
    def __init__(self):
        self.content_keywords = {
            ContentType.PORTRAIT: ["person", "portrait", "face", "human", "people", "man", "woman", "child", "expression", "headshot"],
            ContentType.YOUTUBE_THUMBNAIL: ["youtube", "thumbnail", "clickbait", "shocking", "reaction", "viral", "click", "dramatic"],
            ContentType.PRODUCT: ["product", "ecommerce", "shopping", "merchandise", "item", "commercial", "brand"],
            ContentType.MARKETING: ["advertisement", "marketing", "brand", "campaign", "promotional", "lifestyle"],
            ContentType.LANDSCAPE: ["landscape", "nature", "outdoor", "scenery", "view", "horizon", "mountains", "forest"],
            ContentType.ARTISTIC: ["artistic", "painting", "drawing", "abstract", "creative", "fine art", "illustration"],
            ContentType.TECHNICAL: ["technical", "diagram", "blueprint", "schematic", "detailed", "engineering"],
            ContentType.LIFESTYLE: ["lifestyle", "modern", "contemporary", "elegant", "sophisticated", "trendy"]
        }
        
        self.style_enhancements = {
            "photorealistic": {
                "modifiers": ["photorealistic", "ultra-realistic", "lifelike", "authentic", "genuine"],
                "lighting": ["natural lighting", "professional lighting", "soft lighting", "studio lighting"],
                "quality": ["high resolution", "crisp details", "sharp focus", "professional quality"]
            },
            "artistic": {
                "modifiers": ["artistic interpretation", "creative style", "expressive", "stylized"],
                "techniques": ["brushwork", "artistic composition", "visual harmony", "creative flair"],
                "quality": ["masterpiece quality", "artistic excellence", "creative vision"]
            },
            "vivid": {
                "modifiers": ["vibrant colors", "bold", "striking", "eye-catching", "dynamic"],
                "effects": ["saturated colors", "high contrast", "vivid details", "energetic"],
                "quality": ["visually impactful", "attention-grabbing", "memorable"]
            },
            "natural": {
                "modifiers": ["natural", "organic", "authentic", "realistic"],
                "tones": ["natural colors", "balanced tones", "harmonious palette"],
                "quality": ["clean", "pure", "unprocessed look"]
            }
        }
        
        self.content_specific_enhancements = {
            ContentType.PORTRAIT: {
                "focus": ["sharp focus on eyes", "detailed facial features", "expressive eyes", "natural skin texture"],
                "lighting": ["flattering lighting", "soft shadows", "even skin tone", "professional portrait lighting"],
                "composition": ["headshot composition", "proper framing", "engaging expression"]
            },
            ContentType.YOUTUBE_THUMBNAIL: {
                "visual": ["bold visual elements", "high contrast", "eye-catching colors", "clear focal point"],
                "text_space": ["space for text overlay", "uncluttered background", "clear subject"],
                "engagement": ["dramatic expression", "action pose", "compelling visual story"]
            },
            ContentType.PRODUCT: {
                "presentation": ["clean product shot", "professional presentation", "minimal background"],
                "lighting": ["even lighting", "no harsh shadows", "color accuracy", "detailed textures"],
                "angle": ["optimal product angle", "clear visibility", "commercial quality"]
            },
            ContentType.LANDSCAPE: {
                "depth": ["depth of field", "layered composition", "atmospheric perspective"],
                "lighting": ["golden hour lighting", "dramatic sky", "natural colors", "scenic beauty"],
                "elements": ["compelling foreground", "interesting clouds", "natural textures"]
            }
        }
        
        self.quality_boosters = [
            "high quality", "professional grade", "masterful execution", "premium quality",
            "exceptional detail", "refined aesthetics", "superior craftsmanship"
        ]
        
        self.negative_prompts = {
            "general": ["blurry", "low quality", "pixelated", "distorted", "amateur"],
            "portrait": ["asymmetrical features", "unnatural skin", "poor lighting", "unflattering angle"],
            "product": ["cluttered background", "poor lighting", "reflections", "shadows on product"],
            "artistic": ["generic", "uninspired", "lack of creativity", "poor composition"]
        }

    def detect_content_type(self, prompt: str) -> ContentType:
        """Detect the primary content type from the prompt."""
        prompt_lower = prompt.lower()
        
        # Count keyword matches for each content type
        type_scores = {}
        for content_type, keywords in self.content_keywords.items():
            score = sum(1 for keyword in keywords if keyword in prompt_lower)
            if score > 0:
                type_scores[content_type] = score
        
        # Return the type with the highest score, or GENERAL if no clear match
        if type_scores:
            return max(type_scores.keys(), key=lambda k: type_scores[k])
        return ContentType.GENERAL

    def enhance_for_imagen4(self, 
                           prompt: str, 
                           style: str = "natural", 
                           quality: str = "high",
                           content_type: Optional[ContentType] = None) -> Tuple[str, str]:
        """
        Enhance a prompt specifically for Imagen 4 generation.
        
        Args:
            prompt: Original prompt
            style: Visual style (natural, photorealistic, artistic, vivid)
            quality: Quality level (standard, hd, high)
            content_type: Optional content type override
            
        Returns:
            Tuple of (enhanced_prompt, enhancement_log)
        """
        if not content_type:
            content_type = self.detect_content_type(prompt)
        
        enhancement_log = f"Detected content type: {content_type.value}\n"
        
        # Start with the original prompt
        enhanced = prompt.strip()
        
        # Add style-specific enhancements
        if style in self.style_enhancements:
            style_data = self.style_enhancements[style]
            
            # Add primary style modifiers
            modifiers = style_data.get("modifiers", [])
            if modifiers:
                enhanced += f", {modifiers[0]}"
                enhancement_log += f"Added style modifier: {modifiers[0]}\n"
            
            # Add lighting enhancements for appropriate styles
            if "lighting" in style_data and content_type in [ContentType.PORTRAIT, ContentType.PRODUCT]:
                lighting = style_data["lighting"][0]
                enhanced += f", {lighting}"
                enhancement_log += f"Added lighting: {lighting}\n"
        
        # Add content-specific enhancements
        if content_type in self.content_specific_enhancements:
            content_data = self.content_specific_enhancements[content_type]
            
            # Add focus enhancements
            if "focus" in content_data:
                focus_enhancement = content_data["focus"][0]
                enhanced += f", {focus_enhancement}"
                enhancement_log += f"Added focus: {focus_enhancement}\n"
            
            # Add composition enhancements
            if "composition" in content_data:
                composition = content_data["composition"][0]
                enhanced += f", {composition}"
                enhancement_log += f"Added composition: {composition}\n"
        
        # Add quality enhancements based on quality parameter
        if quality in ["hd", "high"]:
            quality_boost = self.quality_boosters[0]  # "high quality"
            enhanced += f", {quality_boost}"
            enhancement_log += f"Added quality boost: {quality_boost}\n"
        
        # Add Imagen 4 specific optimizations
        enhanced += ", optimized for Imagen 4"
        enhancement_log += "Added Imagen 4 optimization\n"
        
        return enhanced, enhancement_log

    def enhance_for_youtube_thumbnail(self, prompt: str) -> Tuple[str, str]:
        """Specialized enhancement for YouTube thumbnails."""
        enhancement_log = "YouTube thumbnail optimization\n"
        
        enhanced = prompt.strip()
        
        # Add YouTube-specific elements
        youtube_enhancements = [
            "eye-catching composition",
            "high contrast colors", 
            "dramatic lighting",
            "engaging facial expression",
            "clear focal point",
            "space for text overlay",
            "clickable thumbnail style"
        ]
        
        # Add key enhancements
        for enhancement in youtube_enhancements[:3]:  # Use first 3
            enhanced += f", {enhancement}"
            enhancement_log += f"Added: {enhancement}\n"
        
        # Add quality and platform optimization
        enhanced += ", 1920x1080 thumbnail format, optimized for click-through rate"
        enhancement_log += "Added platform optimization\n"
        
        return enhanced, enhancement_log

    def enhance_for_product_photography(self, prompt: str, style: str = "photorealistic") -> Tuple[str, str]:
        """Specialized enhancement for product photography."""
        enhancement_log = "Product photography optimization\n"
        
        enhanced = prompt.strip()
        
        # Product-specific enhancements
        product_enhancements = [
            "professional product photography",
            "studio lighting setup",
            "clean white background",
            "sharp product details",
            "accurate colors",
            "commercial quality",
            "e-commerce ready"
        ]
        
        # Add key enhancements
        for enhancement in product_enhancements[:4]:  # Use first 4
            enhanced += f", {enhancement}"
            enhancement_log += f"Added: {enhancement}\n"
        
        return enhanced, enhancement_log

    def enhance_for_portrait(self, prompt: str, style: str = "photorealistic") -> Tuple[str, str]:
        """Specialized enhancement for portrait photography."""
        enhancement_log = "Portrait photography optimization\n"
        
        enhanced = prompt.strip()
        
        # Portrait-specific enhancements
        portrait_enhancements = [
            "professional portrait photography",
            "sharp focus on eyes",
            "natural facial expression", 
            "flattering lighting",
            "detailed skin texture",
            "professional headshot quality",
            "engaging eye contact"
        ]
        
        # Add key enhancements based on style
        if style == "photorealistic":
            for enhancement in portrait_enhancements[:4]:
                enhanced += f", {enhancement}"
                enhancement_log += f"Added: {enhancement}\n"
        elif style == "artistic":
            enhanced += ", artistic portrait style, creative composition, expressive lighting"
            enhancement_log += "Added artistic portrait elements\n"
        
        return enhanced, enhancement_log

    def get_negative_prompt(self, content_type: ContentType) -> str:
        """Get appropriate negative prompts for the content type."""
        negatives = self.negative_prompts.get("general", [])
        
        if content_type in [ContentType.PORTRAIT]:
            negatives.extend(self.negative_prompts.get("portrait", []))
        elif content_type == ContentType.PRODUCT:
            negatives.extend(self.negative_prompts.get("product", []))
        elif content_type == ContentType.ARTISTIC:
            negatives.extend(self.negative_prompts.get("artistic", []))
        
        return ", ".join(negatives[:5])  # Limit to 5 negative prompts

    def optimize_prompt_length(self, prompt: str, max_length: int = 400) -> str:
        """Optimize prompt length while preserving key information."""
        if len(prompt) <= max_length:
            return prompt
        
        # Split into components
        parts = [part.strip() for part in prompt.split(",")]
        
        # Keep the most important parts (first part is usually the main subject)
        essential_parts = parts[:1]  # Always keep the main subject
        optional_parts = parts[1:]
        
        # Add optional parts while staying under limit
        current_prompt = essential_parts[0]
        for part in optional_parts:
            test_prompt = current_prompt + ", " + part
            if len(test_prompt) <= max_length:
                current_prompt = test_prompt
            else:
                break
        
        return current_prompt

# Global instance for easy import
imagen_enhancer = ImagenPromptEnhancer() 