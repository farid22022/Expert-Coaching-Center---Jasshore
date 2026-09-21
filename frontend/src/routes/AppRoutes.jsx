import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home.jsx";

import {
  AboutText,
  ProfilePage,
  TeachersPage,
} from "../pages/AboutPages.jsx";

import {
  StudentsPage,
  ClassRoutinePage,
  ExamRoutinePage,
  RulesPage,
  UniformPage,
  HolidaysPage,
} from "../pages/AcademicPages.jsx";

import {
  IndividualResultPage,
  AssessmentPage,
  BoardResultPage,
} from "../pages/ResultPages.jsx";

import {
  OnlineAdmissionPage,
  AdmissionResultPage,
  BlankFormPage,
  ApplicantPage,
  AdmitCardPage,
} from "../pages/AdmissionPages.jsx";

import {
  ListingPage,
  DetailPage,
} from "../pages/ContentPages.jsx";

import {
  PhotoGalleryPage,
  VideoGalleryPage,
} from "../pages/GalleryPages.jsx";

import Contact from "../pages/Contact.jsx";
import SearchPage from "../pages/SearchPage.jsx";

import UtilityPage, {
  NotFound,
} from "../pages/UtilityPage.jsx";

import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";

import {
  AdmissionTestsDashboard,
  AdmissionTestGroup,
  AdmissionTestInstructions,
  AdmissionLiveTest,
  AdmissionTestResult,
  AdmissionTestReview,
  MyTestsPage,
} from "../pages/AdmissionTests.jsx";

import StudentProfile from "../components/common/StudentProfile.jsx";

import AdminLogin from "../pages/admin/AdminLogin.jsx";
import DashboardLayout from "../pages/admin/DashboardLayout.jsx";

import DashboardHome, {
  DashboardPlaceholder,
} from "../pages/admin/DashboardHome.jsx";

import AdminModulePage from "../pages/admin/Dashboard/common/AdminModulePages.jsx";

import AttendanceDashboard, {
  TimeAttendance,
  StudentAttendance,
  StudentAttendanceReport,
  StudentAttendanceOverviewReport,
  StudentDetailsAttendance,
  StudentAttendanceSummary,
  StudentAbsent,
  TeacherEmployeeAttendance,
  TeacherEmployeeAttendanceReport,
  TeacherEmployeeDetailsAttendance,
  TeacherEmployeeAttendanceSummary,
  TeacherEmployeeAbsent,
  TeacherClassAttendance,
} from "../pages/admin/Dashboard/attendance/AttendanceDashboard.jsx";

import ExaminationDashboard from "../pages/admin/Dashboard/examination/ExaminationDashboard.jsx";

import {
  MarksDistributionExcelEntry,
  ManageMarksDistribution,
  MarksDistribution,
} from "../pages/admin/Dashboard/examination/marks-configure/MarksConfigurePages.jsx";

import {
  GradePage,
  GradeTransferPage,
} from "../pages/admin/Dashboard/examination/grade/GradePages.jsx";

import {
  SignatureSheetPage,
  ExamListPage,
  ExamRoutinePage as AdminExamRoutinePage,
  ExamRoutineEditPage,
  AdmitCardReportPage,
  SeatPlanPage as AdminSeatPlanPage,
  SeatPlanReportPage,
  TeacherExamSubjectAssignPage,
} from "../pages/admin/Dashboard/examination/ExaminationSimplePages.jsx";

import ManageAccountsDashboard from "../pages/admin/Dashboard/manage-accounts/ManageAccountsDashboard.jsx";

import {
  FeesCollectionCreatePage,
  FeesCollectionListPage,
  FeesCollectionDueDetailsPage,
  StudentDueDetailsPage,
  FeeSettingsPage,
  SmsSetupPage,
  FeesCollectionApprovePage,
  StudentFeeMethodSetupPage,
} from "../pages/admin/Dashboard/manage-accounts/fees-collection/FeesCollectionPages.jsx";

import {
  FeesCategoryCreatePage,
  FeesCategoryListPage,
  StudentWaiverPage,
  MidYearFeesReductionPage,
} from "../pages/admin/Dashboard/manage-accounts/fees-category/FeesCategoryPages.jsx";

import {
  CustomFeeCreatePage,
  CustomFeeListPage,
} from "../pages/admin/Dashboard/manage-accounts/custom-fee/CustomFeePages.jsx";

import {
  ExpenseCategoryCreatePage,
  ExpenseCategoryListPage,
} from "../pages/admin/Dashboard/manage-accounts/expense-category/ExpenseCategoryPages.jsx";

import {
  ExpenseCreatePage,
  ExpenseListPage,
} from "../pages/admin/Dashboard/manage-accounts/expense/ExpensePages.jsx";

import {
  IncomeCategoryCreatePage,
  IncomeCategoryListPage,
} from "../pages/admin/Dashboard/manage-accounts/income-category/IncomeCategoryPages.jsx";

import {
  IncomeCreatePage,
  IncomeListPage,
} from "../pages/admin/Dashboard/manage-accounts/income/IncomePages.jsx";

import {
  FundTransferCreatePage,
  FundTransferListPage,
} from "../pages/admin/Dashboard/manage-accounts/fund-transfer/FundTransferPages.jsx";

import {
  PaymentGatewayCreatePage,
  PaymentGatewayListPage,
} from "../pages/admin/Dashboard/manage-accounts/payment-gateway/PaymentGatewayPages.jsx";

import {
  GeneralLedgerPage,
  PaymentHistoryPage,
  BalanceSheetDataPage,
  AllAccountReportsPage,
  AccountSettingsPage,
} from "../pages/admin/Dashboard/manage-accounts/ManageAccountsSimplePages.jsx";

import HrAndPayrollDashboard from "../pages/admin/Dashboard/hr-and-payroll/HrAndPayrollDashboard.jsx";

import {
  SalaryCreatePage,
  SalaryListPage,
} from "../pages/admin/Dashboard/hr-and-payroll/salary/SalaryPages.jsx";

import {
  LeaveApplicationCreatePage,
  LeaveApplicationListPage,
} from "../pages/admin/Dashboard/hr-and-payroll/leave-application/LeaveApplicationPages.jsx";

import {
  PayrollCreatePage,
  PayrollListPage,
} from "../pages/admin/Dashboard/hr-and-payroll/payroll/PayrollPages.jsx";

import MailSmsServiceDashboard from "../pages/admin/Dashboard/mail-sms-service/MailSmsServiceDashboard.jsx";

