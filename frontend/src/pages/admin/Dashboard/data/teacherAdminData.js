const svgAvatar = (name, bg = "0f7a55") => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="140" viewBox="0 0 120 140">
      <rect width="120" height="140" rx="10" fill="#${bg}"/>
      <circle cx="60" cy="49" r="25" fill="rgba(255,255,255,.22)"/>
      <path d="M22 126c4-30 19-46 38-46s34 16 38 46" fill="rgba(255,255,255,.22)"/>
      <text x="60" y="57" text-anchor="middle" font-family="Arial, sans-serif" font-size="23" font-weight="700" fill="white">${initials}</text>
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const teacherShifts = [
  "9.30AM- 11.30AM Morning",
  "Morning",
  "Day",
  "Evening",
  "All Shift",
  "All shift for HSC",
  "Demo Shift",
];

export const teacherDesignations = [
  "DIRECTOR",
  "TEACHER",
  "SENIOR TEACHER",
  "ASSISTANT TEACHER",
  "ACADEMIC COORDINATOR",
];

export const teacherPayrolls = [
  "Monthly",
  "Hourly",
  "Contract",
  "Honorarium",
];

export const teacherTemplates = ["Vertical 1", "Vertical 2", "Horizontal 1"];
export const teacherTemplateSides = ["Both Side", "Front Side", "Back Side"];
export const teacherLayouts = ["Portrait", "Landscape"];

export const demoTeachers = [
  {
    id: "201701",
    name: "Deen Islam",
    designation: "DIRECTOR",
    shift: "9.30AM- 11.30AM Morning, All Shift, All shift for HSC, demo shift",
    joinDate: "2017-01-01",
    mobile: "01719486254",
    email: "expertjashore@gmail.com",
    gender: "Male",
    religion: "Islam",
    payroll: "Monthly",
    image: svgAvatar("Deen Islam", "0f7a55"),
    signature: "",
  },
  {
    id: "201709",
    name: "MD NAIMUR RAHMAN",
    designation: "TEACHER",
    shift: "9.30AM- 11.30AM Morning, All Shift, All shift for HSC, demo shift",
    joinDate: "2020-02-13",
    mobile: "01728773851",
    email: "",
    gender: "Male",
    religion: "Islam",
    payroll: "Monthly",
    image: svgAvatar("MD NAIMUR RAHMAN", "149467"),
    signature: "",
  },
  {
    id: "201710",
    name: "RASEL AHMED",
    designation: "TEACHER",
    shift: "9.30AM- 11.30AM Morning, All Shift, All shift for HSC, demo shift",
    joinDate: "2017-01-01",
    mobile: "01780308402",
    email: "",
    gender: "Male",
    religion: "Islam",
    payroll: "Monthly",
    image: svgAvatar("RASEL AHMED", "173d33"),
    signature: "",
  },
  {
    id: "201702",
    name: "K M ABDULLAH",
    designation: "TEACHER",
    shift: "9.30AM- 11.30AM Morning, All Shift, All shift for HSC, demo shift",
    joinDate: "2025-02-05",
    mobile: "01776767992",
    email: "",
    gender: "Male",
    religion: "Islam",
    payroll: "Monthly",
    image: svgAvatar("K M ABDULLAH", "49796b"),
    signature: "",
  },
  {
    id: "201703",
    name: "Rasel mahmud",
    designation: "TEACHER",
    shift: "9.30AM- 11.30AM Morning, All Shift, All shift for HSC, demo shift",
    joinDate: "2024-12-10",
    mobile: "01857387566",
    email: "",
    gender: "Male",
    religion: "Islam",
    payroll: "Monthly",
    image: svgAvatar("Rasel mahmud", "27785e"),
    signature: "",
  },
  {
    id: "201704",
    name: "MD NAIMUR RAHMAN",
    designation: "TEACHER",
    shift: "9.30AM- 11.30AM Morning, All Shift, All shift for HSC, demo shift",
    joinDate: "2020-02-13",
    mobile: "01728773851",
    email: "",
    gender: "Male",
    religion: "Islam",
    payroll: "Monthly",
    image: svgAvatar("MD NAIMUR RAHMAN", "238a62"),
    signature: "",
  },
  {
    id: "201705",
    name: "MD ASHIQ",
    designation: "TEACHER",
    shift: "9.30AM- 11.30AM Morning, All Shift, All shift for HSC, demo shift",
    joinDate: "2019-06-26",
    mobile: "01994538904",
    email: "",
    gender: "Male",
    religion: "Islam",
    payroll: "Monthly",
    image: svgAvatar("MD ASHIQ", "0f7a55"),
    signature: "",
  },
  {
    id: "201706",
    name: "UZZAL KUMAR",
    designation: "TEACHER",
    shift: "9.30AM- 11.30AM Morning, All Shift, All shift for HSC, demo shift",
    joinDate: "2025-06-03",
    mobile: "01968329208",
    email: "",
    gender: "Male",
    religion: "Hinduism",
    payroll: "Monthly",
    image: svgAvatar("UZZAL KUMAR", "1f7664"),
    signature: "",
  },
  {
    id: "201707",
    name: "MASUL BILLAH",
    designation: "TEACHER",
    shift: "9.30AM- 11.30AM Morning, All Shift, All shift for HSC, demo shift",
    joinDate: "2025-06-04",
    mobile: "01816986853",
    email: "",
    gender: "Male",
    religion: "Islam",
    payroll: "Monthly",
    image: svgAvatar("MASUL BILLAH", "0d6550"),
    signature: "",
  },
  {
    id: "201708",
    name: "MD ALAMIN",
    designation: "TEACHER",
    shift: "9.30AM- 11.30AM Morning, All Shift, All shift for HSC, demo shift",
    joinDate: "2025-06-10",
    mobile: "01404168885",
    email: "",
    gender: "Male",
    religion: "Islam",
    payroll: "Monthly",
    image: svgAvatar("MD ALAMIN", "126c4f"),
    signature: "",
  },
];

export const teacherStorageKeys = {
  extraTeachers: "expertDemoExtraTeachers",
  disabledTeacherIds: "expertDemoDisabledTeacherIds",
  teacherSettings: "expertDemoTeacherSettings",
};
