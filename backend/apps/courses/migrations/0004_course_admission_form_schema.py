from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0003_course_custom_content"),
    ]

    operations = [
        migrations.AddField(
            model_name="course",
            name="admission_form_schema",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
