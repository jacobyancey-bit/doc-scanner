import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_gradient(width, height, color_top, color_bottom):
    base = Image.new('RGBA', (width, height), color_top)
    top_r, top_g, top_b = color_top[:3]
    bot_r, bot_g, bot_b = color_bottom[:3]
    
    gradient = Image.new('RGBA', (width, height))
    draw = ImageDraw.Draw(gradient)
    for y in range(height):
        ratio = y / float(height)
        r = int(top_r + (bot_r - top_r) * ratio)
        g = int(top_g + (bot_g - top_g) * ratio)
        b = int(top_b + (bot_b - top_b) * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    return gradient

def draw_rounded_rect(draw, bbox, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(bbox, radius=radius, fill=fill, outline=outline, width=width)

def render_device_frame(width, height, device_type="phone"):
    """
    Renders an elegant smartphone or tablet device frame with content.
    """
    frame = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    
    # Outer bezel
    bezel_radius = 48 if device_type == "phone" else 36
    draw_rounded_rect(draw, (0, 0, width, height), bezel_radius, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=4)
    
    # Inner screen area
    border = 12 if device_type == "phone" else 18
    screen_w = width - border * 2
    screen_h = height - border * 2
    
    # Camera punch hole
    if device_type == "phone":
        hole_r = 8
        draw.ellipse((width//2 - hole_r, border + 8, width//2 + hole_r, border + 8 + hole_r*2), fill=(15, 23, 42, 255))
        
    return frame, (border, border, width - border, height - border)

def render_screenshot_slide(
    target_w, target_h,
    headline, subheadline,
    slide_type,
    device_type="phone"
):
    """
    Renders a complete Google Play Store presentation slide.
    """
    # Background: dark slate navy gradient
    canvas = create_gradient(target_w, target_h, (15, 23, 42), (9, 13, 22))
    draw = ImageDraw.Draw(canvas)
    
    # Ambient glowing light circle in background
    glow = Image.new('RGBA', (target_w, target_h), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse(
        (target_w * 0.1, target_h * 0.35, target_w * 0.9, target_h * 0.85),
        fill=(2, 132, 199, 45)
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=80))
    canvas = Image.alpha_composite(canvas, glow)
    draw = ImageDraw.Draw(canvas)
    
    # Fonts
    scale = target_w / 1080.0
    title_size = int(62 * scale)
    subtitle_size = int(32 * scale)
    
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", title_size)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", subtitle_size)
        font_badge = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(24 * scale))
        font_card_title = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(32 * scale))
        font_card_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", int(22 * scale))
    except:
        font_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", title_size)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", subtitle_size)
        font_badge = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", int(24 * scale))
        font_card_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", int(32 * scale))
        font_card_sub = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", int(22 * scale))

    # Pill badge at very top
    badge_text = "DOCSCAN • SECURE & OFFLINE"
    b_left, b_top, b_right, b_bottom = draw.textbbox((0, 0), badge_text, font=font_badge)
    b_w = b_right - b_left + int(40 * scale)
    b_h = b_bottom - b_top + int(18 * scale)
    badge_x = (target_w - b_w) // 2
    badge_y = int(60 * scale)
    draw_rounded_rect(draw, (badge_x, badge_y, badge_x + b_w, badge_y + b_h), int(20 * scale), fill=(30, 41, 59, 200), outline=(56, 189, 248, 180), width=int(2*scale))
    draw.text((badge_x + int(20 * scale), badge_y + int(7 * scale)), badge_text, fill=(56, 189, 248, 255), font=font_badge)

    # Headline
    hl_left, hl_top, hl_right, hl_bottom = draw.textbbox((0, 0), headline, font=font_title)
    hl_w = hl_right - hl_left
    draw.text(((target_w - hl_w) // 2, int(130 * scale)), headline, fill=(248, 250, 252, 255), font=font_title)

    # Subheadline
    sub_left, sub_top, sub_right, sub_bottom = draw.textbbox((0, 0), subheadline, font=font_sub)
    sub_w = sub_right - sub_left
    draw.text(((target_w - sub_w) // 2, int(210 * scale)), subheadline, fill=(148, 163, 184, 255), font=font_sub)

    # Device Mockup Placement
    if device_type == "phone":
        dev_w = int(720 * scale)
        dev_h = int(1480 * scale)
    elif device_type == "tablet_7":
        dev_w = int(820 * scale)
        dev_h = int(1360 * scale)
    else: # tablet_10
        dev_w = int(1080 * scale)
        dev_h = int(1720 * scale)
        
    dev_x = (target_w - dev_w) // 2
    dev_y = int(310 * scale)
    
    # Render device frame
    device_img, screen_box = render_device_frame(dev_w, dev_h, device_type)
    
    # Render device screen content according to slide_type
    screen_w = screen_box[2] - screen_box[0]
    screen_h = screen_box[3] - screen_box[1]
    screen = Image.new('RGBA', (screen_w, screen_h), (15, 23, 42, 255))
    s_draw = ImageDraw.Draw(screen)
    
    # Screen Header Bar
    s_draw.rectangle((0, 0, screen_w, int(70 * scale)), fill=(30, 41, 59, 255))
    s_draw.text((int(24 * scale), int(18 * scale)), "DocScan", fill=(248, 250, 252, 255), font=font_card_title)
    
    if slide_type == "auto_crop":
        # Camera scanner interface simulation
        s_draw.rectangle((0, int(70 * scale), screen_w, screen_h), fill=(10, 15, 25, 255))
        
        # Angled document page
        doc_x1 = int(screen_w * 0.15)
        doc_y1 = int(screen_h * 0.22)
        doc_x2 = int(screen_w * 0.85)
        doc_y2 = int(screen_h * 0.72)
        
        # Paper sheet with realistic lines
        s_draw.rectangle((doc_x1, doc_y1, doc_x2, doc_y2), fill=(241, 245, 249, 255))
        for line_y in range(doc_y1 + int(40*scale), doc_y2 - int(40*scale), int(36*scale)):
            s_draw.line([(doc_x1 + int(24*scale), line_y), (doc_x2 - int(24*scale), line_y)], fill=(203, 213, 225, 255), width=int(4*scale))
            
        # Glowing green/cyan auto-detection bounding box
        s_draw.rectangle((doc_x1 - 8, doc_y1 - 8, doc_x2 + 8, doc_y2 + 8), outline=(56, 189, 248, 255), width=int(5*scale))
        
        # Target corner marks
        corner_len = int(32 * scale)
        cw = int(6 * scale)
        # Top-left
        s_draw.line([(doc_x1 - 8, doc_y1 - 8), (doc_x1 - 8 + corner_len, doc_y1 - 8)], fill=(34, 197, 94, 255), width=cw)
        s_draw.line([(doc_x1 - 8, doc_y1 - 8), (doc_x1 - 8, doc_y1 - 8 + corner_len)], fill=(34, 197, 94, 255), width=cw)
        # Top-right
        s_draw.line([(doc_x2 + 8, doc_y1 - 8), (doc_x2 + 8 - corner_len, doc_y1 - 8)], fill=(34, 197, 94, 255), width=cw)
        s_draw.line([(doc_x2 + 8, doc_y1 - 8), (doc_x2 + 8, doc_y1 - 8 + corner_len)], fill=(34, 197, 94, 255), width=cw)
        
        # Cyan laser scan line
        scan_y = (doc_y1 + doc_y2) // 2
        s_draw.line([(doc_x1 - 20, scan_y), (doc_x2 + 20, scan_y)], fill=(56, 189, 248, 255), width=int(6*scale))
        
        # Bottom shutter button
        shutter_r = int(38 * scale)
        s_draw.ellipse((screen_w//2 - shutter_r, int(screen_h * 0.85) - shutter_r, screen_w//2 + shutter_r, int(screen_h * 0.85) + shutter_r), fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=int(4*scale))

    elif slide_type == "pdf_export":
        # Document library list
        docs = [
            ("Consulting_Agreement_Signed.pdf", "3 pages • Today, 2:15 PM"),
            ("Business_Trip_Receipts.pdf", "8 pages • Yesterday"),
            ("Office_Lease_Contract.pdf", "14 pages • Nov 18, 2026"),
            ("Health_Insurance_Policy.pdf", "4 pages • Nov 12, 2026")
        ]
        
        card_y = int(90 * scale)
        for title, meta in docs:
            card_h = int(140 * scale)
            draw_rounded_rect(s_draw, (int(20*scale), card_y, screen_w - int(20*scale), card_y + card_h), int(16*scale), fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=2)
            
            # Thumbnail icon
            thumb_w = int(60 * scale)
            thumb_h = int(80 * scale)
            draw_rounded_rect(s_draw, (int(36*scale), card_y + int(30*scale), int(36*scale) + thumb_w, card_y + int(30*scale) + thumb_h), int(8*scale), fill=(2, 132, 199, 255))
            s_draw.text((int(48*scale), card_y + int(50*scale)), "PDF", fill=(255, 255, 255, 255), font=font_badge)
            
            # Texts
            s_draw.text((int(115*scale), card_y + int(30*scale)), title[:24], fill=(248, 250, 252, 255), font=font_card_title)
            s_draw.text((int(115*scale), card_y + int(75*scale)), meta, fill=(148, 163, 184, 255), font=font_card_sub)
            
            # Share Pill
            btn_w = int(110 * scale)
            btn_h = int(40 * scale)
            btn_x = screen_w - int(36*scale) - btn_w
            btn_y = card_y + int(50*scale)
            draw_rounded_rect(s_draw, (btn_x, btn_y, btn_x + btn_w, btn_y + btn_h), int(8*scale), fill=(56, 189, 248, 40), outline=(56, 189, 248, 200), width=1)
            s_draw.text((btn_x + int(18*scale), btn_y + int(8*scale)), "SHARE", fill=(56, 189, 248, 255), font=font_badge)
            
            card_y += card_h + int(18 * scale)

    elif slide_type == "privacy":
        # Privacy & Offline showcase
        s_draw.rectangle((0, int(70 * scale), screen_w, screen_h), fill=(15, 23, 42, 255))
        
        # Shield Graphic
        shield_cx = screen_w // 2
        shield_cy = int(screen_h * 0.32)
        s_draw.ellipse((shield_cx - int(90*scale), shield_cy - int(90*scale), shield_cx + int(90*scale), shield_cy + int(90*scale)), fill=(34, 197, 94, 30), outline=(34, 197, 94, 255), width=int(4*scale))
        s_draw.text((shield_cx - int(24*scale), shield_cy - int(35*scale)), "🛡️", fill=(255, 255, 255, 255), font=font_title)
        
        # Security badges
        badges = [
            "✔ 100% On-Device Processing",
            "✔ Zero Cloud Data Mining",
            "✔ No Account or Login Required",
            "✔ Encrypted Local Sandbox"
        ]
        
        by = int(screen_h * 0.52)
        for b in badges:
            draw_rounded_rect(s_draw, (int(30*scale), by, screen_w - int(30*scale), by + int(65*scale)), int(12*scale), fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=1)
            s_draw.text((int(50*scale), by + int(15*scale)), b, fill=(248, 250, 252, 255), font=font_card_title)
            by += int(85 * scale)

    elif slide_type == "web_sync":
        # Web sync QR pairing
        s_draw.rectangle((0, int(70 * scale), screen_w, screen_h), fill=(15, 23, 42, 255))
        
        # Connected notice
        draw_rounded_rect(s_draw, (int(30*scale), int(110*scale), screen_w - int(30*scale), int(210*scale)), int(16*scale), fill=(2, 132, 199, 40), outline=(56, 189, 248, 255), width=2)
        s_draw.text((int(50*scale), int(130*scale)), "🔗 Desktop Browser Connected", fill=(56, 189, 248, 255), font=font_card_title)
        s_draw.text((int(50*scale), int(170*scale)), "Session: active on dangling-dice-studios.com", fill=(148, 163, 184, 255), font=font_card_sub)
        
        # Transfer animation graphic
        mid_y = int(screen_h * 0.5)
        s_draw.text((screen_w//2 - int(60*scale), mid_y - int(80*scale)), "📱 ➔ 💻", font=font_title, fill=(248, 250, 252, 255))
        s_draw.text((int(60*scale), mid_y + int(20*scale)), "Instant QR Code Pairing", font=font_card_title, fill=(248, 250, 252, 255))
        s_draw.text((int(60*scale), mid_y + int(70*scale)), "Scan from your phone, and the PDF appears\nimmediately in your desktop browser window.", font=font_card_sub, fill=(148, 163, 184, 255))

    # Paste screen into device frame
    device_img.paste(screen, (screen_box[0], screen_box[1]))
    
    # Composite device into canvas
    canvas.paste(device_img, (dev_x, dev_y), device_img)
    
    return canvas

def generate_all_assets():
    base_dir = "C:/Users/jacob/Projects/doc-scanner/assets/playstore"
    os.makedirs(f"{base_dir}/phone", exist_ok=True)
    os.makedirs(f"{base_dir}/tablet-7", exist_ok=True)
    os.makedirs(f"{base_dir}/tablet-10", exist_ok=True)
    
    slides = [
        ("auto_crop", "AUTOMATIC EDGE DETECTION", "Smart auto-crop, perspective flattening & shadow removal"),
        ("pdf_export", "MULTI-PAGE PDF EXPORT", "Stitch receipts, contracts & notes into clean PDFs"),
        ("privacy", "100% PRIVATE & ON-DEVICE", "Zero account signups • No cloud uploads • 100% offline"),
        ("web_sync", "DESKTOP WEB PAIRING", "Beam scanned documents straight to your desktop browser")
    ]
    
    # 1. Phone Screenshots (1080 x 2400)
    print("Generating Phone Screenshots (1080x2400)...")
    for i, (stype, title, sub) in enumerate(slides):
        img = render_screenshot_slide(1080, 2400, title, sub, stype, device_type="phone")
        out_path = f"{base_dir}/phone/screenshot_{i+1}_{stype}.png"
        img.save(out_path, format="PNG", optimize=True)
        print(f"Saved: {out_path}")
        
    # 2. 7-inch Tablet Screenshots (1200 x 1920)
    print("Generating 7-inch Tablet Screenshots (1200x1920)...")
    for i, (stype, title, sub) in enumerate(slides):
        img = render_screenshot_slide(1200, 1920, title, sub, stype, device_type="tablet_7")
        out_path = f"{base_dir}/tablet-7/screenshot_{i+1}_{stype}.png"
        img.save(out_path, format="PNG", optimize=True)
        print(f"Saved: {out_path}")
        
    # 3. 10-inch Tablet Screenshots (1600 x 2560)
    print("Generating 10-inch Tablet Screenshots (1600x2560)...")
    for i, (stype, title, sub) in enumerate(slides):
        img = render_screenshot_slide(1600, 2560, title, sub, stype, device_type="tablet_10")
        out_path = f"{base_dir}/tablet-10/screenshot_{i+1}_{stype}.png"
        img.save(out_path, format="PNG", optimize=True)
        print(f"Saved: {out_path}")

    print("\nAll Play Store screenshot assets generated successfully!")

if __name__ == "__main__":
    generate_all_assets()
