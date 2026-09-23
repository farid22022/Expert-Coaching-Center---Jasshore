from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0002_rename_courses_cou_organiz_873b27_idx_courses_cou_organiz_72a6a0_idx_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="custom_content",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
