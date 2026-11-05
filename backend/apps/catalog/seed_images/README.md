# Starter product photos

The `seed_catalog` command gives each starter product one of these photos
until the owner uploads a real pack photo in admin. They are generic stand-ins,
not pictures of the actual packs, so replace them before listing products on
Google Merchant Center (it needs accurate product images).

All photos are free photos from [Unsplash](https://unsplash.com) under the
[Unsplash License](https://unsplash.com/license). The license allows free
commercial use with no credit required, so nothing is shown on the site. The
sources are listed here only as a record. No Unsplash+ photos are used, and
none show brand logos or text.

Each file was cropped to an 800 x 800 square and saved as JPEG (quality 82,
no metadata).

| File | Unsplash photo |
| --- | --- |
| kainat-kacha.jpg | https://unsplash.com/photos/-LdilhDx3sk |
| steam-kainat-1121.jpg | https://unsplash.com/photos/q5oFM2GYbWM |
| steam-kainat-1509.jpg | https://unsplash.com/photos/M5hX7319EBA |
| short-grain-steam.jpg | https://unsplash.com/photos/3zplOwmV6v0 |
| kainat-adhwar.jpg | https://unsplash.com/photos/Y0SeiGEl2L4 |
| kainat-sela.jpg | https://unsplash.com/photos/T59cST8IBqY |
| dalda-oil.jpg | https://unsplash.com/photos/BScSk37FviU |
| dalda-ghee.jpg | https://unsplash.com/photos/Jp3Z8UPxxPM |
| mezan-classic-oil.jpg | https://unsplash.com/photos/iCgfwfqgdzo |
| mezan-classic-ghee.jpg | https://unsplash.com/photos/xhOUnxVVb6s |
| rewari-regular.jpg | https://unsplash.com/photos/n_nV3xvU4JU |
| rewari-special.jpg | https://unsplash.com/photos/JGaMJ1o6tfg |
| milk-cream.jpg | https://unsplash.com/photos/UC2x8EktH3U |
| desi-ghee.jpg | https://unsplash.com/photos/BIhPBgN0C28 |
| honey.jpg | https://unsplash.com/photos/Asj5DFw8UAw |

No real rewari photo was found, so both Rewari products use photos of toasted
sesame seeds.

To change a starter photo, replace the file (keep the product slug as the file
name) and run `uv run python manage.py seed_catalog --replace-images`.
