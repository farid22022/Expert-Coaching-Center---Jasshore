export const institution = {
  name: "EXPERT COACHING CENTER",
  address: "Stadium Road, Puraton Library, Judge Court Mor, Jashore",
  established: "2017",
  phone: "01719486254",
  email: "expertjashore@gmail.com",
  founder: "Deen Islam",
  founderBn: "দীন ইসলাম",
  founderTitle: "Director",
};

export const navGroups = [
  // { label: "Home", path: "/" },
  {
    label: "Admission",
    items: [
      ["Online Admission", "/admission/online"],
      ["Blank Admission Form", "/admission/form"],
      ["Applicant's Form", "/admission/applicant"],
    ],
  },
  {
    label: "Others",
    items: [
      ["Notices", "/notices"],
      ["News", "/news"],
      ["Events", "/events"],
      ["Photo Gallery", "/gallery/photos"],
      ["Video Gallery", "/gallery/videos"],
    ],
  },
  { label: "Stories", path: "/stories" },
  { label: "Contact Us", path: "/contact" },
];

export const studentCorner = [
  ["Digital Content", "/digital-content"],
  ["Notice Board", "/notices"],
  ["Boys Scout", "/boys-scout"],
  ["Exam Routine", "/academic/exam-routine"],
  ["Form Download", "/admission/form"],
  ["Students Statistics", "/student-statistics"],
  ["Books Download (NCTB)", "/nctb-books"],
  ["Results Archive", "/result/board"],
];
