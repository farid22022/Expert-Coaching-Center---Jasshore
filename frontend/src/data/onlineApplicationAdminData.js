export const onlineApplicationSessions = [
  "2026",
  "2025",
  "2024",
  "2023",
];

export const onlineApplicationClasses = [
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "HSC 1st Year",
  "HSC 2nd Year",
];

export const onlineApplicationShifts = [
  "Morning",
  "Day",
  "Evening",
];

export const paymentMethods = [
  "Cash",
  "bKash",
  "Nagad",
  "Rocket",
  "Bank",
  "Online Gateway",
];

export const paidToOptions = [
  "Admission Fee",
  "Application Fee",
  "Exam Fee",
  "Registration Fee",
];

export const demoApplications = [
  {
    id: "APP-2026-001",
    studentId: "STU-2026-001",
    studentName: "Fahim Hasan",
    gender: "Male",
    className: "Nine",
    session: "2026",
    shift: "Morning",
    contact: "01711000001",
    paidTo: "Application Fee",
    paidBy: "bKash",
    paymentNumber: "01711000001",
    senderNumber: "01711000001",
    transactionId: "BKX100001",
    amount: 500,
    createdDate: "2026-01-05",
    photo:
      "https://placehold.co/80x90/e8f2ee/173d33?text=FH",
  },

  {
    id: "APP-2026-002",
    studentId: "STU-2026-002",
    studentName: "Ayesha Rahman",
    gender: "Female",
    className: "Ten",
    session: "2026",
    shift: "Day",
    contact: "01711000002",
    paidTo: "Admission Fee",
    paidBy: "Nagad",
    paymentNumber: "01711000002",
    senderNumber: "01711000002",
    transactionId: "NGD200001",
    amount: 1000,
    createdDate: "2026-01-07",
    photo:
      "https://placehold.co/80x90/e8f2ee/173d33?text=AR",
  },
];

export const demoPendingApplications = [
  {
    id: "PENDING-001",
    studentId: "STU-P-001",
    studentName: "Nusrat Jahan",
    gender: "Female",
    className: "Nine",
    session: "2026",
    shift: "Morning",
    contact: "01711000003",
    paymentNumber: "01711000003",
    senderNumber: "01811000003",
    paymentMethod: "bKash",
    paidTo: "Application Fee",
    transactionId: "BKX-PENDING-01",
    amount: 500,
    createdDate: "2026-01-10",
    photo:
      "https://placehold.co/80x90/e8f2ee/173d33?text=NJ",
  },
];