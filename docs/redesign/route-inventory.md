# Route and component inventory

## Routes and guards (source declarations)

```text
639:      <Route
640:        path={basePath}
641:        element={<UserManagementDashboard />}
649:      <Route
650:        path={`${basePath}/student`}
651:        element={<StudentDashboard />}
654:      <Route
655:        path={`${basePath}/student/student-create`}
656:        element={<StudentCreate />}
659:      <Route
660:        path={`${basePath}/student/waiver-student`}
661:        element={<WaiverStudent />}
664:      <Route
665:        path={`${basePath}/student/student-list`}
666:        element={<StudentList />}
669:      <Route
670:        path={`${basePath}/student/student-quick-entry`}
671:        element={<StudentQuickEntry />}
674:      <Route
675:        path={`${basePath}/student/student-quick-excell-entry`}
676:        element={<StudentQuickExcelEntry />}
679:      <Route
680:        path={`${basePath}/student/student-quick-update`}
681:        element={<StudentQuickUpdate />}
684:      <Route
685:        path={`${basePath}/student/student-admission-update`}
686:        element={<StudentAdmissionUpdate />}
689:      <Route
690:        path={`${basePath}/student/student-subject-assign`}
691:        element={<StudentSubjectAssign />}
694:      <Route
695:        path={`${basePath}/student/student-transfer`}
696:        element={<StudentTransfer />}
699:      <Route
700:        path={`${basePath}/student/student-rfid`}
701:        element={<StudentRFID />}
704:      <Route
705:        path={`${basePath}/student/student-info-excel-update`}
706:        element={<StudentInfoExcelUpdate />}
709:      <Route
710:        path={`${basePath}/student/student-details-excel-entry`}
711:        element={<StudentDetailsExcelEntry />}
728:      <Route
729:        path={`${basePath}/teacher`}
730:        element={<TeacherList />}
741:      <Route
742:        path={`${basePath}/teacher/teacher`}
743:        element={<TeacherList />}
749:      <Route
750:        path={`${basePath}/teacher/teacher-quick-entry`}
751:        element={<TeacherQuickEntry />}
757:      <Route
758:        path={`${basePath}/teacher/teacher-quick-update`}
759:        element={<TeacherQuickUpdate />}
765:      <Route
766:        path={`${basePath}/teacher/teacher-disable`}
767:        element={<TeacherDisable />}
773:      <Route
774:        path={`${basePath}/teacher/teacher-restore`}
775:        element={<TeacherRestore />}
781:      <Route
782:        path={`${basePath}/teacher/teacher-id-card`}
783:        element={<TeacherIdCard />}
789:      <Route
790:        path={`${basePath}/teacher/teacher-settings`}
791:        element={<TeacherSettings />}
803:      <Route
804:        path={`${basePath}/employee`}
805:        element={<EmployeeList />}
808:      <Route
809:        path={`${basePath}/employee/employee`}
810:        element={<EmployeeList />}
813:      <Route
814:        path={`${basePath}/employee/employee-quick-entry`}
815:        element={<EmployeeQuickEntry />}
818:      <Route
819:        path={`${basePath}/employee/employee-disable`}
820:        element={<EmployeeDisable />}
823:      <Route
824:        path={`${basePath}/employee/employee-quick-update`}
825:        element={<EmployeeQuickUpdate />}
828:      <Route
829:        path={`${basePath}/employee/employee-restore`}
830:        element={<EmployeeRestore />}
833:      <Route
834:        path={`${basePath}/employee/employee-id-card`}
835:        element={<EmployeeIdCard />}
838:      <Route
839:        path={`${basePath}/employee/employee-settings`}
840:        element={<EmployeeSettings />}
848:      <Route
849:        path={`${basePath}/users`}
850:        element={
862:      <Route
863:        path={`${basePath}/management`}
864:        element={<ManagementPage />}
872:      <Route
873:        path={`${basePath}/student-id-card`}
874:        element={<StudentIdCardPage />}
882:      <Route
883:        path={`${basePath}/teacher-employee-rfid`}
884:        element={<TeacherEmployeeRFIDPage />}
892:      <Route
893:        path={`${basePath}/other-users-rfid`}
894:        element={<OtherUsersRFIDPage />}
902:      <Route
903:        path={`${basePath}/management-disable`}
904:        element={<ManagementDisablePage />}
912:      <Route
913:        path={`${basePath}/management-restore`}
914:        element={<ManagementRestorePage />}
927:      <Route
928:        path={basePath}
929:        element={<OnlineApplicationDashboard />}
937:      <Route
938:        path={`${basePath}/application`}
939:        element={<ApplicationListPage />}
943:      <Route
944:        path={`${basePath}/application/application-list`}
945:        element={<ApplicationListPage />}
949:      <Route
950:        path={`${basePath}/application/pending-list`}
951:        element={<PendingApplicationPage />}
955:      <Route
956:        path={`${basePath}/application/form-setting`}
957:        element={<ApplicationFormSettingPage />}
960:      <Route
961:        path={`${basePath}/admission-exam`}
962:        element={<AdmissionExamDashboard />}
965:      <Route
966:        path={`${basePath}/admission-exam/mark-configure`}
967:        element={<MarkConfigurePage />}
970:      <Route
971:        path={`${basePath}/admission-exam/add-mark`}
972:        element={<AddMarkPage />}
975:      <Route
976:        path={`${basePath}/admission-exam/delete-marks`}
977:        element={<DeleteMarksPage />}
980:      <Route
981:        path={`${basePath}/admission-exam/update-mark`}
982:        element={<UpdateMarkPage />}
985:      <Route
986:        path={`${basePath}/admission-exam/seat-plan`}
987:        element={<SeatPlanPage />}
990:      <Route
991:        path={`${basePath}/admission-result`}
992:        element={<AdmissionResultDashboard />}
995:      <Route
996:        path={`${basePath}/admission-result/result-process`}
997:        element={<ResultProcessPage />}
1000:      <Route
1001:        path={`${basePath}/admission-result/tabulation-sheet`}
1002:        element={<TabulationSheetPage />}
1005:      <Route
1006:        path={`${basePath}/admission-result/promoted-list`}
1007:        element={<PromotedListPage />}
1010:      <Route
1011:        path={`${basePath}/admission-result/subject-wise-result`}
1012:        element={<SubjectWiseResultPage />}
1015:      <Route
1016:        path={`${basePath}/application-report`}
1017:        element={<ApplicationReportDashboard />}
1020:      <Route
1021:        path={`${basePath}/application-report/fees-report`}
1022:        element={<FeesReportPage />}
1025:      <Route
1026:        path={`${basePath}/application-report/application-report`}
1027:        element={<ApplicationReportPage />}
1030:      <Route
1031:        path={`${basePath}/application-report/amount-collected`}
1032:        element={<AmountCollectedPage />}
1045:      <Route path={basePath} element={<AttendanceDashboard />} />
1047:      <Route
1048:        path={`${basePath}/time-attendance`}
1049:        element={<TimeAttendance />}
1052:      <Route
1053:        path={`${basePath}/student-attendance`}
1054:        element={<StudentAttendance />}
1057:      <Route
1058:        path={`${basePath}/student-attendance-report`}
1059:        element={<StudentAttendanceReport />}
1062:      <Route
1063:        path={`${basePath}/student-attendance-overview-report`}
1064:        element={<StudentAttendanceOverviewReport />}
1067:      <Route
1068:        path={`${basePath}/student-details-attendance`}
1069:        element={<StudentDetailsAttendance />}
1072:      <Route
1073:        path={`${basePath}/student-attendance-summary`}
1074:        element={<StudentAttendanceSummary />}
1077:      <Route
1078:        path={`${basePath}/student-absent`}
1079:        element={<StudentAbsent />}
1082:      <Route
1083:        path={`${basePath}/teacher-employee-attendance`}
1084:        element={<TeacherEmployeeAttendance />}
1087:      <Route
1088:        path={`${basePath}/teacher-and-employee-attendance`}
1089:        element={<TeacherEmployeeAttendance />}
1092:      <Route
1093:        path={`${basePath}/teacher-employee-attendance-report`}
1094:        element={<TeacherEmployeeAttendanceReport />}
1097:      <Route
1098:        path={`${basePath}/teacher-and-employee-attendance-report`}
1099:        element={<TeacherEmployeeAttendanceReport />}
1102:      <Route
1103:        path={`${basePath}/teacher-employee-details-attendance`}
1104:        element={<TeacherEmployeeDetailsAttendance />}
1107:      <Route
1108:        path={`${basePath}/teacher-and-employee-details-attendance`}
1109:        element={<TeacherEmployeeDetailsAttendance />}
1112:      <Route
1113:        path={`${basePath}/teacher-employee-attendance-summary`}
1114:        element={<TeacherEmployeeAttendanceSummary />}
1117:      <Route
1118:        path={`${basePath}/teacher-and-employee-attendance-summary`}
1119:        element={<TeacherEmployeeAttendanceSummary />}
1122:      <Route
1123:        path={`${basePath}/teacher-employee-absent`}
1124:        element={<TeacherEmployeeAbsent />}
1127:      <Route
1128:        path={`${basePath}/teacher-and-employee-absent`}
1129:        element={<TeacherEmployeeAbsent />}
1132:      <Route
1133:        path={`${basePath}/teacher-class-attendance`}
1134:        element={<TeacherClassAttendance />}
1147:      <Route path={basePath} element={<ExaminationDashboard />} />
1149:      <Route
1150:        path={`${basePath}/marks-configure`}
1151:        element={<ExaminationPageShell title="Marks Configure" />}
1154:      <Route
1155:        path={`${basePath}/marks-configure/marks-distribution-excel-entry`}
1156:        element={<MarksDistributionExcelEntry />}
1159:      <Route
1160:        path={`${basePath}/marks-configure/manage-marks-distribution`}
1161:        element={<ManageMarksDistribution />}
1164:      <Route
1165:        path={`${basePath}/marks-configure/marks-distribution`}
1166:        element={<MarksDistribution />}
1169:      <Route path={`${basePath}/grade/grade`} element={<GradePage />} />
1171:      <Route
1172:        path={`${basePath}/grade`}
1173:        element={<ExaminationPageShell title="Grade" />}
1176:      <Route
1177:        path={`${basePath}/grade/grade-transfer`}
1178:        element={<GradeTransferPage />}
1181:      <Route
1182:        path={`${basePath}/signature-sheet`}
1183:        element={<SignatureSheetPage />}
1186:      <Route path={`${basePath}/exam-list`} element={<ExamListPage />} />
1188:      <Route
1189:        path={`${basePath}/exam-routine`}
1190:        element={<AdminExamRoutinePage />}
1193:      <Route
1194:        path={`${basePath}/exam-routine-edit`}
1195:        element={<ExamRoutineEditPage />}
1198:      <Route
1199:        path={`${basePath}/admit-card-report`}
1200:        element={<AdmitCardReportPage />}
1203:      <Route path={`${basePath}/seat-plan`} element={<AdminSeatPlanPage />} />
1205:      <Route
1206:        path={`${basePath}/seat-plan-report`}
1207:        element={<SeatPlanReportPage />}
1210:      <Route
1211:        path={`${basePath}/teacher-exam-subject-assign`}
1212:        element={<TeacherExamSubjectAssignPage />}
1225:      <Route path={basePath} element={<ManageAccountsDashboard />} />
1227:      <Route path={`${basePath}/fees-collection`} element={<ManageAccountsPageShell title="Fees Collection" />} />
1228:      <Route path={`${basePath}/fees-collection/fees-collection-create`} element={<FeesCollectionCreatePage />} />
1229:      <Route path={`${basePath}/fees-collection/fees-collection-list`} element={<FeesCollectionListPage />} />
1230:      <Route path={`${basePath}/fees-collection/fees-collection-due-details`} element={<FeesCollectionDueDetailsPage />} />
1231:      <Route path={`${basePath}/fees-collection/student-due-details`} element={<StudentDueDetailsPage />} />
1232:      <Route path={`${basePath}/fees-collection/fee-settings`} element={<FeeSettingsPage />} />
1233:      <Route path={`${basePath}/fees-collection/sms-setup`} element={<SmsSetupPage />} />
1234:      <Route path={`${basePath}/fees-collection/fees-collection-approve`} element={<FeesCollectionApprovePage />} />
1235:      <Route path={`${basePath}/fees-collection/student-fee-method-setup`} element={<StudentFeeMethodSetupPage />} />
1237:      <Route path={`${basePath}/fees-category`} element={<ManageAccountsPageShell title="Fees Category" />} />
1238:      <Route path={`${basePath}/fees-category/fees-category-create`} element={<FeesCategoryCreatePage />} />
1239:      <Route path={`${basePath}/fees-category/fees-category-list`} element={<FeesCategoryListPage />} />
1240:      <Route path={`${basePath}/fees-category/student-waiver`} element={<StudentWaiverPage />} />
1241:      <Route path={`${basePath}/fees-category/mid-year-fees-reduction`} element={<MidYearFeesReductionPage />} />
1243:      <Route path={`${basePath}/custom-fee`} element={<ManageAccountsPageShell title="Custom Fee" />} />
1244:      <Route path={`${basePath}/custom-fee/custom-fee-create`} element={<CustomFeeCreatePage />} />
1245:      <Route path={`${basePath}/custom-fee/custom-fee-list`} element={<CustomFeeListPage />} />
1247:      <Route path={`${basePath}/expense-category`} element={<ManageAccountsPageShell title="Expense Category" />} />
1248:      <Route path={`${basePath}/expense-category/expense-category-create`} element={<ExpenseCategoryCreatePage />} />
1249:      <Route path={`${basePath}/expense-category/expense-category-list`} element={<ExpenseCategoryListPage />} />
1251:      <Route path={`${basePath}/expense`} element={<ManageAccountsPageShell title="Expense" />} />
1252:      <Route path={`${basePath}/expense/expense-create`} element={<ExpenseCreatePage />} />
1253:      <Route path={`${basePath}/expense/expense-list`} element={<ExpenseListPage />} />
1255:      <Route path={`${basePath}/income-category`} element={<ManageAccountsPageShell title="Income Category" />} />
1256:      <Route path={`${basePath}/income-category/income-category-create`} element={<IncomeCategoryCreatePage />} />
1257:      <Route path={`${basePath}/income-category/income-category-list`} element={<IncomeCategoryListPage />} />
1259:      <Route path={`${basePath}/income`} element={<ManageAccountsPageShell title="Income" />} />
1260:      <Route path={`${basePath}/income/income-create`} element={<IncomeCreatePage />} />
1261:      <Route path={`${basePath}/income/income-list`} element={<IncomeListPage />} />
1263:      <Route path={`${basePath}/general-ledger`} element={<GeneralLedgerPage />} />
1265:      <Route path={`${basePath}/fund-transfer`} element={<ManageAccountsPageShell title="Fund Transfer" />} />
1266:      <Route path={`${basePath}/fund-transfer/fund-transfer-create`} element={<FundTransferCreatePage />} />
1267:      <Route path={`${basePath}/fund-transfer/fund-transfer-list`} element={<FundTransferListPage />} />
1269:      <Route path={`${basePath}/payment-gateway`} element={<ManageAccountsPageShell title="Payment Gateway" />} />
1270:      <Route path={`${basePath}/payment-gateway/payment-gateway-create`} element={<PaymentGatewayCreatePage />} />
1271:      <Route path={`${basePath}/payment-gateway/payment-gateway-list`} element={<PaymentGatewayListPage />} />
1273:      <Route path={`${basePath}/payment-history`} element={<PaymentHistoryPage />} />
1274:      <Route path={`${basePath}/balance-sheet-data`} element={<BalanceSheetDataPage />} />
1275:      <Route path={`${basePath}/all-account-reports`} element={<AllAccountReportsPage />} />
1276:      <Route path={`${basePath}/account-settings`} element={<AccountSettingsPage />} />
1288:      <Route path={basePath} element={<HrAndPayrollDashboard />} />
1290:      <Route
1291:        path={`${basePath}/salary`}
1292:        element={<HrPayrollPageShell title="Salary" />}
1295:      <Route
1296:        path={`${basePath}/salary/salary-create`}
1297:        element={<SalaryCreatePage />}
1300:      <Route
1301:        path={`${basePath}/salary/salary-list`}
1302:        element={<SalaryListPage />}
1305:      <Route
1306:        path={`${basePath}/leave-application`}
1307:        element={<HrPayrollPageShell title="Leave Application" />}
1310:      <Route
1311:        path={`${basePath}/leave-application/leave-application-create`}
1312:        element={<LeaveApplicationCreatePage />}
1315:      <Route
1316:        path={`${basePath}/leave-application/leave-application-list`}
1317:        element={<LeaveApplicationListPage />}
1320:      <Route
1321:        path={`${basePath}/payroll`}
1322:        element={<HrPayrollPageShell title="Payroll" />}
1325:      <Route
1326:        path={`${basePath}/payroll/payroll-create`}
1327:        element={<PayrollCreatePage />}
1330:      <Route
1331:        path={`${basePath}/payroll/payroll-list`}
1332:        element={<PayrollListPage />}
1351:      <Route path={basePath} element={<MailSmsServiceDashboard />} />
1353:      <Route path={`${basePath}/manage-hr-sms`} element={<MailSmsSectionPage group="manage-hr-sms" />} />
1354:      <Route path={`${basePath}/manage-hr-sms/teacher-employee-sms-list`} element={mailSmsPage("Teacher/Employee SMS List", TeacherEmployeeSmsListPage)} />
1355:      <Route path={`${basePath}/manage-hr-sms/teacher-employee-joining-sms-create`} element={mailSmsPage("Teacher/Employee Joining SMS Create", TeacherEmployeeJoiningSmsCreatePage)} />
1356:      <Route path={`${basePath}/manage-hr-sms/teacher-employee-attendance-sms-create`} element={mailSmsPage("Teacher/Employee Attendance SMS Create", TeacherEmployeeAttendanceSmsCreatePage)} />
1357:      <Route path={`${basePath}/manage-hr-sms/teacher-employee-absent-sms-create`} element={mailSmsPage("Teacher/Employee Absent SMS Create", TeacherEmployeeAbsentSmsCreatePage)} />
1358:      <Route path={`${basePath}/manage-hr-sms/teacher-employee-salary-sms-create`} element={mailSmsPage("Teacher/Employee Salary SMS Create", TeacherEmployeeSalarySmsCreatePage)} />
1360:      <Route path={`${basePath}/contact-category`} element={<MailSmsSectionPage group="contact-category" />} />
1361:      <Route path={`${basePath}/contact-category/contact-category-create`} element={mailSmsPage("Contact Category Create", ContactCategoryCreatePage)} />
1362:      <Route path={`${basePath}/contact-category/contact-category-list`} element={mailSmsPage("Contact Category List", ContactCategoryListPage)} />
1364:      <Route path={`${basePath}/contacts`} element={<MailSmsSectionPage group="contacts" />} />
1365:      <Route path={`${basePath}/contacts/contacts-create`} element={mailSmsPage("Contacts Create", ContactsCreatePage)} />
1366:      <Route path={`${basePath}/contacts/contacts-list`} element={mailSmsPage("Contacts List", ContactsListPage)} />
1368:      <Route path={`${basePath}/sms-api`} element={<MailSmsSectionPage group="sms-api" />} />
1369:      <Route path={`${basePath}/sms-api/sms-api-create`} element={mailSmsPage("SMS API Create", SmsApiCreatePage)} />
1370:      <Route path={`${basePath}/sms-api/sms-api-list`} element={mailSmsPage("SMS API List", SmsApiListPage)} />
1372:      <Route path={`${basePath}/sms-campaign`} element={<MailSmsSectionPage group="sms-campaign" />} />
1373:      <Route path={`${basePath}/sms-campaign/sms-campaign-create`} element={mailSmsPage("SMS Campaign Create", SmsCampaignCreatePage)} />
1374:      <Route path={`${basePath}/sms-campaign/sms-report-list`} element={mailSmsPage("SMS Report List", SmsReportListPage)} />
1375:      <Route path={`${basePath}/sms-campaign/sms-report-search`} element={mailSmsPage("SMS Report Search", SmsReportSearchPage)} />
1376:      <Route path={`${basePath}/sms-campaign/sms-campaign-organization`} element={mailSmsPage("SMS Campaign Organization", SmsCampaignOrganizationPage)} />
1378:      <Route path={`${basePath}/manage-student-sms`} element={<MailSmsSectionPage group="manage-student-sms" />} />
1379:      <Route path={`${basePath}/manage-student-sms/student-sms-list`} element={mailSmsPage("Student SMS List", StudentSmsListPage)} />
1380:      <Route path={`${basePath}/manage-student-sms/student-admission-online`} element={mailSmsPage("Student Admission Online", StudentAdmissionOnlinePage)} />
1381:      <Route path={`${basePath}/manage-student-sms/student-admission-software`} element={mailSmsPage("Student Admission Software", StudentAdmissionSoftwarePage)} />
1382:      <Route path={`${basePath}/manage-student-sms/student-attendance-sms-create`} element={mailSmsPage("Student Attendance SMS Create", StudentAttendanceSmsCreatePage)} />
1383:      <Route path={`${basePath}/manage-student-sms/student-absent-sms-create`} element={mailSmsPage("Student Absent SMS Create", StudentAbsentSmsCreatePage)} />
1384:      <Route path={`${basePath}/manage-student-sms/student-fees-collection-sms-create`} element={mailSmsPage("Student Fees Collection SMS Create", StudentFeesCollectionSmsCreatePage)} />
1385:      <Route path={`${basePath}/manage-student-sms/student-due-fees-sms-create`} element={mailSmsPage("Student Due Fees SMS Create", StudentDueFeesSmsCreatePage)} />
1386:      <Route path={`${basePath}/manage-student-sms/subject-wise-result-sms`} element={mailSmsPage("Subject Wise Result SMS", SubjectWiseResultSmsPage)} />
1387:      <Route path={`${basePath}/manage-student-sms/result-sms`} element={mailSmsPage("Result SMS", ResultSmsPage)} />
1389:      <Route path={`${basePath}/sms-mail-setup`} element={mailSmsPage("SMS/Mail Setup", SmsMailSetupPage)} />
1390:      <Route path={`${basePath}/sms-mail-template`} element={mailSmsPage("SMS/Mail Template", SmsMailTemplatePage)} />
1402:      <Route path={basePath} element={<CertificateReportDashboard />} />
1403:      <Route path={`${basePath}/give-certificate`} element={<GiveCertificatePage />} />
1404:      <Route path={`${basePath}/certificate-report`} element={<CertificateReportPage />} />
1405:      <Route path={`${basePath}/certificate-settings`} element={<CertificateSettingsPage />} />
1417:      <Route path={basePath} element={<CoachingManagementDashboard />} />
1419:      <Route path={`${basePath}/coaching-student`} element={<CoachingSectionPage groupSlug="coaching-student" />} />
1420:      <Route path={`${basePath}/coaching-student/coaching-student-auto-enroll`} element={<CoachingStudentAutoEnrollPage />} />
1421:      <Route path={`${basePath}/coaching-student/auto-enroll`} element={<CoachingStudentAutoEnrollPage />} />
1422:      <Route path={`${basePath}/coaching-student/coaching-student-create`} element={<CoachingStudentCreatePage />} />
1423:      <Route path={`${basePath}/coaching-student/create`} element={<CoachingStudentCreatePage />} />
1424:      <Route path={`${basePath}/coaching-student/coaching-student-list`} element={<CoachingStudentListPage />} />
1425:      <Route path={`${basePath}/coaching-student/list`} element={<CoachingStudentListPage />} />
1427:      <Route path={`${basePath}/coaching-fee`} element={<CoachingSectionPage groupSlug="coaching-fee" />} />
1428:      <Route path={`${basePath}/coaching-fee/coaching-fee-create`} element={<CoachingFeeCreatePage />} />
1429:      <Route path={`${basePath}/coaching-fee/create`} element={<CoachingFeeCreatePage />} />
1430:      <Route path={`${basePath}/coaching-fee/coaching-fee-list`} element={<CoachingFeeListPage />} />
1431:      <Route path={`${basePath}/coaching-fee/list`} element={<CoachingFeeListPage />} />
1432:      <Route path={`${basePath}/coaching-fee/coaching-fee-dues`} element={<CoachingFeeDuesPage />} />
1433:      <Route path={`${basePath}/coaching-fee/dues`} element={<CoachingFeeDuesPage />} />
1434:      <Route path={`${basePath}/coaching-fee/fees-collection-summary`} element={<FeesCollectionSummaryPage />} />
1435:      <Route path={`${basePath}/coaching-fee/income-statement`} element={<CoachingIncomeStatementPage />} />
1436:      <Route path={`${basePath}/coaching-fee/payment-history`} element={<CoachingPaymentHistoryPage />} />
1437:      <Route path={`${basePath}/coaching-fee/fee-setup`} element={<CoachingFeeSetupPage />} />
1439:      <Route path={`${basePath}/cms-expense`} element={<CoachingSectionPage groupSlug="cms-expense" />} />
1440:      <Route path={`${basePath}/cms-expense/cms-expense-create`} element={<CmsExpenseCreatePage />} />
1441:      <Route path={`${basePath}/cms-expense/create`} element={<CmsExpenseCreatePage />} />
1442:      <Route path={`${basePath}/cms-expense/cms-expense-list`} element={<CmsExpenseListPage />} />
1443:      <Route path={`${basePath}/cms-expense/list`} element={<CmsExpenseListPage />} />
1444:      <Route path={`${basePath}/cms-expense/cms-expense-report`} element={<CmsExpenseReportPage />} />
1445:      <Route path={`${basePath}/cms-expense/report`} element={<CmsExpenseReportPage />} />
1447:      <Route path={`${basePath}/cms-expense-category`} element={<CoachingSectionPage groupSlug="cms-expense-category" />} />
1448:      <Route path={`${basePath}/cms-expense-category/cms-expense-category-create`} element={<CmsExpenseCategoryCreatePage />} />
1449:      <Route path={`${basePath}/cms-expense-category/create`} element={<CmsExpenseCategoryCreatePage />} />
1450:      <Route path={`${basePath}/cms-expense-category/cms-expense-category-list`} element={<CmsExpenseCategoryListPage />} />
1451:      <Route path={`${basePath}/cms-expense-category/list`} element={<CmsExpenseCategoryListPage />} />
1453:      <Route path={`${basePath}/cms-income-category`} element={<CoachingSectionPage groupSlug="cms-income-category" />} />
1454:      <Route path={`${basePath}/cms-income-category/cms-income-category-create`} element={<CmsIncomeCategoryCreatePage />} />
1455:      <Route path={`${basePath}/cms-income-category/create`} element={<CmsIncomeCategoryCreatePage />} />
1456:      <Route path={`${basePath}/cms-income-category/cms-income-category-list`} element={<CmsIncomeCategoryListPage />} />
1457:      <Route path={`${basePath}/cms-income-category/list`} element={<CmsIncomeCategoryListPage />} />
1459:      <Route path={`${basePath}/cms-income`} element={<CoachingSectionPage groupSlug="cms-income" />} />
1460:      <Route path={`${basePath}/cms-income/cms-income-create`} element={<CmsIncomeCreatePage />} />
1461:      <Route path={`${basePath}/cms-income/create`} element={<CmsIncomeCreatePage />} />
1462:      <Route path={`${basePath}/cms-income/cms-income-list`} element={<CmsIncomeListPage />} />
1463:      <Route path={`${basePath}/cms-income/list`} element={<CmsIncomeListPage />} />
1475:      <Route path={basePath} element={<AcademicDashboard />} />
1477:      <Route path={`${basePath}/subject`} element={<AcademicSectionPage group="subject" />} />
1478:      <Route path={`${basePath}/subject/subject-transfer`} element={<SubjectTransferPage />} />
1479:      <Route path={`${basePath}/subject/subject-excel-entry`} element={<SubjectExcelEntryPage />} />
1480:      <Route path={`${basePath}/subject/subject`} element={<SubjectPage />} />
1482:      <Route path={`${basePath}/class-routine`} element={<AcademicSectionPage group="class-routine" />} />
1483:      <Route path={`${basePath}/class-routine/class-routine-create`} element={<AdminClassRoutineCreatePage />} />
1484:      <Route path={`${basePath}/class-routine/class-routine`} element={<AdminClassRoutineListPage />} />
1485:      <Route path={`${basePath}/class-routine/class-routine-quick-edit`} element={<ClassRoutineQuickEditPage />} />
1486:      <Route path={`${basePath}/class-routine/class-routine-at-a-glance`} element={<ClassRoutineAtAGlancePage />} />
1488:      <Route path={`${basePath}/building-list`} element={<BuildingListPage />} />
1489:      <Route path={`${basePath}/floor-list`} element={<FloorListPage />} />
1490:      <Route path={`${basePath}/class-room-list`} element={<ClassRoomListPage />} />
1491:      <Route path={`${basePath}/class-teacher-assign-list`} element={<ClassTeacherAssignListPage />} />
1492:      <Route path={`${basePath}/subject-combine-create`} element={<SubjectCombineCreatePage />} />
1493:      <Route path={`${basePath}/class`} element={<AcademicClassPage />} />
1494:      <Route path={`${basePath}/section`} element={<AcademicSectionListPage />} />
1495:      <Route path={`${basePath}/syllabus`} element={<SyllabusPage />} />
1496:      <Route path={`${basePath}/shift`} element={<ShiftPage />} />
1497:      <Route path={`${basePath}/student-group`} element={<StudentGroupPage />} />
1498:      <Route path={`${basePath}/student-category`} element={<StudentCategoryPage />} />
1499:      <Route path={`${basePath}/academic-setup`} element={<AcademicSetupPage />} />
1512:      <Route path={basePath} element={<ResultDashboard />} />
1513:      <Route path={`${basePath}/result-position-setup`} element={<ResultPositionSetupPage />} />
1514:      <Route path={`${basePath}/result-process`} element={<MainResultProcessPage />} />
1515:      <Route path={`${basePath}/mark-sheet`} element={<MarkSheetPage />} />
1516:      <Route path={`${basePath}/tabulation-sheet`} element={<MainResultTabulationSheetPage />} />
1517:      <Route path={`${basePath}/grade-sheet-report`} element={<GradeSheetReportPage />} />
1518:      <Route path={`${basePath}/merit-list`} element={<MeritListPage />} />
1519:      <Route path={`${basePath}/fail-report`} element={<FailReportPage />} />
1520:      <Route path={`${basePath}/subject-wise-result`} element={<MainResultSubjectWiseResultPage />} />
1521:      <Route path={`${basePath}/subject-wise-fail-report`} element={<SubjectWiseFailReportPage />} />
1522:      <Route path={`${basePath}/exam-wise-roll-update`} element={<ExamWiseRollUpdatePage />} />
1523:      <Route path={`${basePath}/promotion`} element={<PromotionPage />} />
1524:      <Route path={`${basePath}/result-publish`} element={<ResultPublishPage />} />
1525:      <Route path={`${basePath}/exam-result-summary`} element={<ExamResultSummaryPage />} />
1526:      <Route path={`${basePath}/student-result-summary`} element={<StudentResultSummaryPage />} />
1538:      <Route path={basePath} element={<GrandFinalResultDashboard />} />
1539:      <Route path={`${basePath}/grand-exam-configure-manage`} element={<GrandExamConfigureManagePage />} />
1540:      <Route path={`${basePath}/grand-result-process`} element={<GrandResultProcessPage />} />
1541:      <Route path={`${basePath}/mark-sheet`} element={<GrandMarkSheetPage />} />
1542:      <Route path={`${basePath}/tabulation-sheet`} element={<GrandTabulationSheetPage />} />
1543:      <Route path={`${basePath}/merit-list`} element={<GrandMeritListPage />} />
1544:      <Route path={`${basePath}/grade-sheet-report`} element={<GrandGradeSheetReportPage />} />
1545:      <Route path={`${basePath}/fail-report`} element={<GrandFailReportPage />} />
1546:      <Route path={`${basePath}/subject-wise-fail`} element={<GrandSubjectWiseFailPage />} />
1547:      <Route path={`${basePath}/subject-wise-result`} element={<GrandSubjectWiseResultPage />} />
1548:      <Route path={`${basePath}/teacher-wise-result`} element={<GrandTeacherWiseResultPage />} />
1549:      <Route path={`${basePath}/student-promotion`} element={<GrandStudentPromotionPage />} />
1561:      <Route path={basePath} element={<ManageLibraryDashboard />} />
1562:      <Route path={`${basePath}/publisher`} element={<AdminModulePage />} />
1563:      <Route path={`${basePath}/publisher/publisher-create`} element={<PublisherCreatePage />} />
1564:      <Route path={`${basePath}/publisher/publisher-list`} element={<PublisherListPage />} />
1565:      <Route path={`${basePath}/author`} element={<AdminModulePage />} />
1566:      <Route path={`${basePath}/author/author-create`} element={<AuthorCreatePage />} />
1567:      <Route path={`${basePath}/author/author-list`} element={<AuthorListPage />} />
1568:      <Route path={`${basePath}/book-category`} element={<AdminModulePage />} />
1569:      <Route path={`${basePath}/book-category/book-category-create`} element={<BookCategoryCreatePage />} />
1570:      <Route path={`${basePath}/book-category/book-category-list`} element={<BookCategoryListPage />} />
1571:      <Route path={`${basePath}/book`} element={<AdminModulePage />} />
1572:      <Route path={`${basePath}/book/book-create`} element={<BookCreatePage />} />
1573:      <Route path={`${basePath}/book/book-list`} element={<BookListPage />} />
1574:      <Route path={`${basePath}/book-issue`} element={<AdminModulePage />} />
1575:      <Route path={`${basePath}/book-issue/book-issue-create`} element={<BookIssueCreatePage />} />
1576:      <Route path={`${basePath}/book-issue/book-issue-list`} element={<BookIssueListPage />} />
1577:      <Route path={`${basePath}/book-return`} element={<BookReturnPage />} />
1578:      <Route path={`${basePath}/book-returned-list`} element={<BookReturnedListPage />} />
1590:      <Route path={basePath} element={<AllReportsDashboard />} />
1591:      <Route path={`${basePath}/student-report`} element={<StudentReportPage />} />
1592:      <Route path={`${basePath}/create-inactive-student`} element={<CreateInactiveStudentPage />} />
1593:      <Route path={`${basePath}/inactive-student-list`} element={<InactiveStudentListPage />} />
1594:      <Route path={`${basePath}/class-summary-report`} element={<ClassSummaryReportPage />} />
1606:      <Route path={basePath} element={<AdminPanelDashboard />} />
1607:      <Route path={`${basePath}/pay-bill`} element={<PayBillPage />} />
1608:      <Route path={`${basePath}/academic-year`} element={<AcademicYearPage />} />
1609:      <Route path={`${basePath}/admin-list`} element={<AdminListPage />} />
1610:      <Route path={`${basePath}/reset-password`} element={<ResetPasswordPage />} />
1611:      <Route path={`${basePath}/role`} element={<RolePage />} />
1612:      <Route path={`${basePath}/user-login-history`} element={<UserLoginHistoryPage />} />
1613:      <Route path={`${basePath}/admin-disable`} element={<AdminDisablePage />} />
1614:      <Route path={`${basePath}/admin-restore`} element={<AdminRestorePage />} />
1638:      <Route path={`${basePath}/${group}`} element={<SystemSetupPageShell title={titleize(group)} />} />
1639:      <Route path={`${basePath}/${group}/${createSlug}`} element={<CreatePage />} />
1640:      <Route path={`${basePath}/${group}/create`} element={<CreatePage />} />
1641:      <Route path={`${basePath}/${group}/${listSlug}`} element={<ListPage />} />
1642:      <Route path={`${basePath}/${group}/list`} element={<ListPage />} />
1648:      <Route path={basePath} element={<SystemSetupDashboard />} />
1672:      <Route path={basePath} element={<StudentWorkDashboard />} />
1674:      <Route path={`${basePath}/class-work`} element={<StudentWorkPageShell title="Class Work" />} />
1675:      <Route path={`${basePath}/class-work/class-work-create`} element={<ClassWorkCreatePage />} />
1676:      <Route path={`${basePath}/class-work/create`} element={<ClassWorkCreatePage />} />
1677:      <Route path={`${basePath}/class-work/class-work-list`} element={<ClassWorkListPage />} />
1678:      <Route path={`${basePath}/class-work/list`} element={<ClassWorkListPage />} />
1680:      <Route path={`${basePath}/assignment`} element={<StudentWorkPageShell title="Assignment" />} />
1681:      <Route path={`${basePath}/assignment/assignment-create`} element={<AssignmentCreatePage />} />
1682:      <Route path={`${basePath}/assignment/create`} element={<AssignmentCreatePage />} />
1683:      <Route path={`${basePath}/assignment/assignment-list`} element={<AssignmentListPage />} />
1684:      <Route path={`${basePath}/assignment/list`} element={<AssignmentListPage />} />
1686:      <Route path={`${basePath}/home-work`} element={<StudentWorkPageShell title="Home Work" />} />
1687:      <Route path={`${basePath}/home-work/home-work-create`} element={<HomeWorkCreatePage />} />
1688:      <Route path={`${basePath}/home-work/create`} element={<HomeWorkCreatePage />} />
1689:      <Route path={`${basePath}/home-work/home-work-list`} element={<HomeWorkListPage />} />
1690:      <Route path={`${basePath}/home-work/list`} element={<HomeWorkListPage />} />
1691:      <Route path={`${basePath}/home-work/home-work-at-a-glance`} element={<HomeWorkAtAGlancePage />} />
1692:      <Route path={`${basePath}/home-work/at-a-glance`} element={<HomeWorkAtAGlancePage />} />
1704:      <Route path={basePath} element={<HostelManagementDashboard />} />
1705:      <Route path={`${basePath}/*`} element={<AdminModulePage />} />
1713:      <Route path={basePath} element={<DynamicWebsiteDashboard />} />
1714:      <Route path={`${basePath}/*`} element={<AdminModulePage />} />
1722:      <Route path="courses" element={<CoursesPage />} />
1723:      <Route path="courses/sections" element={<CourseSectionsPage />} />
1724:      <Route path="courses/subjects" element={<CourseSubjectsPage />} />
1725:      <Route path="courses/academic-stages" element={<AcademicStagesPage />} />
1726:      <Route path="courses/assessment-components" element={<AssessmentComponentsPage />} />
1727:      <Route path="courses/grade-scales" element={<CourseGradeScalesPage />} />
1728:      <Route path="courses/grade-scale-items" element={<CourseGradeScaleItemsPage />} />
1729:      <Route path="teacher-assignments" element={<TeacherAssignmentsPage />} />
1730:      <Route path="enrollments" element={<EnrollmentsPage />} />
1731:      <Route path="course-foundation" element={<CoursesPage />} />
1732:      <Route path="course-foundation/courses" element={<CoursesPage />} />
1733:      <Route path="course-foundation/sections" element={<CourseSectionsPage />} />
1734:      <Route path="course-foundation/subjects" element={<CourseSubjectsPage />} />
1735:      <Route path="course-foundation/teacher-assignments" element={<TeacherAssignmentsPage />} />
1736:      <Route path="course-foundation/enrollments" element={<EnrollmentsPage />} />
1744:      <Route index element={<AdminPortalDashboard />} />
1745:      <Route path="teachers" element={<AdminTeachersPage />} />
1746:      <Route path="admissions" element={<AdminAdmissionsPage />} />
1747:      <Route path="admission-form-builder" element={<AdminAdmissionFormBuilderPage />} />
1748:      <Route path="teacher-assignments" element={<AdminTeacherAssignmentsPage />} />
1749:      <Route path="admission-applications" element={<AdminAdmissionApplicationsPage />} />
1750:      <Route path="payments" element={<AdminBkashPaymentPage />} />
1751:      <Route path="notices" element={<AdminNoticeManagementPage />} />
1752:      <Route path="gallery" element={<AdminGalleryManagementPage />} />
1753:      <Route path="website/banners" element={<BannersPage />} />
1754:      <Route path="website/success-stories" element={<SuccessStoriesPage />} />
1755:      <Route path="website/renowned-teachers" element={<RenownedTeachersPage />} />
1756:      <Route path="website/settings" element={<WebsiteSettingsPage />} />
1757:      <Route path="integrations" element={<IntegrationsPage />} />
1758:      <Route path="*" element={<Navigate to="" replace />} />
1766:      <Route path="academic" element={<AdminAcademicPage />} />
1767:      <Route path="users" element={<AdminUsersPage />} />
1768:      <Route path="assessments" element={<AdminAssessmentsPage />} />
1769:      <Route path="payments" element={<AdminPaymentsPage />} />
1770:      <Route path="notifications" element={<AdminNotificationsPage />} />
1771:      <Route path="settings" element={<AdminSettingsPage />} />
1849:      <Route index element={<DashboardHome />} />
1851:      <Route path=":module/*" element={<AdminModulePage />} />
1853:      <Route path="*" element={<DashboardPlaceholder />} />
1889:    <RouteTransition>
1891:    <Routes location={location}>
1892:      <Route path="/result/:token" element={<PublicAcademicResult/>}/>
1893:      <Route path="/online-exams" element={<OnlineExamsPage/>}/>
1894:      <Route path="/academic/routine" element={<AcademicDirectoryPage type="routine"/>}/>
1895:      <Route path="/academic/updates" element={<AcademicDirectoryPage type="updates"/>}/>
1896:      <Route path="/academic/others" element={<AcademicDirectoryPage type="others"/>}/>
1902:      <Route
1903:        path="/"
1904:        element={<Home />}
1910:      <Route
1911:        path="/about/history"
1912:        element={
1917:      <Route
1918:        path="/about/founder"
1919:        element={
1924:      <Route
1925:        path="/about/chairman"
1926:        element={
1931:      <Route
1932:        path="/about/principal"
1933:        element={
1938:      <Route
1939:        path="/about/teachers"
1940:        element={<TeachersPage />}
1943:      <Route
1944:        path="/about/committee"
1945:        element={
1950:      <Route
1951:        path="/about/staff"
1952:        element={
1957:      <Route
1958:        path="/about/institution-details"
1959:        element={
1969:      <Route
1970:        path="/academic/students"
1971:        element={<StudentsPage />}
1974:      <Route
1975:        path="/academic/class-routine"
1976:        element={<ClassRoutinePage />}
1979:      <Route
1980:        path="/academic/exam-routine"
1981:        element={<ExamRoutinePage />}
1984:      <Route
1985:        path="/academic/rules"
1986:        element={<RulesPage />}
1989:      <Route
1990:        path="/academic/uniform"
1991:        element={<UniformPage />}
1994:      <Route
1995:        path="/academic/holidays"
1996:        element={<HolidaysPage />}
2004:      <Route
2005:        path="/result/individual"
2006:        element={<IndividualResultPage />}
2009:      <Route
2010:        path="/result/assessment"
2011:        element={<AssessmentPage />}
2014:      <Route
2015:        path="/result/board"
2016:        element={<BoardResultPage />}
2024:      <Route
2025:        path="/admission/online"
2026:        element={<OnlineAdmissionPage />}
2029:      <Route
2030:        path="/admission/online/:identifier"
2031:        element={<AdmissionCardDetailPage />}
2034:      <Route
2035:        path="/admission/form"
2036:        element={<BlankFormPage />}
2039:      <Route
2040:        path="/admission/applicant"
2041:        element={<ApplicantPage />}
2045:      <Route
2046:        path="/my-tests"
2047:        element={<MyTestsPage />}
2055:      <Route
2056:        path="/notices"
2057:        element={
2065:      <Route
2066:        path="/notices/:id"
2067:        element={
2075:      <Route
2076:        path="/news"
2077:        element={
2085:      <Route
2086:        path="/news/:id"
2087:        element={
2095:      <Route
2096:        path="/events"
2097:        element={
2105:      <Route
2106:        path="/events/:id"
2107:        element={
2120:      <Route
2121:        path="/gallery/photos"
2122:        element={<PhotoGalleryPage />}
2125:      <Route
2126:        path="/gallery/videos"
2127:        element={<VideoGalleryPage />}
2135:      <Route
2136:        path="/contact"
2137:        element={<Contact />}
2140:      <Route
2141:        path="/stories"
2142:        element={<StoriesPage />}
2145:      <Route
2146:        path="/search"
2147:        element={<SearchPage />}
2155:      <Route
2156:        path="/login"
2157:        element={<Login title="Login" />}
2160:      <Route
2161:        path="/register"
2162:        element={
2167:      <Route
2168:        path="/profile"
2169:        element={
2174:      <Route element={<StudentDashboardLayout />}>
2175:      <Route path="/student/dashboard">
2176:        <Route index element={<StudentPortalDashboard />} />
2177:        <Route path="courses" element={<StudentCoursesPage />} />
2178:        <Route path="assessments" element={<StudentAssessmentsPage />} />
2179:        <Route path="assignments" element={<StudentAssignmentsPage />} />
2180:        <Route path="materials" element={<StudentMaterialsPage />} />
2181:        <Route path="results" element={<StudentResultsPage />} />
2182:        <Route path="notifications" element={<StudentNotificationsPage />} />
2183:        <Route path="profile" element={<StudentProfilePage />} />
2185:      <Route path="/student/courses" element={<StudentCoursesPage />} />
2186:      <Route path="/student/courses/:enrollmentId" element={<StudentCoursePage />} />
2187:      <Route path="/student/courses/:enrollmentId/materials/:materialId" element={<StudentMaterialDetailPage />} />
2188:      <Route path="/student/courses/:enrollmentId/overview" element={<StudentAcademicOverviewPage />} />
2189:      <Route path="/student/courses/:enrollmentId/subjects/:subjectId/result" element={<StudentCourseResultPage />} />
2190:      <Route path="/student/assessments" element={<StudentAssessmentsPage />} />
2191:      <Route path="/student/tests/:assessmentId" element={<StudentTestPage />} />
2192:      <Route path="/student/tests/:assessmentId/result" element={<StudentTestResultPage />} />
2193:      <Route path="/student/tests/:assessmentId/review" element={<StudentTestReviewPage />} />
2194:      <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
2195:      <Route path="/student/assignments/:assignmentId" element={<StudentAssignmentDetailPage />} />
2196:      <Route path="/student/assignments/:assignmentId/result" element={<StudentAssignmentResultPage />} />
2197:      <Route path="/student/materials" element={<StudentMaterialsPage />} />
2198:      <Route path="/student/results" element={<StudentResultsPage />} />
2199:      <Route path="/student/notifications" element={<StudentNotificationsPage />} />
2200:      <Route path="/student/profile" element={<StudentProfilePage />} />
2201:      <Route path="/student/actions" element={<StudentActionsPage />} />
2202:      <Route path="/student/practice" element={<StudentPracticePage />} />
2203:      <Route path="/student/practice/mistakes" element={<StudentMistakesPage />} />
2204:      <Route path="/student/feedback" element={<StudentFeedbackPage />} />
2205:      <Route path="/student/progress" element={<StudentProgressPage />} />
2206:      <Route path="/student/bookmarks" element={<StudentBookmarksPage />} />
2207:      <Route path="/student/admissions/:applicationId/payment" element={<StudentAdmissionPaymentPage />} />
2208:      <Route path="/student/payments/mock/:transactionId" element={<StudentMockCheckoutPage />} />
2209:      <Route path="/student/payments/result" element={<StudentPaymentResultPage />} />
2210:      <Route path="/student/payments" element={<StudentPaymentHistoryPage />} />
2211:      <Route path="/student/payments/:transactionId/receipt" element={<StudentPaymentReceiptPage />} />
2213:      <Route path="/teacher/dashboard" element={<TeacherDashboardLayout />}>
2214:        <Route index element={<TeacherOverviewPage />} />
2215:        <Route path="courses" element={<TeacherCoursesPage />} />
2216:        <Route path="assessments" element={<TeacherAssessmentsPage />} />
2217:        <Route path="question-bank" element={<TeacherQuestionBankPage />} />
2218:        <Route path="materials" element={<TeacherMaterialsPage />} />
2219:        <Route path="course-outline" element={<TeacherCourseOutlinePage />} />
2220:        <Route path="performance" element={<TeacherPerformanceCenterPage />} />
2221:        <Route path="students/:studentId" element={<TeacherStudentProfilePage />} />
2222:        <Route path="interventions" element={<TeacherInterventionsPage />} />
2223:        <Route path="gradebook" element={<TeacherGradebookPage />} />
2224:        <Route path="academic-results" element={<TeacherAcademicResultsPage />} />
2225:        <Route path="assignments" element={<TeacherAssignmentManagementPage />} />
2226:        <Route path="review" element={<TeacherReviewPage />} />
2227:        <Route path="students" element={<TeacherStudentsPage />} />
2228:        <Route path="notifications" element={<TeacherNotificationsPage />} />
2229:        <Route path="academic/sections" element={<HeadTeacherSectionsPage />} />
2230:        <Route path="academic/subjects" element={<HeadTeacherSubjectsPage />} />
2231:        <Route path="academic/stages" element={<HeadTeacherAcademicStagesPage />} />
2232:        <Route path="academic/assessment-components" element={<HeadTeacherAssessmentComponentsPage />} />
2233:        <Route path="academic/grade-scales" element={<HeadTeacherGradeScalesPage />} />
2234:        <Route path="academic/grade-scale-items" element={<HeadTeacherGradeScaleItemsPage />} />
2235:        <Route path="academic/teacher-assignments" element={<HeadTeacherSubjectAssignmentsPage />} />
2237:      <Route path="/teacher/assignments" element={<TeacherAssignmentHubPage />} />
2238:      <Route path="/teacher/assignments/:assignmentId/submissions" element={<TeacherAssignmentSubmissionsPage />} />
2239:      <Route path="/teacher/assignments/:assignmentId/submissions/:submissionId" element={<TeacherSubmissionReviewPage />} />
2240:      <Route path="/teacher/online-tests" element={<TeacherAssessmentsPage />} />
2241:      <Route path="/teacher/online-tests/create" element={<TeacherCreateTestPage />} />
2242:      <Route path="/teacher/online-tests/mcq" element={<TeacherAssessmentsPage />} />
2243:      <Route path="/teacher/online-tests/file-tests" element={<TeacherAssessmentsPage />} />
2244:      <Route path="/teacher/online-tests/live" element={<TeacherAssessmentsPage />} />
2245:      <Route path="/teacher/online-tests/scheduled" element={<TeacherAssessmentsPage />} />
2246:      <Route path="/teacher/online-tests/drafts" element={<TeacherAssessmentsPage />} />
2247:      <Route path="/teacher/online-tests/results" element={<TeacherResultsSubmissionsPage />} />
2254:      <Route
2255:        path="/Admin/login"
2256:        element={<AdminLogin />}
2259:      <Route
2260:        path="/admin/login"
2261:        element={<AdminLogin />}
2269:      <Route
2270:        path="/dashboard"
2271:        element={<DashboardLayout />}
2281:      <Route
2282:        path="/admin/dashboard"
2283:        element={<DashboardLayout />}
2288:      <Route path="/admin" element={<DashboardLayout />}>
2289:        <Route path="regular-academic/*" element={<RegularAcademicPage />} />
2290:        <Route index element={<Navigate to="dashboard" replace />} />
2291:        <Route path="teachers" element={<AdminTeachersPage />} />
2292:        <Route path="teachers/create" element={<AdminTeachersPage />} />
2293:        <Route path="teachers/:id" element={<AdminTeachersPage />} />
2294:        <Route path="teachers/:id/edit" element={<AdminTeachersPage />} />
2295:        <Route path="admissions" element={<AdminAdmissionsPage />} />
2296:        <Route path="admissions/create" element={<AdminAdmissionsPage />} />
2297:        <Route path="admissions/:id" element={<AdminAdmissionsPage />} />
2298:        <Route path="admissions/:id/edit" element={<AdminAdmissionsPage />} />
2299:        <Route path="admission-form-builder" element={<AdminAdmissionFormBuilderPage />} />
2300:        <Route path="admission-form-builder/:id" element={<AdminAdmissionFormBuilderPage />} />
2301:        <Route path="teacher-assignments" element={<AdminTeacherAssignmentsPage />} />
2302:        <Route path="teacher-assignments/create" element={<AdminTeacherAssignmentsPage />} />
2303:        <Route path="admission-applications" element={<AdminAdmissionApplicationsPage />} />
2304:        <Route path="admission-applications/:id" element={<AdminAdmissionApplicationsPage />} />
2305:        <Route path="payments" element={<AdminBkashPaymentPage />} />
2306:        <Route path="notices" element={<AdminNoticeManagementPage />} />
2307:        <Route path="gallery" element={<AdminGalleryManagementPage />} />
2323:        <Route
2325:          path={`/${p}`}
2326:          element={
2346:      <Route
2347:        path="*"
2348:        element={<NotFound />}
```

## Layouts and styles

```text
frontend/src\styles\student-portal.css
frontend/src\styles\experience.css
frontend/src\styles\dashboardSidebar.css
frontend/src\styles\admin-system.css
frontend/src\components\layout\RoleDashboardShell.jsx
frontend/src\shaders\threeui.css
frontend/src\index.css
frontend/src\pages\teacher\dashboard\TeacherDashboardLayout.jsx
frontend/src\pages\admin\regularAcademic.css
frontend/src\pages\admin\DashboardLayout.jsx
frontend/src\pages\admin\admin.css
frontend/src\pages\student\dashboard\StudentDashboardLayout.jsx
frontend/src\pages\admin\Dashboard\AdminDashboardLayout.jsx
frontend/src\pages\admin\Dashboard\styles\studentManagement.css
```

## Shared components

```text
frontend/src/components\student\UpcomingTests.jsx
frontend/src/components\layout\RoleDashboardShell.jsx
frontend/src/components\layout\Header.jsx
frontend/src/components\layout\Footer.jsx
frontend/src/components\assignment\DashboardPanels.jsx
frontend/src/components\assignment\AssignmentWidgets.jsx
frontend/src/components\assignment\AssignmentBuilder.jsx
frontend/src/components\experience\ExperienceUI.jsx
frontend/src/components\experience\StudentLiveShortcut.jsx
frontend/src/components\common\AcademicResultActions.jsx
frontend/src/components\experience\WaveMesh.jsx
frontend/src/components\common\AcademicResultCard.jsx
frontend/src/components\common\AcademicStructuredCard.jsx
frontend/src/components\common\ErrorBoundary.jsx
frontend/src/components\common\EmptyState.jsx
frontend/src/components\common\Cards.jsx
frontend/src/components\common\AnimatedDisclosure.jsx
frontend/src/components\common\AnimatedCounter.jsx
frontend/src/components\common\ImageUploader.jsx
frontend/src/components\common\HeroSlider.jsx
frontend/src/components\common\LanguageSwitcher.jsx
frontend/src/components\common\LearningHomeHero.jsx
frontend/src/components\common\motionVariants.js
frontend/src/components\common\LearningIcon.jsx
frontend/src/components\common\Modal.jsx
frontend/src/components\common\noticeContent.js
frontend/src/components\common\PageEntrance.jsx
frontend/src/components\common\ThemeToggle.jsx
frontend/src/components\common\StudyCategories.jsx
frontend/src/components\common\StudentProfile.jsx
frontend/src/components\common\StudentMotion.jsx
frontend/src/components\common\StudentAcademicCards.jsx
frontend/src/components\common\StatusBadge.jsx
frontend/src/components\common\States.jsx
frontend/src/components\common\Skeleton.jsx
frontend/src/components\common\SEO.jsx
frontend/src/components\common\SafeHtml.jsx
frontend/src/components\common\RichTextViewer.jsx
frontend/src/components\common\RichTextEditor.jsx
frontend/src/components\common\richText.js
frontend/src/components\common\Reveal.jsx
frontend/src/components\common\RegularAcademicCards.jsx
frontend/src/components\common\PageIllustration.jsx
frontend/src/components\common\PageHeader.jsx
```