import {
  TeacherEmployeeSmsListPage,
  TeacherEmployeeJoiningSmsCreatePage,
  TeacherEmployeeAttendanceSmsCreatePage,
  TeacherEmployeeAbsentSmsCreatePage,
  TeacherEmployeeSalarySmsCreatePage,
} from "../pages/admin/Dashboard/mail-sms-service/manage-hr-sms/ManageHrSmsPages.jsx";

import {
  ContactCategoryCreatePage,
  ContactCategoryListPage,
} from "../pages/admin/Dashboard/mail-sms-service/contact-category/ContactCategoryPages.jsx";

import {
  ContactsCreatePage,
  ContactsListPage,
} from "../pages/admin/Dashboard/mail-sms-service/contacts/ContactsPages.jsx";

import {
  SmsApiCreatePage,
  SmsApiListPage,
} from "../pages/admin/Dashboard/mail-sms-service/sms-api/SmsApiPages.jsx";

import {
  SmsCampaignCreatePage,
  SmsReportListPage,
  SmsReportSearchPage,
  SmsCampaignOrganizationPage,
} from "../pages/admin/Dashboard/mail-sms-service/sms-campaign/SmsCampaignPages.jsx";

import {
  StudentSmsListPage,
  StudentAdmissionOnlinePage,
  StudentAdmissionSoftwarePage,
  StudentAttendanceSmsCreatePage,
  StudentAbsentSmsCreatePage,
  StudentFeesCollectionSmsCreatePage,
  StudentDueFeesSmsCreatePage,
  SubjectWiseResultSmsPage,
  ResultSmsPage,
} from "../pages/admin/Dashboard/mail-sms-service/manage-student-sms/ManageStudentSmsPages.jsx";

import {
  SmsMailSetupPage,
  SmsMailTemplatePage,
} from "../pages/admin/Dashboard/mail-sms-service/MailSmsSimplePages.jsx";

import {
  MailSmsPageShell,
  MailSmsSectionPage,
} from "../pages/admin/Dashboard/mail-sms-service/mailSmsShared.jsx";

import CertificateReportDashboard from "../pages/admin/Dashboard/certificate-report/CertificateReportDashboard.jsx";

import {
  CertificateReportPage,
  CertificateSettingsPage,
  GiveCertificatePage,
} from "../pages/admin/Dashboard/certificate-report/CertificateReportPages.jsx";

import CoachingManagementDashboard from "../pages/admin/Dashboard/coaching-management/CoachingManagementDashboard.jsx";

import { CoachingSectionPage } from "../pages/admin/Dashboard/coaching-management/coachingManagementShared.jsx";

import {
  CoachingStudentAutoEnrollPage,
  CoachingStudentCreatePage,
  CoachingStudentListPage,
} from "../pages/admin/Dashboard/coaching-management/coaching-student/CoachingStudentPages.jsx";

import {
  CoachingFeeCreatePage,
  CoachingFeeListPage,
  CoachingFeeDuesPage,
  FeesCollectionSummaryPage,
  CoachingIncomeStatementPage,
  CoachingPaymentHistoryPage,
  CoachingFeeSetupPage,
} from "../pages/admin/Dashboard/coaching-management/coaching-fee/CoachingFeePages.jsx";

import {
  CmsExpenseCreatePage,
  CmsExpenseListPage,
  CmsExpenseReportPage,
} from "../pages/admin/Dashboard/coaching-management/cms-expense/CmsExpensePages.jsx";

import {
  CmsExpenseCategoryCreatePage,
  CmsExpenseCategoryListPage,
} from "../pages/admin/Dashboard/coaching-management/cms-expense-category/CmsExpenseCategoryPages.jsx";

import {
  CmsIncomeCategoryCreatePage,
  CmsIncomeCategoryListPage,
} from "../pages/admin/Dashboard/coaching-management/cms-income-category/CmsIncomeCategoryPages.jsx";

import {
  CmsIncomeCreatePage,
  CmsIncomeListPage,
} from "../pages/admin/Dashboard/coaching-management/cms-income/CmsIncomePages.jsx";

import AcademicDashboard from "../pages/admin/Dashboard/academic/AcademicDashboard.jsx";

import { AcademicSectionPage } from "../pages/admin/Dashboard/academic/academicShared.jsx";

import {
  SubjectTransferPage,
  SubjectExcelEntryPage,
  SubjectPage,
} from "../pages/admin/Dashboard/academic/subject/SubjectPages.jsx";

import {
  ClassRoutineCreatePage as AdminClassRoutineCreatePage,
  ClassRoutinePage as AdminClassRoutineListPage,
  ClassRoutineQuickEditPage,
  ClassRoutineAtAGlancePage,
} from "../pages/admin/Dashboard/academic/class-routine/ClassRoutinePages.jsx";

import {
  AcademicSetupPage,
  BuildingListPage,
  ClassPage as AcademicClassPage,
  ClassRoomListPage,
  ClassTeacherAssignListPage,
  FloorListPage,
  SectionPage as AcademicSectionListPage,
  ShiftPage,
  StudentCategoryPage,
  StudentGroupPage,
  SubjectCombineCreatePage,
  SyllabusPage,
} from "../pages/admin/Dashboard/academic/AcademicSimplePages.jsx";

import UserManagementDashboard, {
  UserManagementSectionPage,
} from "../pages/admin/Dashboard/user-management/UserManagementDashboard.jsx";


/* =========================================================
   STUDENT MANAGEMENT
========================================================= */

import {
  StudentDashboard,
  StudentCreate,
  WaiverStudent,
  StudentList,
  StudentQuickEntry,
  StudentQuickExcelEntry,
  StudentQuickUpdate,
  StudentAdmissionUpdate,
  StudentSubjectAssign,
  StudentTransfer,
  StudentRFID,
  StudentInfoExcelUpdate,
  StudentDetailsExcelEntry,
} from "../pages/admin/Dashboard/user-management/StudentManagementPages.jsx";


/* =========================================================
   TEACHER MANAGEMENT
========================================================= */

import {
  TeacherList,
  TeacherQuickEntry,
  TeacherQuickUpdate,
  TeacherDisable,
  TeacherRestore,
  TeacherIdCard,
  TeacherSettings,
} from "../pages/admin/Dashboard/user-management/TeacherManagementPages.jsx";


