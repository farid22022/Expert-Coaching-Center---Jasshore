import api from "./api";

export function createResourceApi(prefix) {
  return {
    list: (params) => api.get(prefix, { params }).then((response) => response.data),
    get: (id) => api.get(`${prefix}${id}/`).then((response) => response.data),
    create: (payload) => api.post(prefix, payload).then((response) => response.data),
    update: (id, payload) => api.patch(`${prefix}${id}/`, payload).then((response) => response.data),
    remove: (id) => api.delete(`${prefix}${id}/`).then((response) => response.data),
    action: (id, name, payload = {}) =>
      api.post(`${prefix}${id}/${name}/`, payload).then((response) => response.data),
  };
}

export const studentApi = createResourceApi("/people/students/");
export const employeeApi = createResourceApi("/people/employees/");
export const academicClassApi = createResourceApi("/academic/classes/");
export const sectionApi = createResourceApi("/academic/sections/");
export const subjectApi = createResourceApi("/academic/subjects/");
export const applicationApi = createResourceApi("/applications/");
export const examApi = createResourceApi("/exams/exams/");
export const payrollApi = createResourceApi("/hr/payroll-structures/");
export const leaveApplicationApi = createResourceApi("/hr/leave-applications/");
export const smsCampaignApi = createResourceApi("/sms/campaigns/");
export const reportContentApi = createResourceApi("/website/content/");

