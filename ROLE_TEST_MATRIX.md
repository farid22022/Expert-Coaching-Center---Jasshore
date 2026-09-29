# Role test matrix — current evidence

| Feature | Admin | Head Teacher | Teacher | Student | Tested | Result |
|---|---|---|---|---|---|---|
| Authentication and scoped APIs | Backend | Backend | Browser + backend | Browser + backend | Yes | Existing 64-test backend suite passes; full browser matrix incomplete |
| Admission/application lifecycle | Backend | Scope tests | Scope tests | Backend | Automated | Pass in isolated test DB; browser end-to-end pending |
| Form builder / applicant details | Pending | N/A | N/A | Pending rendering | No | Not certified |
| Academic structure | Backend | Browser section form | Denial tests | Denial tests | Partial | Lookup bug fixed; save under investigation |
| Materials / question bank / outline | Backend | Shared teacher account | Browser loaded pages | Browser empty states | Partial | Page loads pass; complete CRUD pending |
| MCQ start/save/resume/submit | N/A | Backend | Existing backend fixtures | Browser + backend | Yes | Saved selection/deadline survive reload; result/progress update |
| Assignment submission/grading | Backend | Backend | Backend | Backend + empty UI | Automated | Existing flow tests pass; browser submission/grading pending |
| Results | Backend | Backend | Browser gradebook | Browser result + backend | Yes | Percentage bug fixed; other result-label issues remain |
| Notifications | N/A | Shared shell | Shared shell | Browser list | Partial | Refresh implemented; full cross-role delivery not certified |
| Responsive / keyboard | Pending | Pending | Pending | Partial | Partial | SVG sizing and modal code improved; breakpoint matrix pending |