import {
  EmployeeList,
  EmployeeQuickEntry,
  EmployeeDisable,
  EmployeeQuickUpdate,
  EmployeeRestore,
  EmployeeIdCard,
  EmployeeSettings,
} from "../pages/admin/Dashboard/user-management/EmployeeManagementPages.jsx";
import ManagementPage from "../pages/admin/Dashboard/user-management/ManagementPage.jsx";
import StudentIdCardPage from "../pages/admin/Dashboard/user-management/StudentIdCardPage.jsx";
import TeacherEmployeeRFIDPage from "../pages/admin/Dashboard/user-management/TeacherEmployeeRFIDPage.jsx";
import OtherUsersRFIDPage from "../pages/admin/Dashboard/user-management/OtherUsersRFIDPage.jsx";
import ManagementDisablePage from "../pages/admin/Dashboard/user-management/ManagementDisablePage.jsx";
import ManagementRestorePage from "../pages/admin/Dashboard/user-management/ManagementRestorePage.jsx";

import OnlineApplicationDashboard from "../pages/admin/Dashboard/online-application/OnlineApplicationDashboard.jsx";

import {
  ApplicationListPage,
  PendingApplicationPage,
  ApplicationFormSettingPage,
} from "../pages/admin/Dashboard/online-application/application/ApplicationPages.jsx";

import {
  AdmissionExamDashboard,
  MarkConfigurePage,
  AddMarkPage,
  DeleteMarksPage,
  UpdateMarkPage,
  SeatPlanPage,
} from "../pages/admin/Dashboard/online-application/admission-exam/AdmissionExamPages.jsx";

import {
  AdmissionResultDashboard,
  ResultProcessPage,
  TabulationSheetPage,
  PromotedListPage,
  SubjectWiseResultPage,
} from "../pages/admin/Dashboard/online-application/admission-result/AdmissionResultPages.jsx";

import {
  ApplicationReportDashboard,
  FeesReportPage,
  ApplicationReportPage,
  AmountCollectedPage,
} from "../pages/admin/Dashboard/online-application/application-report/ApplicationReportPages.jsx";


/* =========================================================
   RESULT MODULE
========================================================= */

import ResultDashboard from "../pages/admin/Dashboard/result/ResultDashboard.jsx";
import {
  ResultPositionSetupPage,
  ResultProcessPage as MainResultProcessPage,
  MarkSheetPage,
  TabulationSheetPage as MainResultTabulationSheetPage,
  GradeSheetReportPage,
  MeritListPage,
  FailReportPage,
  SubjectWiseResultPage as MainResultSubjectWiseResultPage,
  SubjectWiseFailReportPage,
  ExamWiseRollUpdatePage,
  PromotionPage,
  ResultPublishPage,
  ExamResultSummaryPage,
  StudentResultSummaryPage,
} from "../pages/admin/Dashboard/result/ResultPages.jsx";

/* =========================================================
   GRAND FINAL RESULT MODULE
========================================================= */

import GrandFinalResultDashboard from "../pages/admin/Dashboard/grand-final-result/GrandFinalResultDashboard.jsx";
import {
  GrandExamConfigureManagePage,
  GrandResultProcessPage,
  GrandMarkSheetPage,
  GrandTabulationSheetPage,
  GrandMeritListPage,
  GrandGradeSheetReportPage,
  GrandFailReportPage,
  GrandSubjectWiseFailPage,
  GrandSubjectWiseResultPage,
  GrandTeacherWiseResultPage,
  GrandStudentPromotionPage,
} from "../pages/admin/Dashboard/grand-final-result/GrandFinalResultPages.jsx";

/* =========================================================
   MANAGE LIBRARY MODULE
========================================================= */

import ManageLibraryDashboard from "../pages/admin/Dashboard/manage-library/ManageLibraryDashboard.jsx";
import {
  PublisherCreatePage,
  PublisherListPage,
} from "../pages/admin/Dashboard/manage-library/publisher/PublisherPages.jsx";
import {
  AuthorCreatePage,
  AuthorListPage,
} from "../pages/admin/Dashboard/manage-library/author/AuthorPages.jsx";
import {
  BookCategoryCreatePage,
  BookCategoryListPage,
} from "../pages/admin/Dashboard/manage-library/book-category/BookCategoryPages.jsx";
import {
  BookCreatePage,
  BookListPage,
} from "../pages/admin/Dashboard/manage-library/book/BookPages.jsx";
import {
  BookIssueCreatePage,
  BookIssueListPage,
} from "../pages/admin/Dashboard/manage-library/book-issue/BookIssuePages.jsx";
import {
  BookReturnPage,
  BookReturnedListPage,
} from "../pages/admin/Dashboard/manage-library/ManageLibrarySimplePages.jsx";

/* =========================================================
   ALL REPORTS MODULE
========================================================= */

import AllReportsDashboard from "../pages/admin/Dashboard/all-reports/AllReportsDashboard.jsx";
import {
  StudentReportPage,
  CreateInactiveStudentPage,
  InactiveStudentListPage,
  ClassSummaryReportPage,
} from "../pages/admin/Dashboard/all-reports/AllReportsPages.jsx";

/* =========================================================
   ADMIN PANEL MODULE
========================================================= */

import AdminPanelDashboard from "../pages/admin/Dashboard/admin-panel/AdminPanelDashboard.jsx";
import {
  PayBillPage,
  AcademicYearPage,
  AdminListPage,
  ResetPasswordPage,
  RolePage,
  UserLoginHistoryPage,
  AdminDisablePage,
  AdminRestorePage,
} from "../pages/admin/Dashboard/admin-panel/AdminPanelPages.jsx";

/* =========================================================
   SYSTEM SETUP MODULE
========================================================= */

import SystemSetupDashboard from "../pages/admin/Dashboard/system-setup/SystemSetupDashboard.jsx";
import { LeaveCategoryCreatePage, LeaveCategoryListPage } from "../pages/admin/Dashboard/system-setup/leave-category/LeaveCategoryPages.jsx";
import { HolidayCategoryCreatePage, HolidayCategoryListPage } from "../pages/admin/Dashboard/system-setup/holiday-category/HolidayCategoryPages.jsx";
import { YearlyHolidayCreatePage, YearlyHolidayListPage } from "../pages/admin/Dashboard/system-setup/yearly-holiday/YearlyHolidayPages.jsx";
import { BloodGroupCreatePage, BloodGroupListPage } from "../pages/admin/Dashboard/system-setup/blood-group/BloodGroupPages.jsx";
import { DesignationCreatePage, DesignationListPage } from "../pages/admin/Dashboard/system-setup/designation/DesignationPages.jsx";
import { ReligionCreatePage, ReligionListPage } from "../pages/admin/Dashboard/system-setup/religion/ReligionPages.jsx";
import { GenderCreatePage, GenderListPage } from "../pages/admin/Dashboard/system-setup/gender/GenderPages.jsx";
import { EducationCreatePage, EducationListPage } from "../pages/admin/Dashboard/system-setup/education/EducationPages.jsx";
import { ProfessionCreatePage, ProfessionListPage } from "../pages/admin/Dashboard/system-setup/profession/ProfessionPages.jsx";
import { DivisionsCreatePage, DivisionsListPage } from "../pages/admin/Dashboard/system-setup/divisions/DivisionsPages.jsx";
import { DistrictsCreatePage, DistrictsListPage } from "../pages/admin/Dashboard/system-setup/districts/DistrictsPages.jsx";
import { UpazilasCreatePage, UpazilasListPage } from "../pages/admin/Dashboard/system-setup/upazilas/UpazilasPages.jsx";

