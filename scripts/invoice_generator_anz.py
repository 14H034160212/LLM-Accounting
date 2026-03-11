import os
import random
import json
import uuid
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------------------
# Config & Data
# ---------------------------------------------------------------------------
OUTPUT_DIR = "data/fatura_raw/FATURA_EXTRACT/invoices_dataset_final/images_anz"
os.makedirs(OUTPUT_DIR, exist_ok=True)

AU_SELLERS = [
    "Melbourne Coffee Roasters", "Sydney Tech Solutions", "Brisbane Construction Group",
    "Perth Mining Supplies", "Adelaide Wine Logistics", "Hobart Creative Agency"
]
NZ_SELLERS = [
    "Auckland Cloud Services", "Wellington Dairy Co", "Christchurch Rugged Gear",
    "Dunedin Academic Books", "Nelson Fruit Exports", "Queenstown Adventure Tours"
]

ITEMS = [
    ("Software Subscription", 50.0, 500.0), ("Consulting Hour", 150.0, 300.0),
    ("Hardware Component", 20.0, 1000.0), ("Office Supplies", 5.0, 50.0),
    ("Cloud Infrastructure", 100.0, 5000.0), ("Training Session", 200.0, 1000.0)
]

def generate_abn():
    return f"{random.randint(10,99)} {random.randint(100,999)} {random.randint(100,999)} {random.randint(100,999)}"

def generate_nzbn():
    return f"{random.randint(9429000000000, 9429999999999)}"

def generate_invoice(region="AU"):
    # Setup fonts (standard system fonts)
    try:
        font_main = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSansMono-Bold.ttf", 20)
        font_header = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf", 36)
        font_label = ImageFont.truetype("/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf", 20)
    except:
        font_main = font_header = font_label = ImageFont.load_default()

    # Create canvas (A4 ratio approx)
    width, height = 1200, 1600
    img = Image.new('RGB', (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Header
    seller = random.choice(AU_SELLERS if region == "AU" else NZ_SELLERS)
    draw.text((50, 50), "TAX INVOICE", font=font_header, fill=(0, 0, 0))
    draw.text((50, 100), seller, font=font_label, fill=(0, 0, 0))
    
    if region == "AU":
        draw.text((50, 130), f"ABN: {generate_abn()}", font=font_main, fill=(50, 50, 50))
        currency = "AUD"
        gst_rate = 0.10
    else:
        draw.text((50, 130), f"NZBN: {generate_nzbn()}", font=font_main, fill=(50, 50, 50))
        currency = "NZD"
        gst_rate = 0.15

    # Invoice Details
    inv_num = f"INV-{random.randint(10000, 99999)}"
    date = (datetime.now() - timedelta(days=random.randint(0, 365))).strftime("%Y-%m-%d")
    draw.text((800, 50), f"Invoice #: {inv_num}", font=font_main, fill=(0, 0, 0))
    draw.text((800, 80), f"Date: {date}", font=font_main, fill=(0, 0, 0))

    # Line Items
    draw.line((50, 300, 1150, 300), fill=(0, 0, 0), width=2)
    draw.text((50, 270), "Description", font=font_label, fill=(0, 0, 0))
    draw.text((600, 270), "Qty", font=font_label, fill=(0, 0, 0))
    draw.text((800, 270), "Unit Price", font=font_label, fill=(0, 0, 0))
    draw.text((1000, 270), "Total", font=font_label, fill=(0, 0, 0))

    y = 330
    subtotal = 0
    for _ in range(random.randint(2, 6)):
        item, min_p, max_p = random.choice(ITEMS)
        qty = random.randint(1, 10)
        price = round(random.uniform(min_p, max_p), 2)
        total = round(qty * price, 2)
        subtotal += total
        
        draw.text((50, y), item, font=font_main, fill=(0, 0, 0))
        draw.text((600, y), str(qty), font=font_main, fill=(0, 0, 0))
        draw.text((800, y), f"${price:.2f}", font=font_main, fill=(0, 0, 0))
        draw.text((1000, y), f"${total:.2f}", font=font_main, fill=(0, 0, 0))
        y += 40

    gst = round(subtotal * gst_rate, 2)
    grand_total = round(subtotal + gst, 2)

    # Footer
    draw.line((800, y + 20, 1150, y + 20), fill=(0, 0, 0), width=1)
    y += 40
    draw.text((800, y), "Subtotal:", font=font_main, fill=(0, 0, 0))
    draw.text((1000, y), f"${subtotal:.2f}", font=font_main, fill=(0, 0, 0))
    y += 40
    draw.text((800, y), f"GST ({int(gst_rate*100)}%):", font=font_main, fill=(0, 0, 0))
    draw.text((1000, y), f"${gst:.2f}", font=font_main, fill=(0, 0, 0))
    y += 40
    draw.text((800, y), "Total Due:", font=font_label, fill=(0, 0, 0))
    draw.text((1000, y), f"${grand_total:.2f} {currency}", font=font_label, fill=(0, 0, 0))

    # Save
    filename = f"{region}_{inv_num}_{uuid.uuid4().hex[:6]}.jpg"
    img.save(os.path.join(OUTPUT_DIR, filename), "JPEG", quality=90)
    return filename

if __name__ == "__main__":
    print(f"Generating localized invoices in {OUTPUT_DIR}...")
    for i in range(500):
        f = generate_invoice("AU")
        if i % 5 == 0: print(f"Generated {f}")
    for i in range(500):
        f = generate_invoice("NZ")
        if i % 5 == 0: print(f"Generated {f}")
    print("Done generating sample batch.")
