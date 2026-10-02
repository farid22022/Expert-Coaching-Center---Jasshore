from django.db import models


def _hosted_storage():
    from apps.integrations.image_hosting.storage import HostedImageStorage

    return HostedImageStorage()


class HostedImageField(models.ImageField):
    """ImageField whose new uploads are hosted on ImgBB (public URL stored in the column).

    Existing local files keep working. `deconstruct` reports a plain ImageField so adopting this
    field produces no schema change or migration.
    """

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("storage", _hosted_storage())
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, _path, args, kwargs = super().deconstruct()
        kwargs.pop("storage", None)
        return name, "django.db.models.ImageField", args, kwargs


class HostedMediaField(models.FileField):
    """FileField holding photos *and* other media (e.g. gallery). Real images are hosted on
    ImgBB; videos/PDFs/anything else stay in local storage. No schema/migration impact."""

    def __init__(self, *args, **kwargs):
        if "storage" not in kwargs:
            from apps.integrations.image_hosting.storage import HostedImageStorage

            kwargs["storage"] = HostedImageStorage(sniff=True)
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, _path, args, kwargs = super().deconstruct()
        kwargs.pop("storage", None)
        return name, "django.db.models.FileField", args, kwargs
