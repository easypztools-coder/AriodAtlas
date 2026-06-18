import os
from PIL import Image

def analyze():
    img_path = r"C:\Users\nicho\.gemini\antigravity-ide\brain\e10f58cc-f96b-4e09-98c9-d6e52f55db2e\media__1781821023565.png"
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    
    # We want to check the distribution of pixel values.
    # Let's inspect a horizontal line passing through the middle of the logo.
    mid_y = height // 2
    row_pixels = [img.getpixel((x, mid_y)) for x in range(0, width, 10)]
    print(f"Image Size: {width}x{height}")
    print("Sample pixels across middle row:")
    for i, p in enumerate(row_pixels):
        x = i * 10
        # If it's not close to background, print it
        if p[0] > 20 or p[1] > 25:
            print(f"X={x}: {p}")

if __name__ == "__main__":
    analyze()