/* =========================================================
   STUDENT WORK MODULE
========================================================= */

import StudentWorkDashboard from "../pages/admin/Dashboard/student-work/StudentWorkDashboard.jsx";
import { ClassWorkCreatePage, ClassWorkListPage } from "../pages/admin/Dashboard/student-work/class-work/ClassWorkPages.jsx";
import { AssignmentCreatePage, AssignmentListPage } from "../pages/admin/Dashboard/student-work/assignment/AssignmentPages.jsx";
import { HomeWorkCreatePage, HomeWorkListPage, HomeWorkAtAGlancePage } from "../pages/admin/Dashboard/student-work/home-work/HomeWorkPages.jsx";

/* =========================================================
   MODULE DASHBOARDS WITHOUT DEDICATED CHILD PAGE FILES
========================================================= */

import HostelManagementDashboard from "../pages/admin/Dashboard/hostel-management/HostelManagementDashboard.jsx";
import DynamicWebsiteDashboard from "../pages/admin/Dashboard/dynamic-website/DynamicWebsiteDashboard.jsx";
/* =========================================================
   USER MANAGEMENT ROUTES
========================================================= */

function userManagementRoutes(basePath) {
  return (
    <>
      {/* =====================================================
          USER MANAGEMENT HOME
      ===================================================== */}

      <Route
        path={basePath}
        element={<UserManagementDashboard />}
      />


      {/* =====================================================
          STUDENT
      ===================================================== */}

      <Route
        path={`${basePath}/student`}
        element={<StudentDashboard />}
      />

      <Route
        path={`${basePath}/student/student-create`}
        element={<StudentCreate />}
      />

      <Route
        path={`${basePath}/student/waiver-student`}
        element={<WaiverStudent />}
      />

      <Route
        path={`${basePath}/student/student-list`}
        element={<StudentList />}
      />

      <Route
        path={`${basePath}/student/student-quick-entry`}
        element={<StudentQuickEntry />}
      />

      <Route
        path={`${basePath}/student/student-quick-excell-entry`}
        element={<StudentQuickExcelEntry />}
      />

      <Route
        path={`${basePath}/student/student-quick-update`}
        element={<StudentQuickUpdate />}
      />

      <Route
        path={`${basePath}/student/student-admission-update`}
        element={<StudentAdmissionUpdate />}
      />

      <Route
        path={`${basePath}/student/student-subject-assign`}
        element={<StudentSubjectAssign />}
      />

      <Route
        path={`${basePath}/student/student-transfer`}
        element={<StudentTransfer />}
      />

      <Route
        path={`${basePath}/student/student-rfid`}
        element={<StudentRFID />}
      />

      <Route
        path={`${basePath}/student/student-info-excel-update`}
        element={<StudentInfoExcelUpdate />}
      />

      <Route
        path={`${basePath}/student/student-details-excel-entry`}
        element={<StudentDetailsExcelEntry />}
      />


      {/* =====================================================
          TEACHER
      ===================================================== */}

      {/*
        Teacher parent route.

        This is useful when clicking:
        /dashboard/user-management/teacher

        It opens the Teacher List directly.
      */}

      <Route
        path={`${basePath}/teacher`}
        element={<TeacherList />}
      />


      {/*
        The sidebar's first child is also named "Teacher",
        therefore createPaths() generates:

        /teacher/teacher
      */}

      <Route
        path={`${basePath}/teacher/teacher`}
        element={<TeacherList />}
      />


      {/* Teacher Quick Entry */}

      <Route
        path={`${basePath}/teacher/teacher-quick-entry`}
        element={<TeacherQuickEntry />}
      />


      {/* Teacher Quick Update */}

      <Route
        path={`${basePath}/teacher/teacher-quick-update`}
        element={<TeacherQuickUpdate />}
      />


      {/* Teacher Disable */}

      <Route
        path={`${basePath}/teacher/teacher-disable`}
        element={<TeacherDisable />}
      />


      {/* Teacher Restore */}

      <Route
        path={`${basePath}/teacher/teacher-restore`}
        element={<TeacherRestore />}
      />


      {/* Teacher ID Card */}

      <Route
        path={`${basePath}/teacher/teacher-id-card`}
        element={<TeacherIdCard />}
      />


      {/* Teacher Settings */}

      <Route
        path={`${basePath}/teacher/teacher-settings`}
        element={<TeacherSettings />}
      />


      {/* =====================================================
          EMPLOYEE
      ===================================================== */}

      {/* =====================================================
    EMPLOYEE
===================================================== */}

      <Route
        path={`${basePath}/employee`}
        element={<EmployeeList />}
      />

      <Route
        path={`${basePath}/employee/employee`}
        element={<EmployeeList />}
      />

      <Route
        path={`${basePath}/employee/employee-quick-entry`}
        element={<EmployeeQuickEntry />}
      />

      <Route
        path={`${basePath}/employee/employee-disable`}
        element={<EmployeeDisable />}
      />

      <Route
        path={`${basePath}/employee/employee-quick-update`}
        element={<EmployeeQuickUpdate />}
      />

      <Route
        path={`${basePath}/employee/employee-restore`}
        element={<EmployeeRestore />}
      />

      <Route
        path={`${basePath}/employee/employee-id-card`}
        element={<EmployeeIdCard />}
      />

      <Route
        path={`${basePath}/employee/employee-settings`}
        element={<EmployeeSettings />}
      />


      {/* =====================================================
          USERS / ACCOUNT SETTINGS
      ===================================================== */}

      <Route
        path={`${basePath}/users`}
        element={
          <UserManagementSectionPage
            title="Account Settings"
          />
        }
      />


      {/* =====================================================
          MANAGEMENT
      ===================================================== */}

      <Route
        path={`${basePath}/management`}
        element={<ManagementPage />}
      />


      {/* =====================================================
          STUDENT ID CARD
      ===================================================== */}

      <Route
        path={`${basePath}/student-id-card`}
        element={<StudentIdCardPage />}
      />


      {/* =====================================================
          TEACHER EMPLOYEE RFID
      ===================================================== */}

      <Route
        path={`${basePath}/teacher-employee-rfid`}
        element={<TeacherEmployeeRFIDPage />}
      />


      {/* =====================================================
          OTHER USERS RFID
      ===================================================== */}

      <Route
        path={`${basePath}/other-users-rfid`}
        element={<OtherUsersRFIDPage />}
      />


      {/* =====================================================
          MANAGEMENT DISABLE
      ===================================================== */}

      <Route
        path={`${basePath}/management-disable`}
        element={<ManagementDisablePage />}
      />


      {/* =====================================================
          MANAGEMENT RESTORE
      ===================================================== */}

      <Route
        path={`${basePath}/management-restore`}
        element={<ManagementRestorePage />}
      />
    </>
  );
}

