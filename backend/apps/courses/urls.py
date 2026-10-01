from rest_framework.routers import DefaultRouter
from django.urls import path

from . import views
from .curriculum_api import SubjectWeekViewSet, CourseChapterViewSet
from .material_media import student_material_media

router = DefaultRouter()
router.register("weeks", SubjectWeekViewSet)
router.register("chapters", CourseChapterViewSet)
router.register("courses", views.CourseViewSet)
router.register("sections", views.CourseSectionViewSet)
router.register("subjects", views.CourseSubjectViewSet)
router.register("academic-stages", views.AcademicStageViewSet)
router.register("syllabus-items", views.CourseSyllabusItemViewSet)
router.register("teacher-assignments", views.TeacherAssignmentViewSet)
router.register("enrollments", views.EnrollmentViewSet)
router.register("student/dashboard", views.StudentPortalViewSet, basename="student-dashboard")
router.register("teacher/dashboard", views.TeacherDashboardViewSet, basename="teacher-dashboard")

urlpatterns = [path("student/materials/<int:material_id>/file/", student_material_media, name="student-material-media")] + router.urls
