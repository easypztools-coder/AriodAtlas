from PIL import Image

def main():
    img_path = r"C:\Users\nicho\.gemini\antigravity-ide\brain\e10f58cc-f96b-4e09-98c9-d6e52f55db2e\media__1781821023565.png"
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    
    # Create a new image for the output
    out_img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    
    # Process pixels
    for y in range(height):
        for x in range(width):
            r, g, b, a = img.getpixel((x, y))
            
            # Gold signature: R - B is high for gold, low for background
            s = r - b
            
            if s <= 12:
                # Fully transparent background
                alpha = 0
            elif s >= 26:
                # Fully opaque gold
                alpha = 255
            else:
                # Smooth transition
                alpha = int((s - 12) * 255 / (26 - 12))
            
            # Write to output image
            if alpha > 0:
                out_img.putpixel((x, y), (r, g, b, alpha))
                
    # Save the output
    output_path = r"c:\Users\nicho\OneDrive\Documents\Web Development\Aroid Atlas AG\AroidAtlas\public\images\logo.png"
    out_img.save(output_path, "PNG")
    print(f"Background removed successfully and saved to {output_path}!")

if __name__ == "__main__":
    main()
