from rest_framework import serializers
from django.utils import timezone
from django.utils.text import slugify
from uuid import uuid4
import json

from . import models


class CourseSerializer(serializers.ModelSerializer):
    slug = serializers.CharField(required=False, allow_blank=True)
    teacher_names = serializers.SerializerMethodField()
    subject_names = serializers.SerializerMethodField()
    section_names = serializers.SerializerMethodField()
    public_syllabus = serializers.SerializerMethodField()

    class Meta:
        model = models.Course
        fields = "__all__"
        validators = []

    def get_teacher_names(self, obj):
        teachers = []
        for assignment in getattr(obj, "teacher_assignments", []).all():
            name = getattr(assignment.teacher, "full_name", "") or getattr(assignment.teacher, "email", "")
            if name and name not in teachers:
                teachers.append(name)
        return teachers

    def get_subject_names(self, obj):
        subjects = []
        sections = getattr(obj, "sections", None)
        if not sections:
            return subjects
        for section in sections.all():
            for subject in section.subjects.all():
                if subject.name and subject.name not in subjects:
                    subjects.append(subject.name)
        return subjects

    def get_section_names(self, obj):
        sections = []
        for section in getattr(obj, "sections", []).all():
            if section.name and section.name not in sections:
                sections.append(section.name)
        return sections

    def get_public_syllabus(self, obj):
        items = getattr(obj, "syllabus_items", None)
        if items is None:
            return []
        # Filter in Python: .filter() on a prefetched manager bypasses the prefetch cache
        # and costs one remote round trip per course. The viewset prefetches
        # syllabus_items with course_section/subject already.
        public_items = [item for item in items.all() if item.is_public]
        return CourseSyllabusItemSerializer(public_items, many=True).data

    def validate_slug(self, value):
        if not value:
            return ""
        return slugify(value.strip())[:220]

    def validate_custom_content(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Custom content must be valid JSON.")
        if not isinstance(value, list):
            raise serializers.ValidationError("Custom content must be a list.")
        cleaned = []
        for item in value:
            if not isinstance(item, dict):
                continue
            cleaned.append({
                "id": str(item.get("id") or uuid4().hex[:12]),
                "type": str(item.get("type") or "text")[:40],
                "label": str(item.get("label") or "")[:180],
                "value": str(item.get("value") or ""),
                "url": str(item.get("url") or "")[:500],
            })
        return cleaned

    def validate_admission_form_schema(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Admission form schema must be valid JSON.")
        if not isinstance(value, list):
            raise serializers.ValidationError("Admission form schema must be a list.")

        cleaned_sections = []
        names = set()
        for section_index, section in enumerate(value, start=1):
            if not isinstance(section, dict):
                raise serializers.ValidationError(f"Section {section_index} must be an object.")
            title = str(section.get("title") or "").strip()
            if not title:
                raise serializers.ValidationError(f"Section {section_index}: enter a section heading.")
            section_fields = section.get("fields")
            if not isinstance(section_fields, list) or not section_fields:
                raise serializers.ValidationError(f'Section "{title}": add at least one applicant field, or remove this section.')
            fields = []
            for field_index, field in enumerate(section_fields, start=1):
                if not isinstance(field, dict):
                    raise serializers.ValidationError(f'Section "{title}", field {field_index} must be an object.')
                label = str(field.get("label") or "").strip()
                if not label:
                    raise serializers.ValidationError(f'Section "{title}", field {field_index}: enter a field label. Section headings are not applicant fields.')
                field_type = str(field.get("type") or "text")
                if field_type not in {"text", "email", "tel", "number", "date", "textarea", "select", "file"}:
                    raise serializers.ValidationError(f'Field "{label}": unsupported field type.')
                options = field.get("options", [])
                if not isinstance(options, list):
                    raise serializers.ValidationError(f'Field "{label}": options must be a list.')
                options = [str(option).strip()[:180] for option in options if str(option).strip()]
                if field_type == "select" and not options:
                    raise serializers.ValidationError(f'Field "{label}": enter at least one select option.')
                base_name = slugify(str(field.get("name") or label))[:180] or f"field-{uuid4().hex[:6]}"
                name = base_name
                suffix = 2
                while name in names:
                    name = f"{base_name[:170]}-{suffix}"
                    suffix += 1
                names.add(name)
                fields.append({
                    "id": str(field.get("id") or uuid4().hex[:12]),
                    "label": label[:180],
                    "name": name,
                    "type": field_type,
                    "placeholder": str(field.get("placeholder") or "")[:240],
                    "required": bool(field.get("required", False)),
                    "options": options,
                })
            title = str(section.get("title") or "").strip()
            if title and fields:
                cleaned_sections.append({"id": str(section.get("id") or uuid4().hex[:12]), "title": title[:180], "fields": fields})
        return cleaned_sections

    def validate_landing_page(self, value):
        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Landing page content must be valid JSON.")
        if not isinstance(value, dict):
            raise serializers.ValidationError("Landing page content must be an object.")

        def clean_list(items, allowed_keys, max_items=40):
            if not isinstance(items, list):
                return []
            cleaned = []
            for item in items[:max_items]:
                if not isinstance(item, dict):
                    continue
                entry = {"id": str(item.get("id") or uuid4().hex[:12])}
                for key in allowed_keys:
                    val = item.get(key, "")
                    entry[key] = str(val)[:600] if key in ("description", "answer", "text") else str(val)[:220]
                cleaned.append(entry)
            return cleaned

        highlights = clean_list(value.get("highlights"), ["value", "label"])
        audience = clean_list(value.get("audience"), ["text"])
        features = clean_list(value.get("features"), ["icon", "title", "description"])
        requirements = clean_list(value.get("requirements"), ["text"])
        faqs_raw = value.get("faqs") if isinstance(value.get("faqs"), list) else []
        faqs = []
        for index, item in enumerate(faqs_raw[:60]):
            if not isinstance(item, dict):
                continue
            question = str(item.get("question") or "").strip()
            answer = str(item.get("answer") or "").strip()
            if not question:
                continue
            faqs.append({
                "id": str(item.get("id") or uuid4().hex[:12]),
                "question": question[:220],
                "answer": answer[:2000],
                "order": int(item.get("order") or index),
            })

        about_raw = value.get("about") if isinstance(value.get("about"), dict) else {}
        about = {
            "title": str(about_raw.get("title") or "")[:220],
            "description": str(about_raw.get("description") or "")[:20000],
            "image": str(about_raw.get("image") or "")[:500],
        }

        cta_raw = value.get("cta") if isinstance(value.get("cta"), dict) else {}
        cta = {
            "title": str(cta_raw.get("title") or "")[:220],
            "subtitle": str(cta_raw.get("subtitle") or "")[:400],
        }

        nav_raw = value.get("nav") if isinstance(value.get("nav"), dict) else {}
        nav = {"enabled": bool(nav_raw.get("enabled", True))}

        return {
            "highlights": highlights,
            "about": about,
            "audience": audience,
            "features": features,
            "requirements": requirements,
            "faqs": faqs,
            "cta": cta,
            "nav": nav,
        }

    def validate(self, attrs):
        title = attrs.get("title") or getattr(self.instance, "title", "")
        slug = attrs.get("slug") or getattr(self.instance, "slug", "")
        organization = attrs.get("organization") or getattr(self.instance, "organization", None)

        if not slug and title:
            slug = slugify(title)[:220]
        if not slug:
            slug = f"course-{uuid4().hex[:8]}"

        if slug and organization:
            base_slug = slug
            queryset = models.Course.objects.filter(organization=organization, slug=slug)
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)
            counter = 2
            while queryset.exists():
                suffix = f"-{counter}"
                slug = f"{base_slug[:220 - len(suffix)]}{suffix}"
                queryset = models.Course.objects.filter(organization=organization, slug=slug)
                if self.instance:
                    queryset = queryset.exclude(pk=self.instance.pk)
                counter += 1
            attrs["slug"] = slug

        return attrs


class CourseSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CourseSection
        fields = "__all__"

    def validate(self, attrs):
        instance = self.instance
        course = attrs.get("course") or getattr(instance, "course", None)
        head_teacher = attrs.get("head_teacher", getattr(instance, "head_teacher", None))

        if head_teacher:
            if head_teacher.employee_type != "teacher":
                raise serializers.ValidationError({"head_teacher": "Only teacher accounts can be assigned as head teacher."})
            if course and head_teacher.organization_id != course.organization_id:
                raise serializers.ValidationError({"head_teacher": "Head teacher must belong to this admission program's organization."})
        return attrs


class AcademicStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.AcademicStage
        fields = "__all__"

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError({"end_date": "End date cannot be before the start date."})
        return attrs


class CourseSubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.CourseSubject
        fields = "__all__"

    def validate(self, attrs):
        instance = self.instance
        course_section = attrs.get("course_section") or getattr(instance, "course_section", None)
        academic_stage = attrs.get("academic_stage", getattr(instance, "academic_stage", None))
        if academic_stage and course_section and academic_stage.course_id != course_section.course_id:
            raise serializers.ValidationError({"academic_stage": "The selected stage does not belong to this admission program."})
        return attrs


class CourseSyllabusItemSerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source="course_section.name", read_only=True)
    subject_name = serializers.CharField(source="subject.name", read_only=True)

    class Meta:
        model = models.CourseSyllabusItem
        fields = "__all__"

    def validate(self, attrs):
        instance = self.instance
        course = attrs.get("course") or getattr(instance, "course", None)
        section = attrs.get("course_section", getattr(instance, "course_section", None))
        subject = attrs.get("subject", getattr(instance, "subject", None))
        if section and course and section.course_id != course.id:
            raise serializers.ValidationError({"course_section": "The selected section does not belong to this course."})
        if subject:
            if not section:
                section = subject.course_section
                attrs["course_section"] = section
            if course and subject.course_section.course_id != course.id:
                raise serializers.ValidationError({"subject": "The selected subject does not belong to this course."})
        custom_fields = attrs.get("custom_fields")
        if custom_fields is not None:
            if isinstance(custom_fields, str):
                try:
                    custom_fields = json.loads(custom_fields)
                except json.JSONDecodeError:
                    raise serializers.ValidationError({"custom_fields": "Custom fields must be valid JSON."})
            if not isinstance(custom_fields, list):
                raise serializers.ValidationError({"custom_fields": "Custom fields must be a list."})
            attrs["custom_fields"] = [
                {
                    "id": str(field.get("id") or uuid4().hex[:12]),
                    "type": str(field.get("type") or "text")[:40],
                    "label": str(field.get("label") or "")[:180],
                    "value": str(field.get("value") or ""),
                    "url": str(field.get("url") or "")[:500],
                }
                for field in custom_fields
                if isinstance(field, dict) and (field.get("label") or field.get("value") or field.get("url"))
            ]
        return attrs


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    # DRF's auto-generated UniqueTogetherValidator (from the model's
    # unique_teacher_course_assignment constraint) unconditionally requires every field in
    # the constraint to be present in the payload, regardless of each field's own
    # required=False - so a head-teacher assignment (legitimately subject=None) was
    # rejected outright. Declaring the nullable fields explicitly and replacing the
    # validator with an equivalent manual check (below) preserves duplicate-assignment
    # protection while allowing the real "no subject" / "no section" cases through.
    subject = serializers.PrimaryKeyRelatedField(queryset=models.CourseSubject.objects.all(), required=False, allow_null=True)
    course_section = serializers.PrimaryKeyRelatedField(queryset=models.CourseSection.objects.all(), required=False, allow_null=True)

    class Meta:
        model = models.TeacherAssignment
        fields = "__all__"
        read_only_fields = ("assigned_by", "assigned_at")
        validators = []

    def validate(self, attrs):
        instance = self.instance
        course = attrs.get("course") or getattr(instance, "course", None)
        section = attrs.get("course_section", getattr(instance, "course_section", None))
        subject = attrs.get("subject", getattr(instance, "subject", None))
        teacher = attrs.get("teacher") or getattr(instance, "teacher", None)
        role = attrs.get("role", getattr(instance, "role", None))

        if not course or not teacher:
            raise serializers.ValidationError("Teacher and admission program are required.")
        if teacher.employee_type != "teacher":
            raise serializers.ValidationError({"teacher": "Only teacher accounts can receive teaching assignments."})
        if section and section.course_id != course.id:
            raise serializers.ValidationError({"course_section": "The selected section does not belong to this admission program."})
        if subject:
            if not section:
                section = subject.course_section
                attrs["course_section"] = section
            if subject.course_section_id != section.id or section.course_id != course.id:
                raise serializers.ValidationError({"subject": "The selected subject does not belong to this admission program."})

        duplicate = models.TeacherAssignment.objects.filter(teacher=teacher, course=course, course_section=section, subject=subject, role=role)
        if instance:
            duplicate = duplicate.exclude(pk=instance.pk)
        if duplicate.exists():
            raise serializers.ValidationError("This teacher already has an identical assignment for this admission program, section, subject and role.")
        return attrs


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Enrollment
        fields = "__all__"


