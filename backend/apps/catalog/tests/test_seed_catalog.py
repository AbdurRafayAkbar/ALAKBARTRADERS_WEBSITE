import pytest
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.utils.text import slugify

from apps.catalog.management.commands.seed_catalog import PRODUCTS, SEED_IMAGES
from apps.catalog.models import Category, Product, ProductImage

pytestmark = pytest.mark.django_db


@pytest.fixture(autouse=True)
def media_in_tmp(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path


def test_seed_adds_categories_products_and_pictures():
    call_command("seed_catalog")

    assert Category.objects.count() == 7
    assert Product.objects.count() == 15
    assert ProductImage.objects.count() == 15
    assert Product.objects.get(slug="milk-cream").is_perishable
    assert not Category.objects.get(slug="dry-fruits").products.exists()


def test_seed_can_run_twice_and_keeps_owner_edits():
    call_command("seed_catalog")
    Product.objects.filter(slug="honey").update(name="Sidr Honey", is_active=False)

    call_command("seed_catalog")

    assert Product.objects.count() == 15
    assert ProductImage.objects.count() == 15
    honey = Product.objects.get(slug="honey")
    assert honey.name == "Sidr Honey"
    assert not honey.is_active


def test_every_product_has_a_starter_photo():
    for _, name, _, _ in PRODUCTS:
        assert (SEED_IMAGES / f"{slugify(name)}.jpg").is_file(), name


def test_replace_images_swaps_seed_pictures_and_keeps_owner_uploads():
    call_command("seed_catalog")
    honey = Product.objects.get(slug="honey")
    old = honey.images.get()
    old.image.save("honey.jpg", ContentFile(b"old drawn picture"))
    dalda = Product.objects.get(slug="dalda-oil")
    owner_photo = ProductImage.objects.create(
        product=dalda,
        image=ContentFile(b"real pack photo", name="dalda-pack.jpg"),
        alt_text="Dalda oil 5 litre tin",
    )

    call_command("seed_catalog", "--replace-images")

    new = honey.images.get()
    assert new.pk != old.pk
    assert new.image.read() != b"old drawn picture"
    assert ProductImage.objects.filter(pk=owner_photo.pk).exists()
    # Dalda Oil already has the owner's photo, so it gets no new stand-in.
    assert list(dalda.images.all()) == [owner_photo]
    assert ProductImage.objects.count() == 15


def test_replace_images_also_swaps_pictures_saved_under_an_old_spelling():
    call_command("seed_catalog")
    kacha = Product.objects.get(slug="kainat-kacha")
    kacha.images.update(alt_text="Picture of Kianat Kacha")
    image = kacha.images.get()
    image.image.save("kianat-kacha.jpg", ContentFile(b"old drawn picture"))

    call_command("seed_catalog", "--replace-images")

    new = kacha.images.get()
    assert new.alt_text == "Picture of Kainat Kacha"
    assert new.image.name.startswith("products/kainat-kacha")