/* =========================================================
   ONLINE APPLICATION ROUTES
========================================================= */

function onlineApplicationRoutes(basePath) {
  return (
    <>
      <Route
        path={basePath}
        element={<OnlineApplicationDashboard />}
      />

      {/* =====================================================
          APPLICATION
      ===================================================== */}

      {/* Parent Application route */}
      <Route
        path={`${basePath}/application`}
        element={<ApplicationListPage />}
      />

      {/* Application List */}
      <Route
        path={`${basePath}/application/application-list`}
        element={<ApplicationListPage />}
      />

      {/* Pending List */}
      <Route
        path={`${basePath}/application/pending-list`}
        element={<PendingApplicationPage />}
      />

      {/* Form Setting */}
      <Route
        path={`${basePath}/application/form-setting`}
        element={<ApplicationFormSettingPage />}
      />

      <Route
        path={`${basePath}/admission-exam`}
        element={<AdmissionExamDashboard />}
      />

      <Route
        path={`${basePath}/admission-exam/mark-configure`}
        element={<MarkConfigurePage />}
      />

      <Route
        path={`${basePath}/admission-exam/add-mark`}
        element={<AddMarkPage />}
      />

      <Route
        path={`${basePath}/admission-exam/delete-marks`}
        element={<DeleteMarksPage />}
      />

      <Route
        path={`${basePath}/admission-exam/update-mark`}
        element={<UpdateMarkPage />}
      />

      <Route
        path={`${basePath}/admission-exam/seat-plan`}
        element={<SeatPlanPage />}
      />

      <Route
        path={`${basePath}/admission-result`}
        element={<AdmissionResultDashboard />}
      />

      <Route
        path={`${basePath}/admission-result/result-process`}
        element={<ResultProcessPage />}
      />

      <Route
        path={`${basePath}/admission-result/tabulation-sheet`}
        element={<TabulationSheetPage />}
      />

      <Route
        path={`${basePath}/admission-result/promoted-list`}
        element={<PromotedListPage />}
      />

      <Route
        path={`${basePath}/admission-result/subject-wise-result`}
        element={<SubjectWiseResultPage />}
      />

      <Route
        path={`${basePath}/application-report`}
        element={<ApplicationReportDashboard />}
      />

      <Route
        path={`${basePath}/application-report/fees-report`}
        element={<FeesReportPage />}
      />

      <Route
        path={`${basePath}/application-report/application-report`}
        element={<ApplicationReportPage />}
      />

      <Route
        path={`${basePath}/application-report/amount-collected`}
        element={<AmountCollectedPage />}
      />
    </>
  );
}

/* =========================================================
   ATTENDANCE ROUTES
========================================================= */

function attendanceRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<AttendanceDashboard />} />

      <Route
        path={`${basePath}/time-attendance`}
        element={<TimeAttendance />}
      />

      <Route
        path={`${basePath}/student-attendance`}
        element={<StudentAttendance />}
      />

      <Route
        path={`${basePath}/student-attendance-report`}
        element={<StudentAttendanceReport />}
      />

      <Route
        path={`${basePath}/student-attendance-overview-report`}
        element={<StudentAttendanceOverviewReport />}
      />

      <Route
        path={`${basePath}/student-details-attendance`}
        element={<StudentDetailsAttendance />}
      />

      <Route
        path={`${basePath}/student-attendance-summary`}
        element={<StudentAttendanceSummary />}
      />

      <Route
        path={`${basePath}/student-absent`}
        element={<StudentAbsent />}
      />

      <Route
        path={`${basePath}/teacher-employee-attendance`}
        element={<TeacherEmployeeAttendance />}
      />

      <Route
        path={`${basePath}/teacher-and-employee-attendance`}
        element={<TeacherEmployeeAttendance />}
      />

      <Route
        path={`${basePath}/teacher-employee-attendance-report`}
        element={<TeacherEmployeeAttendanceReport />}
      />

      <Route
        path={`${basePath}/teacher-and-employee-attendance-report`}
        element={<TeacherEmployeeAttendanceReport />}
      />

      <Route
        path={`${basePath}/teacher-employee-details-attendance`}
        element={<TeacherEmployeeDetailsAttendance />}
      />

      <Route
        path={`${basePath}/teacher-and-employee-details-attendance`}
        element={<TeacherEmployeeDetailsAttendance />}
      />

      <Route
        path={`${basePath}/teacher-employee-attendance-summary`}
        element={<TeacherEmployeeAttendanceSummary />}
      />

      <Route
        path={`${basePath}/teacher-and-employee-attendance-summary`}
        element={<TeacherEmployeeAttendanceSummary />}
      />

      <Route
        path={`${basePath}/teacher-employee-absent`}
        element={<TeacherEmployeeAbsent />}
      />

      <Route
        path={`${basePath}/teacher-and-employee-absent`}
        element={<TeacherEmployeeAbsent />}
      />

      <Route
        path={`${basePath}/teacher-class-attendance`}
        element={<TeacherClassAttendance />}
      />
    </>
  );
}

/* =========================================================
   EXAMINATION ROUTES
========================================================= */

function examinationRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<ExaminationDashboard />} />

      <Route
        path={`${basePath}/marks-configure/marks-distribution-excel-entry`}
        element={<MarksDistributionExcelEntry />}
      />

      <Route
        path={`${basePath}/marks-configure/manage-marks-distribution`}
        element={<ManageMarksDistribution />}
      />

      <Route
        path={`${basePath}/marks-configure/marks-distribution`}
        element={<MarksDistribution />}
      />

      <Route path={`${basePath}/grade/grade`} element={<GradePage />} />

      <Route
        path={`${basePath}/grade/grade-transfer`}
        element={<GradeTransferPage />}
      />

      <Route
        path={`${basePath}/signature-sheet`}
        element={<SignatureSheetPage />}
      />

      <Route path={`${basePath}/exam-list`} element={<ExamListPage />} />

      <Route
        path={`${basePath}/exam-routine`}
        element={<AdminExamRoutinePage />}
      />

      <Route
        path={`${basePath}/exam-routine-edit`}
        element={<ExamRoutineEditPage />}
      />

      <Route
        path={`${basePath}/admit-card-report`}
        element={<AdmitCardReportPage />}
      />

      <Route path={`${basePath}/seat-plan`} element={<AdminSeatPlanPage />} />

      <Route
        path={`${basePath}/seat-plan-report`}
        element={<SeatPlanReportPage />}
      />

      <Route
        path={`${basePath}/teacher-exam-subject-assign`}
        element={<TeacherExamSubjectAssignPage />}
      />
    </>
  );
}

/* =========================================================
   MANAGE ACCOUNTS ROUTES
========================================================= */

function manageAccountsRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<ManageAccountsDashboard />} />

      <Route path={`${basePath}/fees-collection/fees-collection-create`} element={<FeesCollectionCreatePage />} />
      <Route path={`${basePath}/fees-collection/fees-collection-list`} element={<FeesCollectionListPage />} />
      <Route path={`${basePath}/fees-collection/fees-collection-due-details`} element={<FeesCollectionDueDetailsPage />} />
      <Route path={`${basePath}/fees-collection/student-due-details`} element={<StudentDueDetailsPage />} />
      <Route path={`${basePath}/fees-collection/fee-settings`} element={<FeeSettingsPage />} />
      <Route path={`${basePath}/fees-collection/sms-setup`} element={<SmsSetupPage />} />
      <Route path={`${basePath}/fees-collection/fees-collection-approve`} element={<FeesCollectionApprovePage />} />
      <Route path={`${basePath}/fees-collection/student-fee-method-setup`} element={<StudentFeeMethodSetupPage />} />

      <Route path={`${basePath}/fees-category/fees-category-create`} element={<FeesCategoryCreatePage />} />
      <Route path={`${basePath}/fees-category/fees-category-list`} element={<FeesCategoryListPage />} />
      <Route path={`${basePath}/fees-category/student-waiver`} element={<StudentWaiverPage />} />
      <Route path={`${basePath}/fees-category/mid-year-fees-reduction`} element={<MidYearFeesReductionPage />} />

      <Route path={`${basePath}/custom-fee/custom-fee-create`} element={<CustomFeeCreatePage />} />
      <Route path={`${basePath}/custom-fee/custom-fee-list`} element={<CustomFeeListPage />} />

      <Route path={`${basePath}/expense-category/expense-category-create`} element={<ExpenseCategoryCreatePage />} />
      <Route path={`${basePath}/expense-category/expense-category-list`} element={<ExpenseCategoryListPage />} />

      <Route path={`${basePath}/expense/expense-create`} element={<ExpenseCreatePage />} />
      <Route path={`${basePath}/expense/expense-list`} element={<ExpenseListPage />} />

      <Route path={`${basePath}/income-category/income-category-create`} element={<IncomeCategoryCreatePage />} />
      <Route path={`${basePath}/income-category/income-category-list`} element={<IncomeCategoryListPage />} />

      <Route path={`${basePath}/income/income-create`} element={<IncomeCreatePage />} />
      <Route path={`${basePath}/income/income-list`} element={<IncomeListPage />} />

      <Route path={`${basePath}/general-ledger`} element={<GeneralLedgerPage />} />

      <Route path={`${basePath}/fund-transfer/fund-transfer-create`} element={<FundTransferCreatePage />} />
      <Route path={`${basePath}/fund-transfer/fund-transfer-list`} element={<FundTransferListPage />} />

      <Route path={`${basePath}/payment-gateway/payment-gateway-create`} element={<PaymentGatewayCreatePage />} />
      <Route path={`${basePath}/payment-gateway/payment-gateway-list`} element={<PaymentGatewayListPage />} />

      <Route path={`${basePath}/payment-history`} element={<PaymentHistoryPage />} />
      <Route path={`${basePath}/balance-sheet-data`} element={<BalanceSheetDataPage />} />
      <Route path={`${basePath}/all-account-reports`} element={<AllAccountReportsPage />} />
      <Route path={`${basePath}/account-settings`} element={<AccountSettingsPage />} />
    </>
  );
}

/* =========================================================
   HR AND PAYROLL ROUTES
========================================================= */

function hrPayrollRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<HrAndPayrollDashboard />} />

      <Route
        path={`${basePath}/salary/salary-create`}
        element={<SalaryCreatePage />}
      />

      <Route
        path={`${basePath}/salary/salary-list`}
        element={<SalaryListPage />}
      />

      <Route
        path={`${basePath}/leave-application/leave-application-create`}
        element={<LeaveApplicationCreatePage />}
      />

      <Route
        path={`${basePath}/leave-application/leave-application-list`}
        element={<LeaveApplicationListPage />}
      />

      <Route
        path={`${basePath}/payroll/payroll-create`}
        element={<PayrollCreatePage />}
      />

      <Route
        path={`${basePath}/payroll/payroll-list`}
        element={<PayrollListPage />}
      />
    </>
  );
}

/* =========================================================
   MAIL SMS SERVICE ROUTES
========================================================= */

