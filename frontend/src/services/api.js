import axios from "axios";
import { teachers, students, routines, examRoutine, holidays, notices, news, events, photos, videos, result } from "../data/mockData.js";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });
const wait = (data) => new Promise((resolve) => setTimeout(() => resolve(data), 180));

export const teacherService = { list: () => wait(teachers) };
export const studentService = { list: () => wait(students) };
export const routineService = { classRoutine: () => wait(routines), examRoutine: () => wait(examRoutine), holidays: () => wait(holidays) };
export const noticeService = { list: () => wait(notices), get: (id) => wait(notices.find((x) => x.id === id)) };
export const newsService = { list: () => wait(news), get: (id) => wait(news.find((x) => x.id === id)) };
export const eventService = { list: () => wait(events), get: (id) => wait(events.find((x) => x.id === id)) };
export const galleryService = { photos: () => wait(photos), videos: () => wait(videos) };
export const resultService = { search: () => wait(result), assessment: () => wait(result), board: () => wait({ year: "2026", board: "Jashore", passRate: "96%", gpa5: 38, total: 142 }) };
export const admissionService = {
  submit: (payload) => wait({ ...payload, applicationId: `ECC-${Date.now().toString().slice(-6)}`, status: "Pending" }),
  status: () => wait({ applicationId: "ECC-102345", name: "Sample Applicant", status: "Under Review", mobile: "01700000000" }),
};
