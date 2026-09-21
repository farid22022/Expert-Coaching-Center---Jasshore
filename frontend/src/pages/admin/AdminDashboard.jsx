const item = (label, children = null) => ({
  label,
  ...(children ? { children } : {}),
});

const slugify = (value) =>
  value
    .replace(/^\d+\.\s*/, "")
    .replace(/&/g, " and ")
    .replace(/\//g, " ")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function createPaths(items, parentPath = "/dashboard") {
  return items.map((menuItem) => {
    const path = `${parentPath}/${slugify(menuItem.label)}`;

    return {
      ...menuItem,
      path,
      ...(menuItem.children
        ? {
            children: createPaths(
              menuItem.children,
              path
            ),
          }
        : {}),
    };
  });
}

const rawDashboardMenu = [
  /* =====================================================
     1. USER MANAGEMENT
  ===================================================== */

  item("1. User Management", [
    item("Student", [
      item("Student Create"),
      item("Waiver Student"),
      item("Student List"),
      item("Student Quick Entry"),
      item("Student Quick Excell Entry"),
      item("Student Quick Update"),
      item("Student Admission Update"),
      item("Student Subject Assign"),
      item("Student Transfer"),
      item("Student RFID"),
      item("Student Info Excel Update"),
      item("Student Details Excel Entry"),
    ]),

    item("Teacher", [
      item("Teacher"),
      item("Teacher Quick Entry"),
      item("Teacher Quick Update"),
      item("Teacher Disable"),
      item("Teacher Restore"),
      item("Teacher Id Card"),
      item("Teacher Settings"),
    ]),

    item("Employee", [
      item("Employee"),
      item("Employee Quick Entry"),
      item("Employee Disable"),
      item("Employee Quick Update"),
      item("Employee Restore"),
      item("Employee Id Card"),
      item("Employee Settings"),
    ]),

    item("Management"),

    item("Student Id Card"),

    item("Teacher Employee RFID"),

    item("Other Users RFID"),

    item("Management Disable"),

    item("Management Restore"),
  ]),

  /* =====================================================
     2. ONLINE APPLICATION
  ===================================================== */

  item("2. Online Application", [
    item("Application", [
      item("Application List"),
      item("Pending List"),
      item("Form Setting"),
    ]),

    item("Admission Exam", [
      item("Mark Configure"),
      item("Add Mark"),
      item("Delete Marks"),
      item("Update Mark"),
      item("Seat Plan"),
    ]),

    item("Admission Result", [
      item("Result Process"),
      item("Tabulation Sheet"),
      item("Promoted List"),
      item("Subject Wise Result"),
    ]),

    item("Application Report", [
      item("Fees Report"),
      item("Application Report"),
      item("Amount Collected"),
    ]),
  ]),

  /* =====================================================
     3. ACADEMIC
  ===================================================== */

  item("3. Academic", [
    item("Subject", [
      item("Subject Transfer"),
      item("Subject Excel Entry"),
      item("Subject"),
    ]),

    item("Class Routine", [
      item("Class Routine Create"),
      item("Class Routine"),
      item("Class Routine Quick Edit"),
      item("Class Routine At A Glance"),
    ]),

    item("Building List"),

    item("Floor List"),

    item("Class Room List"),

    item("Class Teacher Assign List"),

    item("Subject Combine Create"),

    item("Class"),

    item("Section"),

    item("Syllabus"),

    item("Shift"),

    item("Student Group"),

    item("Student Category"),

    item("Academic Setup"),
  ]),

  /* =====================================================
     4. ATTENDANCE
  ===================================================== */

  item("4. Attendance", [
    item("Time Attendance"),

    item("Student Attendance"),

    item("Student Attendance Report"),

    item("Student Attendance Overview Report"),

    item("Student Details Attendance"),

    item("Student Attendance Summary"),

    item("Student Absent"),

    item("Teacher & Employee Attendance"),

    item("Teacher & Employee Attendance Report"),

    item("Teacher & Employee Details Attendance"),

    item("Teacher & Employee Attendance Summary"),

    item("Teacher & Employee Absent"),

    item("Teacher Class Attendance"),
  ]),

  /* =====================================================
     5. EXAMINATION
  ===================================================== */

  item("5. Examination", [
    item("Marks Configure", [
      item("Marks Distribution Excel Entry"),
      item("Manage Marks Distribution"),
      item("Marks Distribution"),
    ]),

    item("Grade", [
      item("Grade"),
      item("Grade Transfer"),
    ]),

    item("Signature Sheet"),

    item("Exam List"),

    item("Exam Routine"),

    item("Exam Routine Edit"),

    item("Admit Card Report"),

    item("Seat Plan"),

    item("Seat Plan Report"),

    item("Teacher Exam Subject Assign"),
  ]),

  /* =====================================================
     7. RESULT
  ===================================================== */

  item("7. Result", [
    item("Result Position Setup"),

    item("Result Process"),

    item("Mark Sheet"),

    item("Tabulation Sheet"),

    item("Grade Sheet Report"),

    item("Merit List"),

    item("Fail Report"),

    item("Subject Wise Result"),

    item("Subject Wise Fail Report"),

    item("Exam Wise Roll Update"),

    item("Promotion"),

    item("Result Publish"),

    item("Exam Result Summary"),

    item("Student Result Summary"),
  ]),

  /* =====================================================
     GRAND FINAL RESULT
  ===================================================== */

  item("8. Grand Final Result", [
    item("Grand Exam Configure Manage"),

    item("Grand Result Process"),

    item("Mark Sheet"),

    item("Tabulation Sheet"),

    item("Merit List"),

    item("Grade Sheet Report"),

    item("Fail Report"),

    item("Subject Wise Fail"),

    item("Subject Wise Result"),

    item("Teacher Wise Result"),

    item("Student Promotion"),
  ]),

  /* =====================================================
     10. MANAGE ACCOUNTS
  ===================================================== */

  item("10. Manage Accounts", [
    item("Fees Collection", [
      item("Fees Collection Create"),
      item("Fees Collection List"),
      item("Fees Collection Due Details"),
      item("Student Due Details"),
      item("Fee Settings"),
      item("SMS Setup"),
      item("Fees Collection Approve"),
      item("Student Fee Method Setup"),
    ]),

    item("Fees Category", [
      item("Fees Category Create"),
      item("Fees Category List"),
      item("Student Waiver"),
      item("Mid Year Fees Reduction"),
    ]),

    item("Custom Fee", [
      item("Custom Fee Create"),
      item("Custom Fee List"),
    ]),

    item("Expense Category", [
      item("Expense Category Create"),
      item("Expense Category List"),
    ]),

    item("Expense", [
      item("Expense Create"),
      item("Expense List"),
    ]),

    item("Income Category", [
      item("Income Category Create"),
      item("Income Category List"),
    ]),

    item("Income", [
      item("Income Create"),
      item("Income List"),
    ]),

    item("General Ledger"),

    item("Fund Transfer", [
      item("Fund Transfer Create"),
      item("Fund Transfer List"),
    ]),

    item("Payment Gateway", [
      item("Payment Gateway Create"),
      item("Payment Gateway List"),
    ]),

    item("Payment History"),

    item("Balance Sheet Data"),

    item("All Account Reports"),

    item("Account Settings"),
  ]),

  /* =====================================================
     11. HR AND PAYROLL
  ===================================================== */

  item("11. Hr And Payroll", [
    item("Salary", [
      item("Salary Create"),
      item("Salary List"),
    ]),

    item("Leave Application", [
      item("Leave Application Create"),
      item("Leave Application List"),
    ]),

    item("Payroll", [
      item("Payroll Create"),
      item("Payroll List"),
    ]),
  ]),

  /* =====================================================
     12. MAIL SMS SERVICE
  ===================================================== */

  item("12. Mail Sms Service", [
    item("Manage HR SMS", [
      item("Teacher/Employee SMS List"),

      item(
        "Teacher/Employee Joining SMS Create"
      ),

      item(
        "Teacher/Employee Attendance SMS Create"
      ),

      item(
        "Teacher/Employee Absent SMS Create"
      ),

      item(
        "Teacher/Employee Salary SMS Create"
      ),
    ]),

    item("Contact Category", [
      item("Contact Category Create"),
      item("Contact Category List"),
    ]),

    item("Contacts", [
      item("Contacts Create"),
      item("Contacts List"),
    ]),

    item("SMS API", [
      item("SMS API Create"),
      item("SMS API List"),
    ]),

    item("SMS Campaign", [
      item("SMS Campaign Create"),
      item("SMS Report List"),
      item("SMS Report Search"),
      item("SMS Campaign Organization"),
    ]),

    item("Manage Student SMS", [
      item("Student SMS List"),
      item("Student Admission Online"),
      item("Student Admission Software"),
      item("Student Attendance SMS Create"),
      item("Student Absent SMS Create"),
      item(
        "Student Fees Collection SMS Create"
      ),
      item("Student Due Fees SMS Create"),
      item("Subject Wise Result SMS"),
      item("Result SMS"),
    ]),

    item("SMS/Mail Setup"),

    item("SMS/Mail Template"),
  ]),

  /* =====================================================
     13. MANAGE LIBRARY
  ===================================================== */

  item("13. Manage Library", [
    item("Publisher", [
      item("Publisher Create"),
      item("Publisher List"),
    ]),

    item("Author", [
      item("Author Create"),
      item("Author List"),
    ]),

    item("Book Category", [
      item("Book Category Create"),
      item("Book Category List"),
    ]),

    item("Book", [
      item("Book Create"),
      item("Book List"),
    ]),

    item("Book Issue", [
      item("Book Issue Create"),
      item("Book Issue List"),
    ]),

    item("Book Return"),

    item("Book Returned List"),
  ]),

  /* =====================================================
     14. CERTIFICATE REPORT
  ===================================================== */

  item("14. Certificate Report", [
    item("Give Certificate"),

    item("Certificate Report"),

    item("Certificate Settings"),
  ]),

  /* =====================================================
     15. ALL REPORTS
  ===================================================== */

  item("15. All Reports", [
    item("Student Report"),

    item("Create Inactive Student"),

    item("Inactive Student List"),

    item("Class Summary Report"),
  ]),

  /* =====================================================
     16. HOSTEL MANAGEMENT
  ===================================================== */

  item("16. Hostel Management", [
    item("Hostel Student", [
      item("Hostel Student Auto Enroll"),
      item("Hostel Student Create"),
      item("Hostel Student List"),
    ]),

    item("HMS Expense", [
      item("HMS Expense Create"),
      item("HMS Expense List"),
      item("HMS Expense Report"),
    ]),

    item("HMS Expense Category", [
      item("HMS Expense Category Create"),
      item("HMS Expense Category List"),
    ]),

    item("Hostel Fee", [
      item("Hostel Fee Create"),
      item("Hostel Fee List"),
      item("Hostel Fee Dues"),
      item("Fees Collection Summary"),
      item("Income Statement"),
      item("Payment History"),
      item("Fee Setup"),
    ]),

    item("Hms Income", [
      item("Hms Income Create"),
      item("Hms Income List"),
    ]),

    item("Hms Income Category", [
      item("Hms Income Category Create"),
      item("Hms Income Category List"),
    ]),
  ]),

  /* =====================================================
     17. COACHING MANAGEMENT
  ===================================================== */

  item("17. Coaching Management", [
    item("Coaching Student", [
      item("Coaching Student Auto Enroll"),
      item("Coaching Student Create"),
      item("Coaching Student List"),
    ]),

    item("Coaching Fee", [
      item("Coaching Fee Create"),
      item("Coaching Fee List"),
      item("Coaching Fee Dues"),
      item("Fees Collection Summary"),
      item("Income Statement"),
      item("Payment History"),
      item("Fee Setup"),
    ]),

    item("CMS Expense", [
      item("CMS Expense Create"),
      item("CMS Expense List"),
      item("CMS Expense Report"),
    ]),

    item("CMS Expense Category", [
      item("CMS Expense Category Create"),
      item("CMS Expense Category List"),
    ]),

    item("Cms Income Category", [
      item("Cms Income Category Create"),
      item("Cms Income Category List"),
    ]),

    item("Cms Income", [
      item("Cms Income Create"),
      item("Cms Income List"),
    ]),
  ]),

  /* =====================================================
     18. ADMIN PANEL
  ===================================================== */

  item("18. Admin Panel", [
    item("Pay Bill"),

    item("Academic Year"),

    item("Admin List"),

    item("Reset Password"),

    item("Role"),

    item("User Login History"),

    item("Admin Disable"),

    item("Admin Restore"),
  ]),

  /* =====================================================
     19. DYNAMIC WEBSITE
  ===================================================== */

  item("19. Dynamic Website", [
    item("Front Service Box", [
      item("Front Service Box Create"),
      item("Front Service Box List"),
    ]),

    item("Notice Category", [
      item("Notice Category Create"),
      item("Notice Category List"),
    ]),

    item("Notice", [
      item("Notice Create"),
      item("Notice List"),
    ]),

    item("News Category", [
      item("News Category Create"),
      item("News Category List"),
    ]),

    item("News", [
      item("News Create"),
      item("News List"),
    ]),

    item("Photo Gallery Category", [
      item("Photo Gallery Category Create"),
      item("Photo Gallery Category List"),
    ]),

    item("Photo Gallery", [
      item("Photo Gallery Create"),
      item("Photo Gallery List"),
    ]),

    item("Video Gallery Category", [
      item("Video Gallery Category Create"),
      item("Video Gallery Category List"),
    ]),

    item("Video Gallery", [
      item("Video Gallery Create"),
      item("Video Gallery List"),
    ]),

    item("Pop Up", [
      item("Pop Up Create"),
      item("Pop Up List"),
    ]),

    item("Website Settings", [
      item("Website Settings Create"),
    ]),

    item("Custom Page List"),

    item("Slider List"),

    item("Menu List"),
  ]),

  /* =====================================================
     20. SYSTEM SETUP
  ===================================================== */

  item("20. System Setup", [
    item("Leave Category", [
      item("Leave Category Create"),
      item("Leave Category List"),
    ]),

    item("Holiday Category", [
      item("Holiday Category Create"),
      item("Holiday Category List"),
    ]),

    item("Yearly Holiday", [
      item("Yearly Holiday Create"),
      item("Yearly Holiday List"),
    ]),

    item("Blood Group", [
      item("Blood Group Create"),
      item("Blood Group List"),
    ]),

    item("Designation", [
      item("Designation Create"),
      item("Designation List"),
    ]),

    item("Religion", [
      item("Religion Create"),
      item("Religion List"),
    ]),

    item("Gender", [
      item("Gender Create"),
      item("Gender List"),
    ]),

    item("Education", [
      item("Education Create"),
      item("Education List"),
    ]),

    item("Profession", [
      item("Profession Create"),
      item("Profession List"),
    ]),

    item("Divisions", [
      item("Divisions Create"),
      item("Divisions List"),
    ]),

    item("Districts", [
      item("Districts Create"),
      item("Districts List"),
    ]),

    item("Upazilas", [
      item("Upazilas Create"),
      item("Upazilas List"),
    ]),
  ]),

  /* =====================================================
     STUDENT WORK
  ===================================================== */

  item("Student Work", [
    item("Class Work", [
      item("Class Work Create"),
      item("Class Work List"),
    ]),

    item("Assignment", [
      item("Assignment Create"),
      item("Assignment List"),
    ]),

    item("Home Work", [
      item("Home Work Create"),
      item("Home Work List"),
      item("Home Work At A Glance"),
    ]),
  ]),
];

export const dashboardMenu =
  createPaths(rawDashboardMenu);