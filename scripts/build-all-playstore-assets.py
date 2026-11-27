import os
import shutil
from PIL import Image

def process_icon_and_banner():
    playstore_dir = "C:/Users/jacob/Projects/doc-scanner/assets/playstore"
    assets_dir = "C:/Users/jacob/Projects/doc-scanner/assets"
    os.makedirs(playstore_dir, exist_ok=True)
    
    # 1. Process 512x512 Icon
    icon_src = "C:/Users/jacob/.gemini/antigravity/brain/f6f49ed7-bc18-4f3e-a0c0-3577c87baf66/docscan_app_icon_fullbleed_1795742455896.jpg"
    if os.path.exists(icon_src):
        with Image.open(icon_src) as img:
            # Resize with Lanczos high quality filter to exact 512x512
            icon_512 = img.convert("RGBA").resize((512, 512), Image.Resampling.LANCZOS)
            
            # Save 512x512 Google Play Store Icon
            playstore_icon_path = os.path.join(playstore_dir, "icon-512.png")
            icon_512.save(playstore_icon_path, format="PNG", optimize=True)
            print(f"Saved: {playstore_icon_path} ({os.path.getsize(playstore_icon_path)//1024} KB)")
            
            # Save for App icon & adaptive icon
            icon_512.save(os.path.join(assets_dir, "icon.png"), format="PNG")
            icon_512.save(os.path.join(assets_dir, "adaptive-icon.png"), format="PNG")
            print("Updated app icon and adaptive-icon.")
    else:
        print(f"Icon source not found at: {icon_src}")
        
    # 2. Process 1024x500 Feature Graphic
    feature_src = "C:/Users/jacob/.gemini/antigravity/brain/f6f49ed7-bc18-4f3e-a0c0-3577c87baf66/docscan_feature_graphic_v2_1795742458609.jpg"
    if os.path.exists(feature_src):
        with Image.open(feature_src) as img:
            img_rgba = img.convert("RGBA")
            # Target is 1024x500. Calculate center crop / aspect fit
            target_w, target_h = 1024, 500
            src_w, src_h = img_rgba.size
            
            scale = max(target_w / src_w, target_h / src_h)
            new_w = int(src_w * scale)
            new_h = int(src_h * scale)
            
            resized = img_rgba.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Center crop
            left = (new_w - target_w) // 2
            top = (new_h - target_h) // 2
            cropped = resized.crop((left, top, left + target_w, top + target_h))
            
            # Save as 1024x500 PNG & JPEG (under 1024 KB)
            feature_png_path = os.path.join(playstore_dir, "feature-graphic-1024x500.png")
            cropped.save(feature_png_path, format="PNG", optimize=True)
            print(f"Saved: {feature_png_path} ({os.path.getsize(feature_png_path)//1024} KB)")
    else:
        print(f"Feature graphic source not found at: {feature_src}")

if __name__ == "__main__":
    process_icon_and_banner()
