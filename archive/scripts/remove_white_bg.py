#!/usr/bin/env python3
from PIL import Image
import numpy as np
import sys

input_path = sys.argv[1]
output_path = sys.argv[2]
threshold = int(sys.argv[3]) if len(sys.argv) > 3 else 240

print(f"Loading: {input_path}")
img = Image.open(input_path)

if img.mode != 'RGBA':
    print(f"Converting {img.mode} to RGBA")
    img = img.convert('RGBA')

data = np.array(img)
red, green, blue, alpha = data.T

white_areas = (red > threshold) & (green > threshold) & (blue > threshold)
data[..., 3] = np.where(white_areas.T, 0, 255)

img_transparent = Image.fromarray(data)
img_transparent.save(output_path, 'PNG', optimize=True)

print(f"✅ Saved: {output_path}")