function mailSmsRoutes(basePath) {
  const mailSmsPage = (title, Page) => (
    <MailSmsPageShell title={title}>
      <Page />
    </MailSmsPageShell>
  );

  return (
    <>
      <Route path={basePath} element={<MailSmsServiceDashboard />} />

      <Route path={`${basePath}/manage-hr-sms`} element={<MailSmsSectionPage group="manage-hr-sms" />} />
      <Route path={`${basePath}/manage-hr-sms/teacher-employee-sms-list`} element={mailSmsPage("Teacher/Employee SMS List", TeacherEmployeeSmsListPage)} />
      <Route path={`${basePath}/manage-hr-sms/teacher-employee-joining-sms-create`} element={mailSmsPage("Teacher/Employee Joining SMS Create", TeacherEmployeeJoiningSmsCreatePage)} />
      <Route path={`${basePath}/manage-hr-sms/teacher-employee-attendance-sms-create`} element={mailSmsPage("Teacher/Employee Attendance SMS Create", TeacherEmployeeAttendanceSmsCreatePage)} />
      <Route path={`${basePath}/manage-hr-sms/teacher-employee-absent-sms-create`} element={mailSmsPage("Teacher/Employee Absent SMS Create", TeacherEmployeeAbsentSmsCreatePage)} />
      <Route path={`${basePath}/manage-hr-sms/teacher-employee-salary-sms-create`} element={mailSmsPage("Teacher/Employee Salary SMS Create", TeacherEmployeeSalarySmsCreatePage)} />

      <Route path={`${basePath}/contact-category`} element={<MailSmsSectionPage group="contact-category" />} />
      <Route path={`${basePath}/contact-category/contact-category-create`} element={mailSmsPage("Contact Category Create", ContactCategoryCreatePage)} />
      <Route path={`${basePath}/contact-category/contact-category-list`} element={mailSmsPage("Contact Category List", ContactCategoryListPage)} />

      <Route path={`${basePath}/contacts`} element={<MailSmsSectionPage group="contacts" />} />
      <Route path={`${basePath}/contacts/contacts-create`} element={mailSmsPage("Contacts Create", ContactsCreatePage)} />
      <Route path={`${basePath}/contacts/contacts-list`} element={mailSmsPage("Contacts List", ContactsListPage)} />

      <Route path={`${basePath}/sms-api`} element={<MailSmsSectionPage group="sms-api" />} />
      <Route path={`${basePath}/sms-api/sms-api-create`} element={mailSmsPage("SMS API Create", SmsApiCreatePage)} />
      <Route path={`${basePath}/sms-api/sms-api-list`} element={mailSmsPage("SMS API List", SmsApiListPage)} />

      <Route path={`${basePath}/sms-campaign`} element={<MailSmsSectionPage group="sms-campaign" />} />
      <Route path={`${basePath}/sms-campaign/sms-campaign-create`} element={mailSmsPage("SMS Campaign Create", SmsCampaignCreatePage)} />
      <Route path={`${basePath}/sms-campaign/sms-report-list`} element={mailSmsPage("SMS Report List", SmsReportListPage)} />
      <Route path={`${basePath}/sms-campaign/sms-report-search`} element={mailSmsPage("SMS Report Search", SmsReportSearchPage)} />
      <Route path={`${basePath}/sms-campaign/sms-campaign-organization`} element={mailSmsPage("SMS Campaign Organization", SmsCampaignOrganizationPage)} />

      <Route path={`${basePath}/manage-student-sms`} element={<MailSmsSectionPage group="manage-student-sms" />} />
      <Route path={`${basePath}/manage-student-sms/student-sms-list`} element={mailSmsPage("Student SMS List", StudentSmsListPage)} />
      <Route path={`${basePath}/manage-student-sms/student-admission-online`} element={mailSmsPage("Student Admission Online", StudentAdmissionOnlinePage)} />
      <Route path={`${basePath}/manage-student-sms/student-admission-software`} element={mailSmsPage("Student Admission Software", StudentAdmissionSoftwarePage)} />
      <Route path={`${basePath}/manage-student-sms/student-attendance-sms-create`} element={mailSmsPage("Student Attendance SMS Create", StudentAttendanceSmsCreatePage)} />
      <Route path={`${basePath}/manage-student-sms/student-absent-sms-create`} element={mailSmsPage("Student Absent SMS Create", StudentAbsentSmsCreatePage)} />
      <Route path={`${basePath}/manage-student-sms/student-fees-collection-sms-create`} element={mailSmsPage("Student Fees Collection SMS Create", StudentFeesCollectionSmsCreatePage)} />
      <Route path={`${basePath}/manage-student-sms/student-due-fees-sms-create`} element={mailSmsPage("Student Due Fees SMS Create", StudentDueFeesSmsCreatePage)} />
      <Route path={`${basePath}/manage-student-sms/subject-wise-result-sms`} element={mailSmsPage("Subject Wise Result SMS", SubjectWiseResultSmsPage)} />
      <Route path={`${basePath}/manage-student-sms/result-sms`} element={mailSmsPage("Result SMS", ResultSmsPage)} />

      <Route path={`${basePath}/sms-mail-setup`} element={mailSmsPage("SMS/Mail Setup", SmsMailSetupPage)} />
      <Route path={`${basePath}/sms-mail-template`} element={mailSmsPage("SMS/Mail Template", SmsMailTemplatePage)} />
    </>
  );
}

/* =========================================================
   CERTIFICATE REPORT ROUTES
========================================================= */

function certificateReportRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<CertificateReportDashboard />} />
      <Route path={`${basePath}/give-certificate`} element={<GiveCertificatePage />} />
      <Route path={`${basePath}/certificate-report`} element={<CertificateReportPage />} />
      <Route path={`${basePath}/certificate-settings`} element={<CertificateSettingsPage />} />
    </>
  );
}

/* =========================================================
   COACHING MANAGEMENT ROUTES
========================================================= */

function coachingManagementRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<CoachingManagementDashboard />} />

      <Route path={`${basePath}/coaching-student`} element={<CoachingSectionPage groupSlug="coaching-student" />} />
      <Route path={`${basePath}/coaching-student/coaching-student-auto-enroll`} element={<CoachingStudentAutoEnrollPage />} />
      <Route path={`${basePath}/coaching-student/auto-enroll`} element={<CoachingStudentAutoEnrollPage />} />
      <Route path={`${basePath}/coaching-student/coaching-student-create`} element={<CoachingStudentCreatePage />} />
      <Route path={`${basePath}/coaching-student/create`} element={<CoachingStudentCreatePage />} />
      <Route path={`${basePath}/coaching-student/coaching-student-list`} element={<CoachingStudentListPage />} />
      <Route path={`${basePath}/coaching-student/list`} element={<CoachingStudentListPage />} />

      <Route path={`${basePath}/coaching-fee`} element={<CoachingSectionPage groupSlug="coaching-fee" />} />
      <Route path={`${basePath}/coaching-fee/coaching-fee-create`} element={<CoachingFeeCreatePage />} />
      <Route path={`${basePath}/coaching-fee/create`} element={<CoachingFeeCreatePage />} />
      <Route path={`${basePath}/coaching-fee/coaching-fee-list`} element={<CoachingFeeListPage />} />
      <Route path={`${basePath}/coaching-fee/list`} element={<CoachingFeeListPage />} />
      <Route path={`${basePath}/coaching-fee/coaching-fee-dues`} element={<CoachingFeeDuesPage />} />
      <Route path={`${basePath}/coaching-fee/dues`} element={<CoachingFeeDuesPage />} />
      <Route path={`${basePath}/coaching-fee/fees-collection-summary`} element={<FeesCollectionSummaryPage />} />
      <Route path={`${basePath}/coaching-fee/income-statement`} element={<CoachingIncomeStatementPage />} />
      <Route path={`${basePath}/coaching-fee/payment-history`} element={<CoachingPaymentHistoryPage />} />
      <Route path={`${basePath}/coaching-fee/fee-setup`} element={<CoachingFeeSetupPage />} />

      <Route path={`${basePath}/cms-expense`} element={<CoachingSectionPage groupSlug="cms-expense" />} />
      <Route path={`${basePath}/cms-expense/cms-expense-create`} element={<CmsExpenseCreatePage />} />
      <Route path={`${basePath}/cms-expense/create`} element={<CmsExpenseCreatePage />} />
      <Route path={`${basePath}/cms-expense/cms-expense-list`} element={<CmsExpenseListPage />} />
      <Route path={`${basePath}/cms-expense/list`} element={<CmsExpenseListPage />} />
      <Route path={`${basePath}/cms-expense/cms-expense-report`} element={<CmsExpenseReportPage />} />
      <Route path={`${basePath}/cms-expense/report`} element={<CmsExpenseReportPage />} />

      <Route path={`${basePath}/cms-expense-category`} element={<CoachingSectionPage groupSlug="cms-expense-category" />} />
      <Route path={`${basePath}/cms-expense-category/cms-expense-category-create`} element={<CmsExpenseCategoryCreatePage />} />
      <Route path={`${basePath}/cms-expense-category/create`} element={<CmsExpenseCategoryCreatePage />} />
      <Route path={`${basePath}/cms-expense-category/cms-expense-category-list`} element={<CmsExpenseCategoryListPage />} />
      <Route path={`${basePath}/cms-expense-category/list`} element={<CmsExpenseCategoryListPage />} />

      <Route path={`${basePath}/cms-income-category`} element={<CoachingSectionPage groupSlug="cms-income-category" />} />
      <Route path={`${basePath}/cms-income-category/cms-income-category-create`} element={<CmsIncomeCategoryCreatePage />} />
      <Route path={`${basePath}/cms-income-category/create`} element={<CmsIncomeCategoryCreatePage />} />
      <Route path={`${basePath}/cms-income-category/cms-income-category-list`} element={<CmsIncomeCategoryListPage />} />
      <Route path={`${basePath}/cms-income-category/list`} element={<CmsIncomeCategoryListPage />} />

      <Route path={`${basePath}/cms-income`} element={<CoachingSectionPage groupSlug="cms-income" />} />
      <Route path={`${basePath}/cms-income/cms-income-create`} element={<CmsIncomeCreatePage />} />
      <Route path={`${basePath}/cms-income/create`} element={<CmsIncomeCreatePage />} />
      <Route path={`${basePath}/cms-income/cms-income-list`} element={<CmsIncomeListPage />} />
      <Route path={`${basePath}/cms-income/list`} element={<CmsIncomeListPage />} />
    </>
  );
}

/* =========================================================
   ACADEMIC ROUTES
========================================================= */

function academicRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<AcademicDashboard />} />

      <Route path={`${basePath}/subject`} element={<AcademicSectionPage group="subject" />} />
      <Route path={`${basePath}/subject/subject-transfer`} element={<SubjectTransferPage />} />
      <Route path={`${basePath}/subject/subject-excel-entry`} element={<SubjectExcelEntryPage />} />
      <Route path={`${basePath}/subject/subject`} element={<SubjectPage />} />

      <Route path={`${basePath}/class-routine`} element={<AcademicSectionPage group="class-routine" />} />
      <Route path={`${basePath}/class-routine/class-routine-create`} element={<AdminClassRoutineCreatePage />} />
      <Route path={`${basePath}/class-routine/class-routine`} element={<AdminClassRoutineListPage />} />
      <Route path={`${basePath}/class-routine/class-routine-quick-edit`} element={<ClassRoutineQuickEditPage />} />
      <Route path={`${basePath}/class-routine/class-routine-at-a-glance`} element={<ClassRoutineAtAGlancePage />} />

      <Route path={`${basePath}/building-list`} element={<BuildingListPage />} />
      <Route path={`${basePath}/floor-list`} element={<FloorListPage />} />
      <Route path={`${basePath}/class-room-list`} element={<ClassRoomListPage />} />
      <Route path={`${basePath}/class-teacher-assign-list`} element={<ClassTeacherAssignListPage />} />
      <Route path={`${basePath}/subject-combine-create`} element={<SubjectCombineCreatePage />} />
      <Route path={`${basePath}/class`} element={<AcademicClassPage />} />
      <Route path={`${basePath}/section`} element={<AcademicSectionListPage />} />
      <Route path={`${basePath}/syllabus`} element={<SyllabusPage />} />
      <Route path={`${basePath}/shift`} element={<ShiftPage />} />
      <Route path={`${basePath}/student-group`} element={<StudentGroupPage />} />
      <Route path={`${basePath}/student-category`} element={<StudentCategoryPage />} />
      <Route path={`${basePath}/academic-setup`} element={<AcademicSetupPage />} />
    </>
  );
}


/* =========================================================
   RESULT ROUTES
========================================================= */

function resultRoutes(basePath) {
  return (
    <>
      <Route path={basePath} element={<ResultDashboard />} />
      <Route path={`${basePath}/result-position-setup`} element={<ResultPositionSetupPage />} />
      <Route path={`${basePath}/result-process`} element={<MainResultProcessPage />} />
      <Route path={`${basePath}/mark-sheet`} element={<MarkSheetPage />} />
      <Route path={`${basePath}/tabulation-sheet`} element={<MainResultTabulationSheetPage />} />
      <Route path={`${basePath}/grade-sheet-report`} element={<GradeSheetReportPage />} />
      <Route path={`${basePath}/merit-list`} element={<MeritListPage />} />
      <Route path={`${basePath}/fail-report`} element={<FailReportPage />} />
      <Route path={`${basePath}/subject-wise-result`} element={<MainResultSubjectWiseResultPage />} />
      <Route path={`${basePath}/subject-wise-fail-report`} element={<SubjectWiseFailReportPage />} />
      <Route path={`${basePath}/exam-wise-roll-update`} element={<ExamWiseRollUpdatePage />} />
      <Route path={`${basePath}/promotion`} element={<PromotionPage />} />
      <Route path={`${basePath}/result-publish`} element={<ResultPublishPage />} />
      <Route path={`${basePath}/exam-result-summary`} element={<ExamResultSummaryPage />} />
      <Route path={`${basePath}/student-result-summary`} element={<StudentResultSummaryPage />} />
    </>
  );
}

/* =========================================================
   GR