def _pricing_for(obj):
    regular = obj.admission_fee or 0
    offer = obj.offer_fee
    discount_percent = None
    if offer is not None and regular and offer < regular:
        discount_percent = round((1 - (float(offer) / float(regular))) * 100)
    return {
        "regular": regular,
        "offer": offer,
        "discount_percent": discount_percent,
    }


def _subjects_for(obj):
    subjects = []
    for section in obj.sections.all():
        for subject in section.subjects.all():
            subjects.append({
                "id": subject.id,
                "name": subject.name,
                "code": subject.code,
                "section": section.name,
            })
    return subjects


def _teachers_for(obj):
    teachers = []
    assignments = [
        assignment for assignment in obj.teacher_assignments.all()
        if assignment.is_active and assignment.featured_on_landing_page
    ]
    assignments.sort(key=lambda a: (a.landing_order, a.id))
    seen = set()
    for assignment in assignments:
        teacher = assignment.teacher
        if not teacher or teacher.id in seen:
            continue
        seen.add(teacher.id)
        profile = getattr(teacher, "teacher_profile", None)
        teachers.append({
            "id": teacher.id,
            "name": teacher.full_name,
            "photo": teacher.photo.url if teacher.photo else "",
            "designation": teacher.designation.name if teacher.designation else "",
            "qualification": profile.qualification if profile else "",
            "specialization": profile.specialization if profile else "",
            "bio": profile.bio if profile else "",
            "subject": assignment.subject.name if assignment.subject else "",
        })
    return teachers


