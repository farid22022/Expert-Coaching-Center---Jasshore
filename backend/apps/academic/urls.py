from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("sessions", views.AcademicSessionViewSet)
router.register("shifts", views.ShiftViewSet)
router.register("student-groups", views.StudentGroupViewSet)
router.register("student-categories", views.StudentCategoryViewSet)
router.register("classes", views.AcademicClassViewSet)
router.register("sections", views.SectionViewSet)
router.register("subjects", views.SubjectViewSet)
router.register("combined-subjects", views.CombinedSubjectViewSet)
router.register("buildings", views.BuildingViewSet)
router.register("floors", views.FloorViewSet)
router.register("classrooms", views.ClassroomViewSet)
router.register("class-teachers", views.ClassTeacherAssignmentViewSet)
router.register("syllabus", views.SyllabusViewSet)
router.register("routines", views.ClassRoutineViewSet)

urlpatterns = router.urls

