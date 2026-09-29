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
  get: (identifier, params) => api.get(`/courses/courses/public-admissions/${identifier}/`, { params }).then((response) => unwrapApiData(response.data)),
};
export const courseSectionApi = createResourceApi("/courses/sections/");
export const courseSubjectApi = createResourceApi("/courses/subjects/");
export const academicStageApi = createResourceApi("/courses/academic-stages/");
export const courseSyllabusItemApi = createResourceApi("/courses/syllabus-items/");
export const teacherAssignmentApi = createResourceApi("/courses/teacher-assignments/");
export const enrollmentApi = createResourceApi("/courses/enrollments/");
export const studentDashboardApi = createResourceApi("/courses/student/dashboard/");
export const studentAcademicApi = {
  overview: (enrollmentId) => api.get(`/courses/student/dashboard/${enrollmentId}/academic-overview/`).then((response) => unwrapApiData(response.data)),
  courseResult: (enrollmentId, subjectId) => api.get(`/courses/student/dashboard/${enrollmentId}/subjects/${subjectId}/result/`).then((response) => unwrapApiData(response.data)),
};
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
export const interventionApi = createResourceApi("/assessments/interventions/");
export const teacherFeedbackApi = createResourceApi("/assessments/feedback/");
export const teacherPrivateNoteApi = createResourceApi("/assessments/teacher-notes/");
export const studentBookmarkApi = createResourceApi("/assessments/student/bookmarks/");
export const assessmentComponentApi = createResourceApi("/assessments/assessment-components/");
export const courseGradeScaleApi = createResourceApi("/assessments/course-grade-scales/");
export const courseGradeScaleItemApi = createResourceApi("/assessments/course-grade-scale-items/");
export const courseRatingApi = createResourceApi("/assessments/student/course-ratings/");
export const gradebookApi = createResourceApi("/assessments/gradebook/");
export const studentPortalApi = {
  actions: () => api.get("/assessments/student/assessments/actions/").then((response) => unwrapApiData(response.data)),
  feedback: (params) => api.get("/assessments/student/assessments/feedback/", { params }).then((response) => unwrapApiData(response.data)),
  weakTopics: (params) => api.get("/assessments/student/assessments/weak-topics/", { params }).then((response) => unwrapApiData(response.data)),
  practice: () => api.get("/assessments/student/assessments/practice/").then((response) => unwrapApiData(response.data)),
  mistakes: (params) => api.get("/assessments/student/assessments/mistakes/", { params }).then((response) => unwrapApiData(response.data)),
  practiceMistakes: (answerIds) =>
    api.post("/assessments/student/assessments/mistakes/practice/", { answer_ids: answerIds }).then((response) => unwrapApiData(response.data)),
};
export const notificationApi = createResourceApi("/sms/notifications/");
export const noticeApi = createResourceApi("/sms/notices/");
export const publicNoticeApi = {
  list: () => api.get("/sms/notices/public/").then((response) => unwrapResults(response.data)),
  student: () => api.get("/sms/notices/student/").then((response) => unwrapResults(response.data)),
};
export const applicationApi = createResourceApi("/applications/");
export const applicantDocumentApi = createResourceApi("/applications/documents/");
export const admissionPaymentApi = createResourceApi("/applications/payments/");
export const admissionExamApi = createResourceApi("/applications/exams/");
export const admissionMarkApi = createResourceApi("/applications/marks/");
export const admissionResultApi = createResourceApi("/applications/results/");
export const paymentApi = {
  mine: () => api.get("/payments/me/").then((response) => unwrapApiData(response.data)),
  initiate: (applicationId) => api.post("/payments/bkash/initiate/", { application_id: applicationId }).then((response) => unwrapApiData(response.data)),
  get: (publicId) => api.get(`/payments/${publicId}/`).then((response) => unwrapApiData(response.data)),
};
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
export const bannerApi = createResourceApi("/website/banners/");
export const successStoryApi = createResourceApi("/website/success-stories/");
export const renownedTeacherApi = createResourceApi("/website/renowned-teachers/");
export const publicBannerApi = { list: () => api.get("/website/banners/public/").then((response) => unwrapResults(response.data)) };
export const publicSuccessStoryApi = { list: () => api.get("/website/success-stories/public/").then((response) => unwrapResults(response.data)) };
export const publicRenownedTeacherApi = { list: () => api.get("/website/renowned-teachers/public/").then((response) => unwrapResults(response.data)) };
export const publicSiteInfoApi = {
  get: () => api.get("/organizations/public/").then((response) => response.data),
  stats: () => api.get("/courses/courses/public-stats/").then((response) => unwrapApiData(response.data)),
};

export const subjectWeekApi = createResourceApi("/courses/weeks/");
export const courseChapterApi = createResourceApi("/courses/chapters/");