def _curriculum_for(obj):
    grouped = {}
    order_keys = []
    for item in obj.syllabus_items.all():
        section_name = item.course_section.name if item.course_section else "Course Outline"
        subject_name = item.subject.name if item.subject else "General"
        key = f"{section_name}::{subject_name}"
        if key not in grouped:
            grouped[key] = {"section": section_name, "subject": subject_name, "items": []}
            order_keys.append(key)
        entry = {
            "id": item.id,
            "title": item.title,
            "summary": item.summary,
            "content_type": item.content_type,
            "order": item.order,
            "locked": not item.is_public,
        }
        if item.is_public:
            entry["content"] = item.content
            entry["url"] = item.url
            entry["file"] = item.file.url if item.file else ""
        grouped[key]["items"].append(entry)
    return [grouped[key] for key in order_keys]


def _application_state_for(obj, request):
    today = timezone.localdate()
    if obj.enrollment_start and today < obj.enrollment_start:
        status = "UPCOMING"
    elif obj.enrollment_end and today > obj.enrollment_end:
        status = "CLOSED"
    elif obj.status in (models.CourseStatus.ADMISSION_CLOSED, models.CourseStatus.ARCHIVED, models.CourseStatus.COMPLETED):
        status = "CLOSED"
    else:
        status = "OPEN"

    can_apply = status == "OPEN" and obj.is_published

    my_application = None
    user = getattr(request, "user", None) if request else None
    if user is not None and getattr(user, "is_authenticated", False):
        from apps.admissions.models import AdmissionApplication

        application = (
            AdmissionApplication.objects.filter(course=obj, applicant=user)
            .order_by("-created_at")
            .first()
        )
        if application:
            my_application = {"id": application.id, "status": application.status}

    return {
        "status": status,
        "deadline": obj.enrollment_end,
        "can_apply": can_apply,
        "my_application": my_application,
    }


