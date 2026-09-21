from apps.core.permissions import HasActionPermission
from apps.core.viewsets import OrganizationScopedModelViewSet
from . import models, serializers


class PeopleViewSet(OrganizationScopedModelViewSet):
    permission_classes = [HasActionPermission]


class GuardianViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.Guardian.objects.all()
    serializer_class = serializers.GuardianSerializer
    search_fields = ("name", "phone", "email")


class StudentViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.Student.objects.select_related("session", "academic_class", "section", "group", "shift", "category")
    serializer_class = serializers.StudentSerializer
    search_fields = ("student_id", "admission_no", "roll", "full_name", "phone")
    filterset_fields = ("session", "academic_class", "section", "group", "shift", "category", "status", "gender")


class StudentAddressViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.StudentAddress.objects.select_related("student")
    serializer_class = serializers.StudentAddressSerializer
    filterset_fields = ("student", "address_type")


class StudentDocumentViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.StudentDocument.objects.select_related("student")
    serializer_class = serializers.StudentDocumentSerializer
    filterset_fields = ("student", "document_type")


class StudentStatusHistoryViewSet(PeopleViewSet):
    permission_module = "student"
    queryset = models.StudentStatusHistory.objects.select_related("student")
    serializer_class = serializers.StudentStatusHistorySerializer
    filterset_fields = ("student", "new_status")


class DepartmentViewSet(PeopleViewSet):
    permission_module = "employee"
    queryset = models.Department.objects.all()
    serializer_class = serializers.DepartmentSerializer
    search_fields = ("name",)


class DesignationViewSet(PeopleViewSet):
    permission_module = "employee"
    queryset = models.Designation.objects.all()
    serializer_class = serializers.DesignationSerializer
    search_fields = ("name",)


class EmployeeViewSet(PeopleViewSet):
    permission_module = "employee"
    queryset = models.Employee.objects.select_related("department", "designation")
    serializer_class = serializers.EmployeeSerializer
    search_fields = ("employee_id", "full_name", "phone", "email")
    filterset_fields = ("employee_type", "department", "designation", "status")
