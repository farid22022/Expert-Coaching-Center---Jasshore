import api, { unwrapApiData, unwrapResults } from "./api";

export function createResourceApi(prefix) {
  const configFor = (payload) =>
    payload instanceof FormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined;

  return {
    list: (params) => api.get(prefix, { params }).then((response) => response.data),
    listResults: (params) => api.get(prefix, { params }).then((response) => unwrapResults(response.data)),
    count: (params) =>
      api.get(prefix, { params }).then((response) => {
        const data = unwrapApiData(response.data);
        if (typeof data?.count === "number") return data.count;
        if (Array.isArray(data?.results)) return data.results.length;
        if (Array.isArray(data)) return data.length;
        return 0;
      }),
    get: (id) => api.get(`${prefix}${id}/`).then((response) => unwrapApiData(response.data)),
    create: (payload) => api.post(prefix, payload, configFor(payload)).then((response) => unwrapApiData(response.data)),
    update: (id, payload) => api.patch(`${prefix}${id}/`, payload, configFor(payload)).then((response) => unwrapApiData(response.data)),
    remove: (id) => api.delete(`${prefix}${id}/`).then((response) => response.data),
    action: (id, name, payload = {}) =>
      api.post(`${prefix}${id}/${name}/`, payload).then((response) => unwrapApiData(response.data)),
  };
}

export const userApi = createResourceApi("/auth/users/");
export const roleApi = createResourceApi("/auth/roles/");
export const permissionApi = createResourceApi("/auth/permissions/");
export const loginHistoryApi = createResourceApi("/auth/login-history/");
export const organizationApi = createResourceApi("/organizations/");
export const branchApi = createResourceApi("/organizations/branches/");
export const studentApi = createResourceApi("/people/students/");
export const guardianApi = createResourceApi("/people/guardians/");
export const employeeApi = createResourceApi("/people/employees/");
export const teacherAccountApi = createResourceApi("/people/teacher-accounts/");
export const departmentApi = createResourceApi("/people/departments/");
export const designationApi = createResourceApi("/people/designations/");
export const sessionApi = createResourceApi("/academic/sessions/");
export const shiftApi = createResourceApi("/academic/shifts/");
export const studentGroupApi = createResourceApi("/academic/student-groups/");
export const studentCategoryApi = createResourceApi("/academic/student-categories/");
export const academicClassApi = createResourceApi("/academic/classes/");
export const sectionApi = createResourceApi("/academic/sections/");
export const subjectApi = createResourceApi("/academic/subjects/");
export const combinedSubjectApi = createResourceApi("/academic/combined-subjects/");
export const buildingApi = createResourceApi("/academic/buildings/");
export const floorApi = createResourceApi("/academic/floors/");
export const classroomApi = createResourceApi("/academic/classrooms/");
export const classTeacherApi = createResourceApi("/academic/class-teachers/");
export const syllabusApi = createResourceApi("/academic/syllabus/");
export const classRoutineApi = createResourceApi("/academic/routines/");
export const courseApi = createResourceApi("/courses/courses/");
export const publicAdmissionCardApi = {
  list: () => api.get("/courses/courses/public-admissions/").then((response) => unwrapResults(response.data)),
  get: (identifier) => api.get(`/courses/courses/public-admissions/${identifier}/`).then((response) => unwrapApiData(response.data)),
};
export const courseSectionApi = createResourceApi("/courses/sections/");
export const courseSubjectApi = createResourceApi("/courses/subjects/");
export const teacherAssignmentApi = createResourceApi("/courses/teacher-assignments/");
export const enrollmentApi = createResourceApi("/courses/enrollments/");
export const studentDashboardApi = createResourceApi("/courses/student/dashboard/");
export const teacherDashboardApi = createResourceApi("/courses/teacher/dashboard/");
export const questionApi = createResourceApi("/assessments/questions/");
export const questionOptionApi = createResourceApi("/assessments/options/");
export const materialApi = createResourceApi("/assessments/materials/");
export const assessmentApi = createResourceApi("/assessments/assessments/");
export const assessmentQuestionApi = createResourceApi("/assessments/assessment-questions/");
export const assessmentAttemptApi = createResourceApi("/assessments/attempts/");
export const assignmentSubmissionApi = createResourceApi("/assessments/submissions/");
export const submissionAttachmentApi = createResourceApi("/assessments/submission-attachments/");
export const studentAssessmentApi = createResourceApi("/assessments/student/assessments/");
export const notificationApi = createResourceApi("/sms/notifications/");
export const applicationApi = createResourceApi("/applications/");
export const admissionPaymentApi = createResourceApi("/applications/payments/");
export const admissionExamApi = createResourceApi("/applications/exams/");
export const admissionMarkApi = createResourceApi("/applications/marks/");
export const admissionResultApi = createResourceApi("/applications/results/");
export const examApi = createResourceApi("/exams/exams/");
export const gradeScaleApi = createResourceApi("/exams/grades/");
export const examSubjectApi = createResourceApi("/exams/exam-subjects/");
export const studentMarkApi = createResourceApi("/exams/marks/");
export const processedResultApi = createResourceApi("/exams/results/");
export const grandResultApi = createResourceApi("/exams/grand-results/");
export const feeCategoryApi = createResourceApi("/finance/fee-categories/");
export const feeStructureApi = createResourceApi("/finance/fee-structures/");
export const studentFeeApi = createResourceApi("/finance/student-fees/");
export const feeCollectionApi = createResourceApi("/finance/fee-collections/");
export const expenseApi = createResourceApi("/finance/expenses/");
export const incomeApi = createResourceApi("/finance/income/");
export const payrollApi = createResourceApi("/hr/payroll-structures/");
export const salaryRecordApi = createResourceApi("/hr/salary-records/");
export const leaveApplicationApi = createResourceApi("/hr/leave-applications/");
export const contactCategoryApi = createResourceApi("/sms/contact-categories/");
export const contactApi = createResourceApi("/sms/contacts/");
export const smsProviderApi = createResourceApi("/sms/providers/");
export const smsTemplateApi = createResourceApi("/sms/templates/");
export const smsCampaignApi = createResourceApi("/sms/campaigns/");
export const smsLogApi = createResourceApi("/sms/logs/");
export const reportContentApi = createResourceApi("/website/content/");
export const galleryApi = createResourceApi("/website/gallery/");
export const websiteSettingApi = createResourceApi("/website/settings/");
export const auditLogApi = createResourceApi("/audit/logs/");