def _is_enrolled_for(obj, request):
    """Server-side source of truth for "has the current user already enrolled in this
    course" - checks the real Enrollment table (the same resolution used everywhere
    else in the student portal: Student by org+email, then an ACTIVE Enrollment row).
    Replaces the old client-side cross-reference that could drift out of sync."""
    user = getattr(request, "user", None) if request else None
    if user is None or not getattr(user, "is_authenticated", False):
        return False

    from apps.people.models import Student

    if obj.organization_id == user.organization_id:
        from apps.core.request_cache import student_for_user
        student = student_for_user(user)
    else:
        student = Student.objects.filter(organization=obj.organization, email__iexact=user.email).first()
    if not student:
        return False
    return models.Enrollment.objects.filter(
        organization=obj.organization, student=student, course=obj, status=models.EnrollmentStatus.ACTIVE,
    ).exists()


class PublicAdmissionCardSerializer(serializers.ModelSerializer):
    pricing = serializers.SerializerMethodField()
    subject_names = serializers.SerializerMethodField()
    teacher_names = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = models.Course
        fields = (
            "id", "slug", "title", "hero_title", "hero_badge", "short_description",
            "description", "cover_image", "thumbnail", "pricing", "capacity",
            "status", "enrollment_start", "enrollment_end", "subject_names", "teacher_names", "is_enrolled",
        )

    def get_pricing(self, obj):
        return _pricing_for(obj)

    def get_subject_names(self, obj):
        names = []
        for entry in _subjects_for(obj):
            if entry["name"] not in names:
                names.append(entry["name"])
        return names

    def get_teacher_names(self, obj):
        names = []
        for entry in _teachers_for(obj):
            if entry["name"] and entry["name"] not in names:
                names.append(entry["name"])
        return names

    def get_is_enrolled(self, obj):
        return _is_enrolled_for(obj, self.context.get("request"))


