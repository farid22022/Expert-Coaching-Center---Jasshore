from decimal import Decimal
from django.db import transaction
from .models import GradeScale, ProcessedResult


class ResultService:
    @staticmethod
    def grade_for(organization, percentage):
        return GradeScale.objects.filter(
            organization=organization,
            min_mark__lte=percentage,
            max_mark__gte=percentage,
        ).order_by("-min_mark").first()

    @staticmethod
    @transaction.atomic
    def process_exam(exam):
        existing = ProcessedResult.objects.filter(exam=exam)
        existing.delete()
        student_totals = {}
        exam_total = Decimal("0.00")

        for exam_subject in exam.subjects.prefetch_related("marks"):
            exam_total += exam_subject.total_marks
            for mark in exam_subject.marks.all():
                row = student_totals.setdefault(mark.student_id, Decimal("0.00"))
                student_totals[mark.student_id] = row + mark.total_obtained

        results = []
        sorted_rows = sorted(student_totals.items(), key=lambda item: item[1], reverse=True)
        for position, (student_id, obtained) in enumerate(sorted_rows, start=1):
            percentage = (obtained / exam_total * Decimal("100.00")) if exam_total else Decimal("0.00")
            grade = ResultService.grade_for(exam.organization, percentage)
            results.append(ProcessedResult(
                organization=exam.organization,
                exam=exam,
                student_id=student_id,
                total_marks=exam_total,
                obtained_marks=obtained,
                gpa=grade.gpa if grade else Decimal("0.00"),
                grade=grade.grade if grade else "N/A",
                status="failed" if grade and grade.is_fail else "passed",
                position=position,
            ))
        ProcessedResult.objects.bulk_create(results)
        return results

