"""
Simple drawn pictures for the starter catalog.

The seed command uses these until the owner uploads real product photos in
admin. They show the kind of item (a bowl of rice, an oil bottle, a ghee tin,
a jar) with no brand names or logos.
"""

import io
import random

from PIL import Image, ImageDraw

SIZE = 800


def _canvas(background):
    image = Image.new("RGB", (SIZE, SIZE), background)
    return image, ImageDraw.Draw(image)


def _shadow(draw, box, colour):
    draw.ellipse(box, fill=colour)


def rice(grain, background="#e9efe4", bowl="#7a4b2a", seed=0):
    image, draw = _canvas(background)
    rng = random.Random(seed)
    _shadow(draw, (150, 600, 650, 680), "#cfd8c8")
    # Heap of grains above the bowl rim.
    for _ in range(900):
        x = rng.gauss(400, 120)
        y = rng.gauss(430, 45)
        if (x - 400) ** 2 / 230**2 + (y - 470) ** 2 / 110**2 > 1 or y > 470:
            continue
        angle = rng.uniform(-0.6, 0.6)
        length, width = 26, 8
        dx, dy = length * angle, length
        draw.line((x, y, x + dy, y + dx), fill=grain, width=width)
    draw.chord((170, 330, 630, 650), 0, 180, fill=bowl)
    draw.ellipse((170, 450, 630, 500), outline="#5c3720", width=6)
    return image


def bottle(liquid="#e8b923", background="#f3eddc", cap="#2f6b3a"):
    image, draw = _canvas(background)
    _shadow(draw, (250, 690, 550, 740), "#ddd5c0")
    draw.rounded_rectangle(
        (250, 260, 550, 720), radius=60, fill="#f8f6ef", outline="#c9c2ad", width=6
    )
    draw.rounded_rectangle((262, 380, 538, 708), radius=50, fill=liquid)
    draw.rectangle((340, 150, 460, 270), fill="#f8f6ef", outline="#c9c2ad", width=6)
    draw.rounded_rectangle((325, 100, 475, 165), radius=14, fill=cap)
    draw.rounded_rectangle((290, 470, 510, 600), radius=16, fill="#fbfaf5")
    return image


def tin(band="#2f6b3a", background="#f1ead7", metal="#c7c9cc"):
    image, draw = _canvas(background)
    _shadow(draw, (190, 680, 610, 740), "#dcd3bc")
    draw.rectangle((200, 240, 600, 710), fill=metal, outline="#9a9da1", width=6)
    draw.ellipse((200, 200, 600, 280), fill="#dfe1e3", outline="#9a9da1", width=6)
    draw.rectangle((200, 380, 600, 560), fill=band)
    draw.ellipse((340, 410, 460, 530), fill="#f2c94c")
    return image


def jar(filling, background="#f4ecdb", lid="#8a5a2b"):
    image, draw = _canvas(background)
    _shadow(draw, (220, 690, 580, 745), "#ded3bb")
    draw.rounded_rectangle(
        (220, 250, 580, 720), radius=70, fill="#fbf8f1", outline="#cfc6b2", width=6
    )
    draw.rounded_rectangle((234, 320, 566, 706), radius=60, fill=filling)
    draw.rounded_rectangle((240, 170, 560, 260), radius=18, fill=lid)
    draw.rounded_rectangle((300, 450, 500, 580), radius=14, fill="#fbf8f1")
    return image


def sweets(piece="#b9773f", background="#f5ecdf", seed=0):
    """A plate of small round sesame sweets."""
    image, draw = _canvas(background)
    rng = random.Random(seed)
    draw.ellipse((110, 220, 690, 680), fill="#e7dccb", outline="#cbbca5", width=6)
    draw.ellipse((150, 255, 650, 645), fill="#f7f1e7")
    spots = [(x, y) for x in range(250, 600, 95) for y in range(330, 600, 90)]
    for x, y in spots:
        x += rng.randint(-15, 15)
        y += rng.randint(-12, 12)
        draw.ellipse((x - 42, y - 30, x + 42, y + 30), fill=piece, outline="#8c552a", width=3)
        for _ in range(14):
            sx = x + rng.randint(-32, 32)
            sy = y + rng.randint(-20, 20)
            draw.ellipse((sx - 4, sy - 2, sx + 4, sy + 2), fill="#f5ead2")
    return image


def cream_cup(background="#e8eef3"):
    image, draw = _canvas(background)
    _shadow(draw, (210, 670, 590, 730), "#cdd7df")
    draw.polygon([(210, 330), (590, 330), (550, 700), (250, 700)], fill="#5b8db8")
    draw.ellipse((210, 300, 590, 360), fill="#fffdf6", outline="#d9d3c2", width=4)
    draw.ellipse((290, 250, 510, 330), fill="#fffdf6")
    draw.rectangle((260, 450, 540, 560), fill="#fffdf6")
    return image


def to_jpeg(image):
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=85)
    return buffer.getvalue()
