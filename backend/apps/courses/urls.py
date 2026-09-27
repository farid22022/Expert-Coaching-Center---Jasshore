from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("courses", views.CourseViewSet)
router.register("sections", views.CourseSectionViewSet)
router.register("subjects", views.CourseSubjectViewSet)
router.register("academic-stages", views.AcademicStageViewSet)
router.register("syllabus-items", views.CourseSyllabusItemViewSet)
router.register("teacher-assignments", views.TeacherAssignmentViewSet)
router.register("enrollments", views.EnrollmentViewSet)
router.register("student/dashboard", views.StudentPortalViewSet, basename="student-dashboard")
router.register("teacher/dashboard", views.TeacherDashboardViewSet, basename="teacher-dashboard")

urlpatterns = router.urls
