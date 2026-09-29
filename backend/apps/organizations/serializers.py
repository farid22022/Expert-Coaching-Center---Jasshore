from rest_framework import serializers
from .models import Branch, Organization


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = "__all__"


class PublicOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ("name", "name_bn", "established_year", "logo", "favicon", "theme_primary_color", "theme_accent_color", "theme_font_family", "theme_font_scale")


class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = "__all__"

