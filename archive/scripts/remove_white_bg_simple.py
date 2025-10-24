#!/usr/bin/env python3
from PIL import Image
import sys

input_path = sys.argv[1]
output_path = sys.argv[2]
threshold = int(sys.argv[3]) if len(sys.argv) > 3 else 235

print(f"Loading: {input_path}")
img = Image.open(input_path)

if img.mode != 'RGBA':
    print(f"Converting {img.mode} to RGBA")
    img = img.convert('RGBA')

datas = img.getdata()

newData = []
for item in datas:
    if item[0] > threshold and item[1] > threshold and item[2] > threshold:
        newData.append((item[0], item[1], item[2], 0))
    else:
        newData.append(item)

img.putdata(newData)
img.save(output_path, 'PNG', optimize=True)

print(f"✅ Saved: {output_path}")
print(f"   Size: {img.size}")
print(f"   Mode: {img.mode}")
