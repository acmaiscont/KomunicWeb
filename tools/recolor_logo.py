from pathlib import Path

from PIL import Image, ImageFilter


source = Path(r"D:\Ryan\Temp\codex-clipboard-8c5569d0-4768-4cb0-9ef7-9346288a9bbc.png")
png_path = Path(r"D:\OneDrive - JCM CONTABILIDADE\Suporte - Desenvolvimento\KomunicApp\Versão\Arquivos\Komunic-icon-acmais.png")
ico_path = Path(r"D:\OneDrive - JCM CONTABILIDADE\Suporte - Desenvolvimento\KomunicApp\Versão\KomunicApp\komunic-icon.ico")

image = Image.open(source).convert("RGBA").crop((0, 0, 316, 316))
pixels = image.load()
mask = Image.new("L", image.size, 0)
result = Image.new("RGBA", image.size, (0, 0, 0, 0))
result_pixels = result.load()
mask_pixels = mask.load()

for y in range(image.height):
    for x in range(image.width):
        r, g, b, alpha = pixels[x, y]
        mask_pixels[x, y] = alpha
        if alpha == 0:
            continue
        if 70 <= x <= 170 and y >= 235:
            color = (255, 140, 35, alpha)
        elif max(r, g, b) < 80:
            color = (255, 255, 255, alpha)
        elif r > 120 and g > 60:
            color = (255, 140, 35, alpha)
        elif g > 150 and r < 120:
            color = (0, 194, 220, alpha)
        else:
            color = (108, 67, 144, alpha)
        result_pixels[x, y] = color

outline = mask.filter(ImageFilter.MaxFilter(9))
outline_layer = Image.new("RGBA", image.size, (255, 255, 255, 0))
outline_layer.putalpha(outline.point(lambda value: int(value * 0.55)))
result = Image.alpha_composite(outline_layer, result)
result.thumbnail((256, 256), Image.Resampling.LANCZOS)
result.save(png_path, format="PNG")
result.save(ico_path, format="ICO", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