class PublicAdmissionDetailSerializer(serializers.ModelSerializer):
    pricing = serializers.SerializerMethodField()
    highlights = serializers.SerializerMethodField()
    about = serializers.SerializerMethodField()
    audience = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()
    requirements = serializers.SerializerMethodField()
    faqs = serializers.SerializerMethodField()
    cta = serializers.SerializerMethodField()
    nav = serializers.SerializerMethodField()
    subjects = serializers.SerializerMethodField()
    curriculum = serializers.SerializerMethodField()
    teachers = serializers.SerializerMethodField()
    application = serializers.SerializerMethodField()

    class Meta:
        model = models.Course
        fields = (
            "id", "slug", "title", "code", "hero_title", "hero_badge", "hero_subtitle",
            "short_description", "description", "cover_image", "hero_image", "thumbnail",
            "promo_video_url", "pricing", "capacity", "status", "is_published",
            "landing_page_enabled", "session", "start_date", "end_date",
            "enrollment_start", "enrollment_end", "meta_title", "meta_description",
            "highlights", "about", "audience", "features", "requirements", "faqs",
            "cta", "nav", "subjects", "curriculum", "teachers", "application",
            "admission_form_schema", "custom_content",
        )

    def get_pricing(self, obj):
        return _pricing_for(obj)

    def _landing(self, obj):
        return obj.landing_page if isinstance(obj.landing_page, dict) else {}

    def get_highlights(self, obj):
        return self._landing(obj).get("highlights", [])

    def get_about(self, obj):
        return self._landing(obj).get("about", {"title": "", "description": "", "image": ""})

    def get_audience(self, obj):
        return self._landing(obj).get("audience", [])

    def get_features(self, obj):
        return self._landing(obj).get("features", [])

    def get_requirements(self, obj):
        return self._landing(obj).get("requirements", [])

    def get_faqs(self, obj):
        return self._landing(obj).get("faqs", [])

    def get_cta(self, obj):
        return self._landing(obj).get("cta", {"title": "", "subtitle": ""})

    def get_nav(self, obj):
        return self._landing(obj).get("nav", {"enabled": True})

    def get_subjects(self, obj):
        return _subjects_for(obj)

    def get_curriculum(self, obj):
        return _curriculum_for(obj)

    def get_teachers(self, obj):
        return _teachers_for(obj)

    def get_application(self, obj):
        return _application_state_for(obj, self.context.get("request"))
