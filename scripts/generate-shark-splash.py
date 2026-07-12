#!/usr/bin/env python3
"""Generate jph-shark-splash.png tinted to Lethe Rose Mist palette."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

DARK = (0x9E, 0x6D, 0x81)
LIGHT = (0xE4, 0xB8, 0xCA)

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets' / 'jph-shark.png'
DST = ROOT / 'assets' / 'jph-shark-splash.png'


def lerp(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def main() -> None:
    img = Image.open(SRC).convert('RGBA')
    pixels = img.load()
    width, height = img.size

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a == 0:
                continue
            lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
            pixels[x, y] = (*lerp(DARK, LIGHT, lum), a)

    img.save(DST)
    print(f'Wrote {DST}')


if __name__ == '__main__':
    main()
