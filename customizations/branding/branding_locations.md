# Luciq Branding - Locations and Implementation

## Overview
Complete rebrand from "Suna" to "Luciq AI" throughout the application, including logos, metadata, names, and descriptions.

## Frontend Branding Files

### 1. Application Metadata
**File**: `frontend/src/app/layout.tsx`
- **Line ~25-107**: Complete OpenGraph, Twitter, and metadata configuration
- All titles, descriptions, and social media references changed to "Luciq AI"
- Keywords updated for AI assistant positioning
- Twitter handle: @luciqai

### 2. Site Configuration
**File**: `frontend/src/lib/site.ts`
- **Line ~1-9**: Core site config with Luciq branding
- URL: https://luciqai.com
- GitHub: https://github.com/ItsRichPoorGirl/Luciq-AI-Agent

### 3. Homepage Configuration  
**File**: `frontend/src/lib/home.tsx`
- **Line ~51-105**: Complete hero section configuration
- Title: "Luciq, your AI Employee."
- Description: "Your personal AI employee that acts on your behalf."
- Input placeholder: "Ask Luciq to..."
- GitHub URL updated

### 4. Logo Component
**File**: `frontend/src/components/sidebar/luciq-logo.tsx`
- **Line ~1-32**: Dedicated Luciq logo component
- Uses `/luciq-logo.png` asset
- Alt text: "Luciq AI"

### 5. Main Landing Page
**File**: `frontend/src/app/(home)/page.tsx` 
- **Line ~14-683**: Complete homepage with Luciq branding
- Logo usage: `/luciq-logo.png` (multiple instances)
- All text references to "Luciq AI"
- Hero section: "Your Intelligent Assistant Fully Automated"
- Features, testimonials, and footer all branded as Luciq

### 6. Navigation Component
**File**: `frontend/src/components/home/sections/navbar.tsx`
- **Line ~55-235**: Navigation with Luciq logo and branding
- Logo path: `/luciq-logo.png`
- Text: "Luciq AI"

### 7. Hero Section Component
**File**: `frontend/src/components/home/sections/hero-section.tsx`
- **Line ~302-315**: Hero title "Luciq, your AI Employee."

### 8. Dashboard Layouts
**File**: `frontend/src/app/(dashboard)/*/layout.tsx`
- Multiple files with "| Luciq" suffix in titles
- OpenGraph titles include "Luciq" branding

### 9. Thread/Conversation UI
**File**: `frontend/src/components/thread/content/PlaybackControls.tsx`
- **Line ~67-441**: Playback controls with Luciq logo
- Logo path: `/luciq-logo.png`
- Alt text: "Luciq AI"

## Required Assets

### Logo Files
- `/luciq-logo.png` - Main logo (various sizes: 16x16, 24x24, 32x32, 40x40)
- `/favicon.png` - Favicon
- `/banner.png` - Social media banner (1200x630)
- `/og-image.png` - OpenGraph image

## Domain Configuration
- Primary domain: `https://luciqai.com`
- GitHub repository: `https://github.com/ItsRichPoorGirl/Luciq-AI-Agent`
- Social media handle: `@luciqai`

## Key Brand Messages
1. **Primary**: "Luciq, your AI Employee"
2. **Secondary**: "Your Intelligent Assistant Fully Automated" 
3. **Description**: "Your personal AI employee that acts on your behalf"
4. **Features Focus**: Automation, data analysis, content creation

## Environment Variables
- No specific environment variables for branding (all hardcoded)

## Restoration Priority
🟢 **MEDIUM** - Important for user experience but can be applied after core functionality is working.

## Notes
- Complete rebrand from original "Suna" to "Luciq AI"
- All social media and marketing copy updated
- Logo assets must be preserved and copied to new upstream sync
- Some backup files exist in `backup-v1.6-homepage/` directory 