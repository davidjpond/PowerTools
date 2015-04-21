'use strict';
var reportData = {},
    reportOptions = {},
    dataOptions = window.dataOptions || {};

//noinspection JSUnusedGlobalSymbols
var powerTools = window.powerTools || {
      hideSpinner: function () {
        $j(window).ajaxStop(function () {
          closeLoading();
        });
      },
      loadYUIReport: function () {
        var ClientPagination = (function () {
          var myColumnDefs = reportData.columns,
              myDataSource = new YAHOO.util.DataSource('json/' + dataOptions.reportid + '.json.html?curyearonly=' +
                  dataOptions.curyearonly),
              oConfigs = {
                paginator: new YAHOO.widget.Paginator({
                  rowsPerPage: dataOptions.maxLines,
                  containers: ['top_container', 'bottom_container'],
                  template: reportData.template
                }),
                sortedBy: {key: reportData.sortKey, dir: YAHOO.widget.DataTable.CLASS_ASC},
                MSG_LOADING: 'Loading Report'
              },
              myDataTable = new YAHOO.widget.DataTable('paginated', myColumnDefs, myDataSource, oConfigs);
          var customFormatters = {
            Activities: PowerTools.ActivitiesLink,
            AllEnrollments: PowerTools.AllEnrollmentsLink,
            Attendance: PowerTools.AttendanceLink,
            AttCodeExist: PowerTools.AttCodeExistCheck,
            BellScheduleItems: PowerTools.BellScheduleItemsLink,
            BlankDay: PowerTools.BlankDayFormat,
            Calendar: PowerTools.CalendarLink,
            CCTermExist: PowerTools.CCTermExistCheck,
            CourseGroups: PowerTools.CourseGroupsLink,
            CourseSection: PowerTools.CourseSection,
            EditSectionLink: PowerTools.CourseSectionLink,
            DateNoLink: PowerTools.DateNoLink,
            DDAAttendance: PowerTools.DDAAttendanceLink,
            DDAAttendanceTime: PowerTools.DDAAttendanceTimeLink,
            DDACC: PowerTools.DDACCLink,
            DDAFeeTransaction: PowerTools.DDAFeeTransactionLink,
            DDAHonorRoll: PowerTools.DDAHonorRollLink,
            DDAPGFinalGrades: PowerTools.DDAPGFinalGradesLink,
            DDAReenrollments: PowerTools.DDAReenrollmentsLink,
            DDASection: PowerTools.DDASectionLink,
            DDASpEnrollments: PowerTools.DDASpEnrollmentsLink,
            DDAStandardsGrades: PowerTools.DDAStandardsGradesLink,
            DDAStoredGrades: PowerTools.DDAStoredGradesLink,
            DDAStudentRace: PowerTools.DDAStudentRaceLink,
            DDAStudents: PowerTools.DDAStudentsLink,
            DDAStudentTestScore: PowerTools.DDAStudentTestScoreLink,
            DDATeacherRace: PowerTools.DDATeacherRaceLink,
            DDATermBins: PowerTools.DDATermBinsLink,
            Demographics: PowerTools.DemographicsLink,
            Demographics2: PowerTools.Demographics2Link,
            EnrollmentDateNoLink: PowerTools.EnrollmentDateNoLink,
            DoesNotExist: PowerTools.DoesNotExist,
            FeeExist: PowerTools.FeeExistCheck,
            GradeLevelValid: PowerTools.GradeLevelValidCheck,
            GradeScales: PowerTools.GradeScalesLink,
            GradYear: PowerTools.GradYear,
            Incident: PowerTools.IncidentLink,
            InvalidGPA: PowerTools.InvalidGPAPoints,
            InvalidLGrade: PowerTools.InvalidGrade,
            LogEntry: PowerTools.LogEntryLink,
            NextSchool: PowerTools.NextSchool,
            NextGrade: PowerTools.NextGrade,
            NotSpecified: PowerTools.NotSpecifiedError,
            OverviewCount: PowerTools.OverviewCount,
            OverviewLink: PowerTools.OverviewLink,
            PeriodExist: PowerTools.PeriodExistCheck,
            PreviousGrades: PowerTools.PreviousGradesLink,
            ProgramExist: PowerTools.ProgramExistCheck,
            RaceCodeExist: PowerTools.RaceCodeExistCheck,
            Reports: PowerTools.ReportsLink,
            ScheduleSetup: PowerTools.ScheduleSetup,
            SchoolExist: PowerTools.SchoolExistCheck,
            SchoolExistNoDistrict: PowerTools.SchoolExistNoDistrictCheck,
            SectionTermExist: PowerTools.SectionTermExistCheck,
            SpecialPrograms: PowerTools.SpecialProgramsLink,
            Standards: PowerTools.StandardsLink,
            StandardExist: PowerTools.StandardExistCheck,
            StdConversion: PowerTools.StdConversionLink,
            StudentExist: PowerTools.StudentExistCheck,
            TeacherEdit: PowerTools.TeacherEditLink,
            TeacherEdit2: PowerTools.TeacherEdit2Link,
            TeacherExist: PowerTools.TeacherExistCheck,
            TestScoreExist: PowerTools.TestScoreExistCheck,
            TestExist: PowerTools.TestExistCheck,
            Transactions: PowerTools.TransactionsLink,
            TransferInfo: PowerTools.TransferInfoLink
          };

          YAHOO.widget.DataTable.Formatter = $j.extend(YAHOO.widget.DataTable.Formatter, customFormatters);

          myDataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
          myDataSource.connXhrMode = 'queueRequests';
          myDataSource.responseSchema = {
            resultsList: 'ResultSet',
            fields: reportData.fields
          };
          myDataSource.doBeforeCallback = function (oRequest, oFullResponse, oParsedResponse) {
            oParsedResponse.results.pop();
            closeLoading();
            return oParsedResponse;
          };

          return {
            oDS: myDataSource,
            oDT: myDataTable
          };
        })();
      },
      showWizardLink: function () {
        if (reportData.wizardLink === 1 && dataOptions.DDAUserPerms === 'on' && dataOptions.userid > 0) {
          $j('#wizardLink').html('These records may be corrected using the ' +
              '<a href="wizard.html?wizardid=' + dataOptions.reportid + 'Wizard">' + reportData.title + ' Wizard' +
              '</a>');
        }
      },
      loadReportData: function () {
        $j('#bcReportName').text(reportData.title);
        $j('#reportInfo').html(reportData.info);
        $j('h1').text(reportData.header);
        powerTools.showWizardLink();
        powerTools.loadYUIReport();
      },
      checkDDAPermissions: function () {
        $j.getJSON('json/DDAPermissions.json.html', function (result) {
          if (result.DDAPagePerms === '2' || (result.DDAGroupPerms === '2' && result.DDAPagePerms === '*') ||
              dataOptions.userid === '0') {
            dataOptions.DDAUserPerms = 'on';
          } else {
            dataOptions.DDAUserPerms = 'off';
          }
          if (dataOptions.ddaRedirect && dataOptions.DDAUserPerms === 'on') {
            dataOptions.DDAPagePerms = 'on';
          } else {
            dataOptions.DDAPagePerms = 'off';
          }
          powerTools.loadReportData();
        });
      },
      showSelectButtons: function () {
        if (reportData.showSelectButtons === 1) {
          $j('#selectStudents').show();
        } else {
          $j('#selectStudents').hide();
        }
      },
      reportConfig: {
        ActivitiesWithSpaces: function () {
          reportData = {
            title: 'Activities With Spaces',
            header: 'Activities with Spaces in the Field Names',
            info: 'This report selects any activity where the field name contains a space.<p>Selecting a record will take ' +
            'you to the activity, where the space can be removed from the field name, or the activity may be deleted.',
            fields: ['dcid', 'activityName', 'fieldName'],
            columns: [
              {key: 'activityName', label: 'Activity Name', minWidth: 150, sortable: true, formatter: 'Activities'},
              {key: 'fieldName', label: 'Field Name', minWidth: 150, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'activityName'
          };
        },
        AttendanceOverview: function () {
          reportData = {
            title: 'Attendance Overview',
            header: 'Attendance Overview',
            info: 'This report displays the FTE, Attendance Mode, Attendance Conversion, and whether or not absences or ' +
            'presents are calculated. This report is designed as an overview only, and requires no modifications.',
            fields: ['schoolName', 'fte', 'schoolYear', 'attendanceModeCode', 'attendanceConversion', 'calc'],
            columns: [
              {key: 'schoolName', label: 'School', minWidth: 100, sortable: true},
              {key: 'fte', label: 'FTE', minWidth: 50, sortable: true},
              {key: 'schoolYear', label: 'School Year', minWidth: 50, sortable: true},
              {key: 'attendanceModeCode', label: 'Attendance Mode Code', minWidth: 50, sortable: true},
              {key: 'attendanceConversion', label: 'Attendance Conversion', minWidth: 50, sortable: true},
              {key: 'calc', label: 'Calculation Type', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName'
          };
        },
        BlankStoredGrades: function () {
          reportData = {
            title: 'Blank Stored Grades',
            header: 'Students with Blank Stored Grades in ' + reportOptions.schoolName,
            info: 'This report selects any student who has a stored grade which has no letter grade, percentage is 0, and ' +
            'the comment is blank.<br>Selecting a record will take you to the students Historical Grades page, where the ' +
            'blank ' + 'grade can be deleted.',
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseNumber', 'courseName', 'storeCode',
              {key: 'termID', parser: 'number'}, 'storedGradeDcid'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'PreviousGrades'},
              {key: 'courseName', label: 'Course Name', minWidth: 150, sortable: true},
              {key: 'courseNumber', label: 'Course Number', minWidth: 50, sortable: true},
              {key: 'storeCode', label: 'Store Code', minWidth: 50, sortable: true},
              {key: 'termID', label: 'Term ID', minWidth: 50, sortable: true},
              {key: 'schoolName', label: 'School', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1,
            wizardLink: 1
          };
        },
        CalendarIssues: function () {
          reportData = {
            title: 'Incomplete Calendar Days',
            info: 'This report selects any calendar day record that is in-session, however either the Cycle Day is blank, ' +
            'the Bell Schedule is blank, or the Membership value is 0.<p>Selecting a record will take you to the ' +
            'calendar setup for that record. Records may be corrected by populating the data for the day, or removing ' +
            'the in-session checkbox.',
            fields: ['date', 'cycleDay', 'bellSchedule', 'membershipValue'
            ],
            columns: [
              {key: 'date', label: 'Date', minWidth: 150, sortable: true, formatter: 'Calendar'},
              {key: 'cycleDay', label: 'Cycle Day', minWidth: 100, sortable: true, formatter: 'BlankDay'},
              {key: 'bellSchedule', label: 'Bell Schedule', minWidth: 150, sortable: true, formatter: 'BlankDay'},
              {key: 'membershipValue', label: 'Membership Value', minWidth: 100, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'date'
          };

          if (dataOptions.schoolid === 0) {
            reportData.header = ('There are no calendar records at the District Office');
          } else {
            reportData.header = ('In-session Calendar Day Records with No Cycle Day, Bell Schedule, or Membership in ' +
            dataOptions.schoolname);
          }
        },
        CourseGroupsWithSpaces: function () {
          reportData = {
            title: 'Course Groups Ending in a Space',
            header: 'Course Groups Ending in a Space',
            info: 'This report selects any course group where the name ends in a space.<p>' +
            'Selecting a record will take you to the course group, where the space can be removed from the end of the ' +
            'name, or the course group may be deleted.',
            fields: ['dcid', 'courseGroup', 'type', 'schoolName'],
            columns: [
              {key: 'courseGroup', label: 'Course Group', minWidth: 150, sortable: true, formatter: 'CourseGroups'},
              {key: 'type', label: 'Type', minWidth: 150, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'courseGroup'
          };
        },
        DupAttendance: function () {
          reportData = {
            title: 'Duplicate Attendance Records',
            header: 'Students with Duplicate Attendance Records in ' + reportOptions.schoolName,
            info: 'This report selects any student who has duplicate daily or meeting attendance records.<br>' +
            'Selecting a record will take you to the students Attendance page, however the bad records must be removed ' +
            'via DDA.' +
            '<br>A duplicate daily record is indicated by a student having two attendance records on the same date.' +
            '<br>' +
            'A duplicate meeting record is indicated by a student who has two records in the same section enrollment ' +
            'for the ' +
            'same date and the same period.',
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'attDate', {key: 'ccID', parser: 'number'},
              {key: 'periodID', parser: 'number'}, 'attendanceType', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'Attendance'},
              {key: 'attDate', label: 'Attendance Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'ccID', label: 'CCID', minWidth: 50, sortable: true},
              {key: 'periodID', label: 'Period ID', minWidth: 50, sortable: true},
              {key: 'attendanceType', label: 'Attendance Type', minWidth: 100, sortable: true},
              {key: 'count', label: 'Count', minWidth: 50, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        DupAttendanceCode: function () {
          reportData = {
            title: 'Duplicate Attendance Code Records',
            header: 'Duplicate Attendance Code Records in ' + reportOptions.schoolName,
            info: 'This report displays attendance code records that are duplicated. An attendance code is considered ' +
            'duplicate when there are two records with the same school id, year id and attendance code. It is not ' +
            'recommended to simply delete these records as removing the attendance codes through normal deletion will ' +
            'orphan attendance records.',
            fields: ['attendanceCode', 'yearId', 'schoolName', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'attendanceCode', label: 'Att. Code', minWidth: 50, sortable: true},
              {key: 'yearId', label: 'School Year', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName',
            wizardLink: 1
          };
        },
        DupAttendanceConversion: function () {
          reportData = {
            title: 'Duplicate Attendance Conversion Records',
            header: 'Duplicate Attendance Conversion Records in ' + reportOptions.schoolName,
            info: 'This report displays attendance conversion records that are duplicated. An attendance conversion is ' +
            'considered duplicate when there are two records with the same school id, year id, and name. It is not ' +
            'recommended to simply delete these records as removing the attendance conversions will orphan bell ' +
            'schedule settings and attendance conversion ' +
            'items.',
            fields: ['name', 'schoolName', 'yearId', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'name', label: 'Attendance Conversion', minWidth: 150, sortable: true},
              {key: 'yearId', label: 'School Year', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName',
            wizardLink: 1
          };
        },
        DupBellSchedule: function () {
          reportData = {
            title: 'Duplicate Bell Schedule Records',
            header: 'Duplicate Bell Schedule Records in ' + reportOptions.schoolName,
            info: 'This report displays bell schedule records that are duplicated. A bell schedule is considered ' +
            'duplicate when there are two records with the same name, the same School ID, and the same Year ID. It is ' +
            'not recommended to simply delete these records as removing the bell schedules through normal deletion will ' +
            'orphan calendar day records.',
            fields: ['name', 'schoolName', 'yearId', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'name', label: 'Bell Schedule', minWidth: 150, sortable: true},
              {key: 'yearId', label: 'School Year', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName',
            wizardLink: 1
          };
        },
        DupBellScheduleItems: function () {
          reportData = {
            title: 'Duplicate Bell Schedule Items',
            header: 'Duplicate Bell Schedule Items in ' + reportOptions.schoolName,
            info: 'This report displays bell schedule item records that are duplicated. A duplicate bell schedule item is ' +
            'a bell schedule containing the same period twice. These records must be removed manually as a period ' +
            'should only be used once per day.<p> Clicking on the bell schedule name will take you to the bell schedule ' +
            'adjustment. While you may remove periods from the bell schedule for any school at any school, if you ' +
            'would like to add periods, you must do so at the school in the year in which the bell schedule exists.',
            fields: ['name', 'period', 'schoolName', 'yearId', 'bellScheduleItemDcid', 'bellScheduleItemId',
              {key: 'count', parser: 'number'}],
            columns: [
              {key: 'name', label: 'Bell Schedule Name', minWidth: 150, sortable: true, formatter: 'BellScheduleItems'},
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'period', label: 'Period', minWidth: 50, sortable: true},
              {key: 'yearId', label: 'School Year', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'name'
          };
        },
        DupCalendarDay: function () {
          reportData = {
            title: 'Duplicate Calendar Day Records',
            header: 'Duplicate Calendar Day Records in ' + reportOptions.schoolName,
            info: 'This report displays calendar day records that are duplicated. A calendar_day record is considered ' +
            'duplicate when there are two records with the same date and school id.',
            fields: ['date', 'schoolName', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true},
              {key: 'date', label: 'Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName',
            wizardLink: 1
          };
        },
        DupCourseNumbers: function () {
          reportData = {
            title: 'Duplicate Course Number Records',
            header: 'Duplicate Course Number Records',
            info: 'This report displays records in the Courses table that are duplicated.<p>' +
            'Duplicate course numbers must be either changed or removed to prevent incorrect reporting. The course ' +
            'number must be removed or changed via DDA in the courses table.',
            fields: ['courseNumber', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'courseNumber', label: 'Course Number', minWidth: 150, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 150, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'courseNumber'
          };
        },
        DupDays: function () {
          reportData = {
            title: 'Duplicate Day Records',
            header: 'Duplicate Cycle Day Records in ' + reportOptions.schoolName,
            info: 'This report displays Cycle Day records that are duplicated. A cycle day is considered duplicate when ' +
            'there are two records with the same School ID, same Year ID, and same letter. It is not recommended to ' +
            'simply delete these records as removing the cycle days through normal deletion will orphan calendar day ' +
            'records.',
            fields: ['letter', 'schoolName', 'yearId', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'letter', label: 'Day', minWidth: 50, sortable: true},
              {key: 'yearId', label: 'School Year', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName',
            wizardLink: 1
          };
        },
        DupEntryCodes: function () {
          reportData = {
            title: 'Duplicate Entry Code Records',
            header: 'Duplicate Entry Code Records',
            info: 'This report displays Entry code records that are duplicated. An Entry code is considered duplicate ' +
            'when there are two records with the same code.',
            fields: ['entryCode', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'entryCode', label: 'Entry Code', minWidth: 150, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 150, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'entryCode',
            wizardLink: 1
          };
        },
        DupExitCodes: function () {
          reportData = {
            title: 'Duplicate Exit Code Records',
            header: 'Duplicate Exit Code Records',
            info: 'This report displays exit code records that are duplicated. An Exit code is considered duplicate when ' +
            'there are two records with the same code.',
            fields: ['exitCode', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'exitCode', label: 'Exit Code', minWidth: 150, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 150, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'exitCode',
            wizardLink: 1
          };
        },
        DupFTE: function () {
          reportData = {
            title: 'Duplicate FTE Records',
            header: 'Duplicate FTE Records in ' + reportOptions.schoolName,
            info: 'This report displays FTE records that are duplicated. A Full-Time Equivalency is considered duplicate ' +
            'when there are two records with the same name, the same School ID, and the same Year Id. It is not ' +
            'recommended to simply delete these records as removing the FTE\'s through normal deletion will orphan ' +
            'student and reenrollment records.',
            fields: ['name', 'schoolName', 'yearId', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'name', label: 'FTE Name', minWidth: 150, sortable: true},
              {key: 'yearId', label: 'School Year', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName',
            wizardLink: 1
          };
        },
        DupGen: function () {
          reportData = {
            title: 'Duplicate Gen Table Records',
            header: 'Duplicate Gen Table Records in All Schools',
            info: 'This report displays records in the Gen table that are duplicated. A Gen record is considered duplicate ' +
            'when there are two records with the same category, name, school id, year id and value.',
            fields: ['cat', 'name', 'value', 'yearid', 'schoolName', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'cat', label: 'Category', minWidth: 150, sortable: true},
              {key: 'name', label: 'Name', minWidth: 150, sortable: true},
              {key: 'value', label: 'Value', minWidth: 50, sortable: true},
              {key: 'yearid', label: 'School Year', minWidth: 50, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'name',
            wizardLink: 1
          };
        },
        DuplicateTeacherNumber: function () {
          reportData = {
            title: 'Duplicate Teachers',
            header: 'Teachers with the Same Teacher Number in Multiple Schools',
            info: 'This report selects any staff member who exists in more than one school with the same teacher number.' +
            '<p>Selecting a teacher will take you to the staff members page.',
            fields: ['dcid', 'teacher', 'schoolName', 'teacher2dcid', 'teacher2', 'teacher2SchoolName',
                     'teacher2Number'],
            columns: [
              {key: 'teacher', label: 'Teacher Name', minWidth: 150, sortable: true, formatter: 'TeacherEdit'},
              {key: 'schoolName', label: 'School Name', minWidth: 100, sortable: true},
              {key: 'teacher2', label: 'Teacher Name', minWidth: 150, sortable: true, formatter: 'TeacherEdit2'},
              {key: 'teacher2SchoolName', label: 'School Name', minWidth: 100, sortable: true},
              {key: 'teacher2Number', label: 'Teacher Number', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'teacher'
          };
        },
        DupPeriodEnrollment: function () {
          reportData = {
            title: 'Duplicate Period Enrollments',
            header: 'Students with Multiple Enrollments in the Same Period in ' + reportOptions.schoolName,
            info: 'This report selects any student who is enrolled more than once in a period at any point in time.<p>' +
            'Selecting a record will take you to the students All Enrollments page, where the duplicate period ' +
            'enrollments may be reviewed.<p>' +
            '<b>This page is highly dependent on the Section Meetings records. If you are getting incorrect results, ' +
            'please reset section meetings.</b>',
            fields: ['dcid', 'studentid', 'student', 'schoolName', {key: 'studentNumber', parser: 'number'},
                     'dateEnrolled',
                     'periodNumber'],
            columns: [
              {key: 'student', label: 'Student Name', minWidth: 150, sortable: true, formatter: 'AllEnrollments'},
              {key: 'studentNumber', label: 'Student Number', minWidth: 100, sortable: true},
              {
                key: 'dateEnrolled', label: 'Date Dup Enrollment Starts', minWidth: 100, sortable: true,
                formatter: 'DateNoLink'
              },
              {key: 'periodNumber', label: 'Expression', minWidth: 100, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        DupPeriodNumber: function () {
          reportData = {
            title: 'Duplicate Period Number Records',
            header: 'Duplicate Period Number Records in ' + reportOptions.schoolName,
            info: 'This report displays period number records that are duplicated. A period is considered duplicate when ' +
            'there are two periods with the same period number, same School ID, and same Year ID.',
            fields: ['period', 'schoolName', 'yearId', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'period', label: 'Period Number', minWidth: 50, sortable: true},
              {key: 'yearId', label: 'School Year', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName',
            wizardLink: 1
          };
        },
        DupPrefs: function () {
          reportData = {
            title: 'Duplicate Preference Records',
            header: 'Duplicate Preference Records in ' + reportOptions.schoolName,
            info: 'This report displays records in the Prefs table that are duplicated. A Preference is considered ' +
            'duplicate when there are two records with the same name, school id, year id and user id.',
            fields: ['name', 'yearId', 'schoolId', {key: 'count', parser: 'number'}, {key: 'userId', parser: 'number'}],
            columns: [
              {key: 'name', label: 'Pref Name', minWidth: 150, sortable: true},
              {key: 'schoolId', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'yearId', label: 'School Year', minWidth: 50, sortable: true},
              {key: 'userId', label: 'UserId', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'name',
            wizardLink: 1
          };
        },
        DupServerConfig: function () {
          reportData = {
            title: 'Duplicate Server Config Records',
            header: 'Duplicate Server Config Records',
            info: 'This report displays server configuration records that are duplicated. A server_config record is ' +
            'considered duplicate when there are two records with the same name and server instance id.',
            fields: [
              {key: 'serverInstanceId', parser: 'number'},
              'name',
              {key: 'count', parser: 'number'}
            ],
            columns: [
              {key: 'name', label: 'Name', minWidth: 250, sortable: true},
              {key: 'serverInstanceId', label: 'Server Instance ID', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'name',
            wizardLink: 1
          };
        },
        DupServerInstance: function () {
          reportData = {
            title: 'Duplicate Server Instance Records',
            header: 'Duplicate Server Instance Records',
            info: 'This report displays server instance records that are duplicated. A server instance record is ' +
            'considered duplicate when there are two records with the same name and server instance id.',
            fields: [
              {key: 'id', parser: 'number'},
              'hostIp',
              'userSuppliedName',
              'serverState'
            ],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true},
              {key: 'hostIp', label: 'Server IP', minWidth: 150, sortable: true},
              {key: 'userSuppliedName', label: 'HostName', minWidth: 150, sortable: true},
              {key: 'serverState', label: 'Server State', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };
        },
        DupStoredGrades: function () {
          reportData = {
            title: 'Duplicate StoredGrades',
            header: 'Students with Duplicate Stored Grades in ' + reportOptions.schoolName,
            info: 'This report selects any student who has duplicate stored grades for a course and term.<br>' +
            'Selecting a record will take you to the students Historical Grades page, where the duplicate records can ' +
            'be deleted.' +
            '<br>' +
            'A duplicate storedgrade record is indicated by a student having two stored grades with the same course ' +
            'number, termid, and storecode.',
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseNumber', 'courseName', 'storeCode',
              {key: 'termID', parser: 'number'}],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'PreviousGrades'},
              {key: 'courseName', label: 'Course Name', minWidth: 150, sortable: true},
              {key: 'courseNumber', label: 'Course Number', minWidth: 50, sortable: true},
              {key: 'storeCode', label: 'Store Code', minWidth: 50, sortable: true},
              {key: 'termID', label: 'Term ID', minWidth: 50, sortable: true},
              {key: 'schoolName', label: 'School', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        DupStudentID: function () {
          reportData = {
            title: 'Duplicate Student IDs',
            header: 'Duplicate Student IDs in All Schools',
            info: 'This report selects any student whose ID matches the ID of another student in the database.<br>' +
            'Selecting a student will take you to the students General Demographics page, though the records for the ' +
            'student may have trouble displaying due to this issue.<br>' +
            'If you encounter this issue, please contact PowerSchool Technical Support for assistance in cleaning up ' +
            'these records.',
            fields: ['id', 'dcid', 'student1', 'student2dcid', 'student2'],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true},
              {key: 'student1', label: 'Student 1', minWidth: 150, sortable: true, formatter: 'Demographics'},
              {key: 'student2', label: 'Student 2', minWidth: 150, sortable: true, formatter: 'Demographics2'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student1'
          };
        },
        DupStudentNumber: function () {
          reportData = {
            title: 'Duplicate Student Numbers',
            header: 'Duplicate Student Numbers in ' + reportOptions.schoolName,
            info: 'This report selects any student who has a student number which is also assigned to another student.<br>' +
            'Selecting a record will take you to the students General Demographics page, where the student number can ' +
            'be changed.' +
            '<p><b>Note: </b>This report may identify students enrolled twice in the same district.',
            fields: ['studentNumber', 'dcid', 'student', 'schoolName', 'student2dcid', 'student2', 'school2Name'],
            columns: [
              {key: 'studentNumber', label: 'Student Number', minWidth: 150, sortable: true},
              {key: 'student', label: 'Student 1', minWidth: 150, sortable: true, formatter: 'Demographics'},
              {key: 'schoolName', label: 'Student 1 School Name', minWidth: 200, sortable: true},
              {key: 'student2', label: 'Student 2', minWidth: 50, sortable: true, formatter: 'Demographics2'},
              {key: 'school2Name', label: 'Student 2 School Name', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'studentNumber'
          };
        },
        DupTeacherNumber: function () {
          reportData = {
            title: 'Duplicate Teacher Numbers',
            header: 'Duplicate Teacher Numbers in ' + reportOptions.schoolName,
            info: 'This report selects any teacher who has a student number which is also assigned to another student.<br>' +
            'Selecting a record will take you to the teachers record, where the teacher number can be changed on the ' +
            'Edit Information section.' + '<p>' +
            '<b>Note: </b>This report may identify teachers entered twice in the same district.',
            fields: ['teacherNumber', 'dcid', 'teacher', 'schoolName', 'teacher2dcid', 'teacher2', 'school2Name'],
            columns: [
              {key: 'teacherNumber', label: 'Teacher Number', minWidth: 150, sortable: true},
              {key: 'teacher', label: 'Teacher 1', minWidth: 150, sortable: true, formatter: 'TeacherEdit'},
              {key: 'schoolName', label: 'Teacher 1 School Name', minWidth: 200, sortable: true},
              {key: 'teacher2', label: 'Teacher 2', minWidth: 50, sortable: true, formatter: 'TeacherEdit2'},
              {key: 'school2Name', label: 'Teacher 2 School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'teacherNumber'
          };
        },
        DupTermBins: function () {
          reportData = {
            title: 'Duplicate Final Grade Setup Records',
            header: 'Duplicate Final Grade Setup Records in ' + reportOptions.schoolName,
            info: 'This report displays Final Grade Setup (Termbins) records that are duplicated. A Final Grade Setup is ' +
            'considered duplicate when there are two records with the same SchoolID, the same TermID, and the same ' +
            'StoreCode.',
            fields: ['storeCode', 'termId', 'schoolYear', 'schoolName', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true},
              {key: 'schoolYear', label: 'School Year', minWidth: 75, sortable: true},
              {key: 'termId', label: 'Term', minWidth: 75, sortable: true},
              {key: 'storeCode', label: 'Store Code', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName',
            wizardLink: 1
          };
        },
        DupTerms: function () {
          reportData = {
            title: 'Duplicate Term Records',
            header: 'Duplicate Term Records in ' + reportOptions.schoolName,
            info: 'This report displays term records that are duplicated. A term is considered duplicate when there are ' +
            'two records with the same SchoolID, and same Term ID.',
            fields: ['termId', 'schoolName', 'yearId', {key: 'count', parser: 'number'}],
            columns: [
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'yearId', label: 'School Year', minWidth: 75, sortable: true},
              {key: 'termId', label: 'Term ID', minWidth: 75, sortable: true},
              {key: 'count', label: 'Count of Records', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName',
            showSelectButtons: 1,
            wizardLink: 1
          };
        },
        EnrollmentReport: function () {
          powerTools.hideSpinner();
          reportData = {
            title: 'Enrollment Report',
            header: 'Enrollment Report',
            info: 'This report will perform a listing of the count of records for each enrollment item PowerTools ' +
            'diagnoses.' +
            '<br>Items with an asterisk (*) can report data for the current term only.<p>' +
            'Due to the complexity of this report, this page may take some time to complete loading.',
            fields: ['report', 'reportName'],
            columns: [
              {key: 'report', label: 'Report', minWidth: 150, sortable: false, formatter: 'OverviewLink'},
              {key: 'reportName', label: 'Count of Records', minWidth: 150, sortable: false, formatter: 'OverviewCount'}
            ],
            template: PowerTools.templateCYOnly()
          };
        },
        FutureActiveSchool: function () {
          reportData = {
            title: 'Invalid Future Active Enrollments',
            header: 'Students with Active Enrollments for Future Dates in ' + reportOptions.schoolName,
            info: 'This report selects all students whose enrollments are active, but have future enrollment dates which ' +
            'do not start on the first day of a year long term.<br>' +
            'Selecting a record will take you to the students Transfer Info page, where the enrollment dates can be ' +
            'corrected if necessary. If the student should be preregistered, the record must be corrected by editing ' +
            'the enroll_status field using either DDA or Student Field Value.',
            fields: ['dcid', 'studentid', 'student', 'schoolName', {key: 'gradeLevel', parser: 'number'},
                     'enrollStatus',
                     'entryDate', 'exitDate'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'TransferInfo'},
              {key: 'gradeLevel', label: 'Grade Level', minWidth: 50, sortable: true},
              {key: 'enrollStatus', label: 'Enrollment Status', minWidth: 50, sortable: true},
              {key: 'entryDate', label: 'Entry Date', minWidth: 100, sortable: true, formatter: 'EnrollmentDateNoLink'},
              {key: 'exitDate', label: 'Exit Date', minWidth: 100, sortable: true, formatter: 'EnrollmentDateNoLink'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        FutureDiscipline: function () {
          reportData = {
            title: 'Discipline Logs with Future Dates',
            header: 'Discipline Logs with Future Dates',
            info: 'This report selects any student with a log entry that has a type of "Discipline" and a discipline ' +
            'action date in the future.<p>Selecting a student will take you to the log entry for the student.',
            fields: ['logdcid', 'dcid', 'student', 'date', 'logEntry'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'LogEntry'},
              {key: 'date', label: 'Date', minWidth: 50, sortable: true},
              {key: 'logEntry', label: 'Title', minWidth: 100, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student'
          };
        },
        FutureIncidents: function () {
          reportData = {
            title: 'Incidents with Future Dates',
            header: 'Incidents with Future Dates',
            info: 'This report selects any incident with an incident date in the future.<p>' +
            'Selecting an incident ID will take you to the incident management record.',
            fields: [
              {key: 'incidentId', parser: 'number'},
              'schoolName',
              'date',
              'title'
            ],
            columns: [
              {key: 'incidentId', label: 'Incident ID', minWidth: 50, sortable: true, formatter: 'Incident'},
              {key: 'date', label: 'Incident Date', minWidth: 50, sortable: true, formatter: 'DateNoLink'},
              {key: 'title', label: 'Incident Title', minWidth: 200, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'incidentId'
          };
        },
        GradeScaleDupCutoff: function () {
          reportData = {
            title: 'Grade Scales with Duplicate Cutoff Percentages',
            header: 'Grade Scales with Duplicate Cutoff Percentages',
            info: 'This report selects any grade scale which contains more than one item with the same cutoff percentage.' +
            '<br>' +
            'Selecting a record will take you to the grade scale, where the cutoff percentages may be corrected, or ' +
            'the duplicate item may be removed.',
            fields: ['dcid', 'name', {key: 'cutoff', parser: 'number'}, {key: 'count', parser: 'number'}],
            columns: [
              {key: 'name', label: 'Grade Scale Name', minWidth: 150, sortable: true, formatter: 'GradeScales'},
              {key: 'cutoff', label: 'Cutoff Percent', minWidth: 50, sortable: true},
              {key: 'count', label: 'Count', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'name'
          };
        },
        IncompleteSched: function () {
          reportData = {
            title: 'Students with Incomplete Scheduling Setup',
            header: 'Students with Incomplete Scheduling Setup in ' + reportOptions.schoolName,
            info: 'This report selects any student who is set to be Schedule Next year, however the Next School, Next ' +
            'Year Grade, or Year of Graduation is not set.<p>Selecting a record will take you to the students Scheduling ' +
            'Setup page, where the scheduling setup may be corrected by either populating the data, or by unchecking ' +
            'the "Schedule this Student" checkbox.',
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'schoolId', 'nextSchoolName', 'nextSchoolID',
              {key: 'nextYearGrade', parser: 'number'}, 'lowGrade', 'highGrade', 'yearOfGraduation'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'ScheduleSetup'},
              {key: 'nextSchoolName', label: 'Next School', minWidth: 200, sortable: true, formatter: 'NextSchool'},
              {key: 'nextYearGrade', label: 'Next Year Grade', minWidth: 50, sortable: true, formatter: 'NextGrade'},
              {
                key: 'yearOfGraduation',
                label: 'Year of Graduation',
                minWidth: 50,
                sortable: true,
                formatter: 'GradYear'
              },
              {
                key: 'schoolName',
                label: 'Current School',
                minWidth: 200,
                sortable: true,
                formatter: 'SchoolExistNoDistrict'
              }
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        IncompleteTransfers: function () {
          reportData = {
            title: 'Incomplete Student Transfers',
            header: 'Students with Incomplete Student Transfers in ' + reportOptions.schoolName,
            info: 'This report displays any student who has been transferred out of school, transferred to another school, ' +
            'but has not been enrolled in the new school. This type of incomplete transfer has been known to cause ' +
            'various issues with attendance reporting.<p>' +
            'Selecting a record will take you to the students Transfer Info page. The record must be corrected by ' +
            'enrolling the student back in school, or by modifying the schoolid to match the enrollment school id of ' +
            'the record.',
            fields: ['dcid', 'studentid', 'student', {key: 'gradeLevel', parser: 'number'}, 'schoolName',
                     'enrollmentSchoolName', 'exitDate'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'TransferInfo'},
              {key: 'gradeLevel', label: 'Grade Level', minWidth: 50, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true},
              {key: 'enrollmentSchoolName', label: 'Enrollment School Name', minWidth: 200, sortable: true},
              {key: 'exitDate', label: 'Exit Date', minWidth: 100, sortable: true, formatter: 'EnrollmentDateNoLink'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        IncorrectLunchBal: function () {
          reportData = {
            title: 'Incorrect Lunch Balances',
            header: 'Students with Incorrect Lunch Balances in ' + reportOptions.schoolName,
            info: 'This report selects any student who has a lunch balance which does not match the starting balance plus ' +
            'the net effect of all lunch transactions. The "Running Balance" plus the "Starting Balance" should match ' +
            'the "Current Balance."<p>' +
            'Selecting a record will take you to the students Lunch Transactions page. The data can easily be corrected ' +
            'for all students by running the special operation called "Recalculate Lunch Balances" from the ' +
            '<a href="/admin/tech/specop.html">Special Operations</a> page.',
            fields: ['dcid', 'student', 'schoolName', 'startingBalance', 'runningBalance', 'currentBalance'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'Transactions'},
              {key: 'startingBalance', label: 'Starting Balance', minWidth: 100, sortable: true, formatter: 'currency'},
              {key: 'runningBalance', label: 'Running Balance', minWidth: 100, sortable: true, formatter: 'currency'},
              {key: 'currentBalance', label: 'Current Balance', minWidth: 100, sortable: true, formatter: 'currency'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        IncorrectStoredGrades: function () {
          reportData = {
            title: 'Incorrect Stored Grades',
            header: 'Students with Incorrect Stored Grades in ' + reportOptions.schoolName,
            info: 'This report selects any student who has a grade where the letter grade or the GPA points does not match ' +
            'what is expected, based off the grade scale used when storing the grades.<br>' +
            'Items in red indicate a mismatch between the Historical Grade record, and the Grade Scale calculation.' +
            '<br>' +
            'The GPA points are determined by the letter grade of the Stored Grade record compared to the GPA Points of ' +
            'the letter grade in the gradescale. The GPA points are determined by the percentage of the Stored Grade ' +
            'record compared to the cutoff percentage of the grade scale.<br>' +
            'Selecting a record will take you to the students Historical Grades page, where the blank grade can be ' +
            'deleted.',
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseName', 'courseNumber', 'storeCode', 'termID',
              {key: 'percent', parser: 'number'}, 'grade', 'gradescaleGrade', {key: 'gpaPoints', parser: 'number'},
              {key: 'gradePoints', parser: 'number'}],
            columns: [
              {key: 'student', label: 'Student', minWidth: 50, sortable: true, formatter: 'PreviousGrades'},
              {key: 'courseName', label: 'Course Name', minWidth: 50, sortable: true},
              {key: 'courseNumber', label: 'Course Number', minWidth: 50, sortable: true},
              {key: 'storeCode', label: 'Store Code', minWidth: 50, sortable: true},
              {key: 'termID', label: 'Term ID', minWidth: 50, sortable: true},
              {key: 'percent', label: 'Percent', minWidth: 50, sortable: true},
              {key: 'grade', label: 'Grade / Expected', minWidth: 50, sortable: true, formatter: 'InvalidLGrade'},
              {key: 'gpaPoints', label: 'GPA Points / Expected', minWidth: 50, sortable: true, formatter: 'InvalidGPA'},
              {key: 'schoolName', label: 'School', minWidth: 150, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        IncorrectStudYear: function () {
          reportData = {
            title: 'Incorrect Studyear Field',
            header: 'Students with CC Records Having Incorrect Studyear Values in ' + reportOptions.schoolName,
            info: 'This report selects any cc record where the Studyear field is incorrect. A valid studyear field is the ' +
            'Student ID plus the Year ID of the CC record.<p>' +
            'Selecting a record will take you to all enrollments page to verify the enrollment is valid. To correct ' +
            'these records, proceed to the <a href="/admin/tech/executecommand.html" target="_blank">Execute Command ' +
            'Page</a> and run the command **fixstudyear',
            fields: ['dcid', 'student', 'courseSection', 'reason', {key: 'studentid', parser: 'number'},
              {key: 'yearId', parser: 'number'}, {key: 'studYear', parser: 'number'}],
            columns: [
              {key: 'student', label: 'Student', minWidth: 100, sortable: true, formatter: 'AllEnrollments'},
              {key: 'courseSection', label: 'Course.Section', minWidth: 100, sortable: true},
              {key: 'reason', label: 'Incorrect Value', minWidth: 100, sortable: true},
              {key: 'studentid', label: 'StudentID', minWidth: 50, sortable: true},
              {key: 'yearId', label: 'YearID', minWidth: 30, sortable: true},
              {key: 'studYear', label: 'StudYear', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        InvalidCC: function () {
          reportData = {
            title: 'Invalid Section Enrollments',
            header: 'Students with Blank Stored Grades in ' + reportOptions.schoolName,
            info: 'This report selects any class enrollment which has an exit date prior to the entry date of the class ' +
            'enrollment. Selecting a student will take you to the students All Enrollments page, where the data can be ' +
            'corrected.<p>Enrollments must be corrected by manually changing either the date enrolled or date left of ' +
            'the invalid enrollment.' +
            '<p>A no-show enrollment should be indicated by the exit date matching the entry date of the enrollment.',
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseName', 'courseNumber', 'sectionNumber',
                     'dateEnrolled', 'dateLeft'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'AllEnrollments'},
              {key: 'courseName', label: 'Course Name', minWidth: 150, sortable: true},
              {key: 'courseNumber', label: 'Course.Section', minWidth: 100, sortable: true, formatter: 'CourseSection'},
              {key: 'dateEnrolled', label: 'Date Enrolled', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'dateLeft', label: 'Date Left', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        InvalidLunch: function () {
          reportData = {
            title: 'Invalid Lunch Transactions',
            header: 'Students with Invalid Lunch Transactions in ' + reportOptions.schoolName,
            info: 'This report selects any student with a lunch transaction type that has been identified to be invalid.<p>' +
            'Selecting a record will take you to the students lunch transactions page. The records must be removed or ' +
            'corrected by DDA.',
            fields: ['dcid', 'student', 'schoolName', 'date', 'transType', 'currentBal'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'TransferInfo'},
              {key: 'date', label: 'Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'transType', label: 'Transtype', minWidth: 100, sortable: true},
              {key: 'currentBal', label: 'Current Balance', minWidth: 100, sortable: true, formatter: 'currency'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        InvalidSchool: function () {
          reportData = {
            title: 'Reverse School Enrollments',
            header: 'Students with Reverse School Enrollments in ' + reportOptions.schoolName,
            info: 'This report identifies all students who have a school enrollment with an exit date prior to the ' +
            'enrollment date.<p>' +
            'Selecting a student will take you to the Transfer Info page, where the records can be corrected. These ' +
            'enrollments can either be corrected by removing the invalid enrollments or by changing the enrollment dates ' +
            'so they are not reversed.<p>' +
            'A no-show enrollment should be indicated by the exit date matching the entry date of the enrollment.',
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'gradeLevel', 'entryDate', 'exitDate'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'TransferInfo'},
              {key: 'gradeLevel', label: 'Grade Level', minWidth: 50, sortable: true},
              {key: 'entryDate', label: 'Entry Date', minWidth: 100, sortable: true, formatter: 'EnrollmentDateNoLink'},
              {key: 'exitDate', label: 'Exit Date', minWidth: 100, sortable: true, formatter: 'EnrollmentDateNoLink'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        InvalidSpEnrollments: function () {
          reportData = {
            title: 'Reverse Special Program Enrollments',
            header: 'Students with Reverse Special Program Enrollments in ' + reportOptions.schoolName,
            info: 'This report selects any student who has a Special Program enrollment with the exit date prior to the ' +
            'entry date.<br>Selecting a record will take you to the students Special Programs page, where the enrollment ' +
            'may be corrected.' +
            '<br><b>Many states allow an exit date of 0/0/0 as an acceptable Special Program exit date. Please check ' +
            'with your states documentation or DOE for clarification.</b>',
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'programName', 'entryDate', 'exitDate'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'SpecialPrograms'},
              {key: 'programName', label: 'Special Program Name', minWidth: 150, sortable: true},
              {key: 'entryDate', label: 'Entry Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'exitDate', label: 'Exit Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'schoolName', label: 'School Name', minwidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        InvalidTrack: function () {
          reportData = {
            title: 'Students with Invalid Tracks',
            header: 'Students with Invalid Tracks in ' + reportOptions.schoolName,
            info: 'This report selects any students whose Track field is populated with something other than A,B,C,D,E, or ' +
            'F.' +
            '<p>Selecting a record will take you to the students Transfer Info page, where the invalid enrollments ' +
            'track may be corrected by selecting the Entry Date, then modifying the Track to be either blank or the ' +
            'students actual school track.',
            fields: ['dcid', 'studentid', 'student', 'schoolName', {key: 'gradeLevel', parser: 'number'}, 'entryDate',
                     'exitDate', 'track'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'TransferInfo'},
              {key: 'gradeLevel', label: 'Grade Level', minWidth: 50, sortable: true},
              {key: 'entryDate', label: 'Entry Date', minWidth: 100, sortable: true, formatter: 'EnrollmentDateNoLink'},
              {key: 'exitDate', label: 'Exit Date', minWidth: 100, sortable: true, formatter: 'EnrollmentDateNoLink'},
              {key: 'track', label: 'Track', minWidth: 50, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        InvCourseNumberCC: function () {
          reportData = {
            title: 'CC Record Course Number issues',
            header: 'Invalid Course Number in the CC Table in ' + reportOptions.schoolName,
            info: 'This report displays any CC record where the course number exists in the courses table, but has a ' +
            'different case sensitivity. This issue is documented in ' +
            '<a href="https://powersource.pearsonschoolsystems.com/d/55894" target="PowerSource">PowerSource article ' +
            '55894</a>.',
            fields: ['student', {key: 'sectionId', parser: 'number'}, 'schoolName', {key: 'termId', parser: 'number'},
                     'ccCourseNumber', 'ccSectionNumber', 'districtCourseNumber'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true},
              {key: 'sectionId', label: 'SectionID', minWidth: 50, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'termId', label: 'TermID', minWidth: 50, sortable: true},
              {key: 'ccCourseNumber', label: 'Sections Course #', minWidth: 50, sortable: true},
              {key: 'ccSectionNumber', label: 'Section #', minWidth: 50, sortable: true},
              {key: 'districtCourseNumber', label: 'Courses Course #', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            wizardLink: 1
          };
        },
        InvCourseNumberSections: function () {
          reportData = {
            title: 'Sections Record Course Number Issues',
            header: 'Invalid Course Number in the Sections table in ' + reportOptions.schoolName,
            info: 'This report displays any section where the course number exists in the courses table, but has a ' +
            'different case sensitivity in all schools. This issue is documented in ' +
            '<a href="https://powersource.pearsonschoolsystems.com/d/54970" target="PowerSource">' +
            'PowerSource article 54970</a>.',
            fields: [
              {key: 'sectionId', parser: 'number'},
              'sectionCourseNumber',
              'schoolName',
              'coursesCourseNumber'
            ],
            columns: [
              {key: 'sectionId', label: 'SectionID', minWidth: 150, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'sectionCourseNumber', label: 'Sections Course #', minWidth: 50, sortable: true},
              {key: 'coursesCourseNumber', label: 'Courses Course #', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'sectionId',
            wizardLink: 1
          };
        },
        MaintReport: function () {
          powerTools.hideSpinner();
          reportData = {
            title: 'Maintenance Report',
            header: 'Maintenance Report',
            info: 'This report will perform a listing of the count records for each system setup item PowerTools diagnoses.' +
            '<br>Due to the complexity of this report, this page may take some time to complete loading.',
            fields: ['report', 'reportName'],
            columns: [
              {key: 'report', label: 'Report', minWidth: 150, sortable: false, formatter: 'OverviewLink'},
              {key: 'reportName', label: 'Count of Records', minWidth: 150, sortable: false, formatter: 'OverviewCount'}
            ],
            template: PowerTools.templateNoOption()
          };
        },
        MisalignedStandards: function () {
          reportData = {
            title: 'Misaligned Standards',
            header: 'Standards with Invalid Calculation or List Parents',
            info: 'This report selects any standard where the list parent or calculation parent does not exist, or where ' +
            'the list or calculation parent is the same as the identifier for the standard.<br>Selecting a record will ' +
            'take you to the standard, where the list or calculation parent may be corrected.',
            fields: ['dcid', 'identifier', 'calculationParent', 'listParent', 'issue'],
            columns: [
              {key: 'identifier', label: 'Standard', minWidth: 100, sortable: true, formatter: 'Standards'},
              {key: 'calculationParent', label: 'Calculation Parent', minWidth: 100, sortable: true},
              {key: 'listParent', label: 'ListParent', minWidth: 100, sortable: true},
              {key: 'issue', label: 'Issue', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'identifier'
          };

        },
        MiscReport: function () {
          powerTools.hideSpinner();
          reportData = {
            title: 'Miscellaneous Report',
            header: 'Miscellaneous Report',
            info: 'This report will perform a listing of the count of records for each miscellaneous item PowerTools ' +
            'diagnoses.' +
            '<br>Items with an asterisk (*) can report data for the current term only.<p>' +
            'Due to the complexity of this report, this page may take some time to complete loading.',
            fields: ['report', 'reportName'],
            columns: [
              {key: 'report', label: 'Report', minWidth: 150, sortable: false, formatter: 'OverviewLink'},
              {key: 'reportName', label: 'Count of Records', minWidth: 150, sortable: false, formatter: 'OverviewCount'}
            ],
            template: PowerTools.templateCYOnly()
          };
        },
        MissingFTEStudent: function () {
          reportData = {
            title: 'Missing Full Time Equivalencies',
            header: 'Students with Missing Full Time Equivalencies in ' + reportOptions.schoolName,
            info: 'This report selects any student who has a Full Time Equivalency that is either blank, or does not ' +
            'belong to the school the student is enrolled in.<p>Selecting a record will take you to the students ' +
            'Transfer Info page, where the FTE may be corrected.',
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'entryDate', 'exitDate'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'TransferInfo'},
              {key: 'entryDate', label: 'Entry Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'exitDate', label: 'Exit Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        MissingRace: function () {
          reportData = {
            title: 'Students Missing Ethnicity or Race',
            header: 'Students with Blank Ethnicities or Missing Student Race Records in ' + reportOptions.schoolName,
            fields: ['dcid', 'studentid', 'student', 'ethnicity', 'race', 'fedEthnicity', 'schoolName'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'Demographics'},
              {
                key: 'ethnicity',
                label: 'Scheduling Ethnicity',
                minWidth: 50,
                sortable: true,
                formatter: 'NotSpecified'
              },
              {key: 'race', label: 'Federal Race', minWidth: 50, sortable: true, formatter: 'NotSpecified'},
              {key: 'fedEthnicity', label: 'Hispanic/Latino', minWidth: 50, sortable: true, formatter: 'NotSpecified'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };

          if (dataOptions.hispaniconly !== 1) {
            reportData.info =
                'This report selects any student who has a blank ethnicity, does not have hispanic or latino declared, ' +
                'or has no Federal Race records.';
          } else {
            reportData.info =
                'This report selects any student who has a blank ethnicity, or does not have hispanic or latino ' +
                'declared and has no Federal Race records.';
          }
        },
        NonInSessionAttendance: function () {
          var accessType;
          if (dataOptions.ddaRedirect === 'on') {
            accessType = 'Access';
          } else {
            accessType = 'Export';
          }

          reportData = {
            title: 'Non-Session Attendance',
            header: 'Students with Attendance on Non-Session Days in ' + reportOptions.schoolName,
            info: ('This report selects any student who has an attendance record that is on a day not in session on the ' +
            'calendar, or any meeting attendance record that the section is not in session either by the cycle day or ' +
            'bell schedule. It is also possible the the attendance record belongs to a section that no longer exists. ' +
            'This report also selects any student who has an attendance record when the student is either not in school, ' +
            'or not in that section on the date the attendance record exists.<p>Selecting a student will take you to ' +
            'the students Attendance page, though the attendance records may need to be corrected using DDA. Selecting ' +
            'an Attendance ID will take you to the record in Direct Database ' + accessType +
            '.<p>A non in-session day is indicated by the Calendar not having the In-Session ' +
            'checkbox checked.<p>This report is dependant on the Section Meetings table. If you are experiencing ' +
            'incorrect data, please reset section meetings.'),
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'attendanceDcid',
              {key: 'attendanceID', parser: 'number'},
                     'attendanceDate', 'attendanceType', {key: 'ccID', parser: 'number'},
              {key: 'periodID', parser: 'number'},
                     'attendanceCode', 'error'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'Attendance'},
              {key: 'attendanceID', label: 'Attendance ID', minWidth: 100, sortable: true, formatter: 'DDAAttendance'},
              {key: 'attendanceDate', label: 'Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'attendanceType', label: 'Attendance Type', minWidth: 100, sortable: true},
              {key: 'ccID', label: 'CCID', minWidth: 50, sortable: true},
              {key: 'periodID', label: 'Period ID', minWidth: 50, sortable: true},
              {key: 'attendanceCode', label: 'Att. Code', minWidth: 30, sortable: true},
              {key: 'error', label: 'Error', minWidth: 150, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1,
            wizardLink: 1
          };
        },
        OrphanedAttendance: function () {
          reportData = {
            title: 'Orphaned Attendance Records',
            header: 'Orphaned Attendance Records in ' + reportOptions.schoolName,
            info: ('This report selects any Attendance Record where the student, attendance code, CC record, section, ' +
            'course, ' +
            reportOptions.schoolType +
            'or period number does not exist, based off the options selected.<p>Selecting a record will take you ' +
            'to the record in Direct Database ' + reportOptions.ddaAccess + '.'),
            fields: ['attendanceDcid', {key: 'attendanceId', parser: 'number'}, 'student', 'studentid',
                     'attendanceCode',
                     'attendanceCodeId', 'attendanceRecordCodeId', 'courseSection', 'courseSectionSort', 'period',
                     'periodId',
                     'schoolName', 'schoolNumber'],
            columns: [
              {key: 'attendanceId', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDAAttendance'},
              {key: 'student', label: 'Student', minWidth: 50, sortable: true, formatter: 'StudentExist'},
              {key: 'attendanceCode', label: 'AttCode', minWidth: 50, sortable: true, formatter: 'AttCodeExist'},
              {
                key: 'courseSection', label: 'Course.Section', minWidth: 100, sortable: true, formatter: 'DoesNotExist',
                sortOptions: {field: 'CourseSectionSort'}
              },
              {key: 'period', label: 'Period', minWidth: 50, sortable: true, formatter: 'PeriodExist'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true, formatter: 'SchoolExist'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'attendanceId',
            wizardLink: 1
          };
        },
        OrphanedAttendanceTime: function () {
          reportData = {
            title: 'Orphaned Attendance_Time Records',
            header: 'Orphaned Attendance_Time Records in All Schools',
            info: ('This report selects any Attendance_Time Record where the attendance record not exist.<p>Selecting ' +
            'a record will take you to the record in Direct Database ' + reportOptions.ddaAccess + '.'),
            fields: ['dcid', {key: 'id', parser: 'number'}, {key: 'attendanceId', parser: 'number'}],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDAAttendanceTime'},
              {key: 'attendanceId', label: 'Attendance ID', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };

        },
        OrphanedCC: function () {
          reportData = {
            title: 'Orphaned CC Records',
            header: 'Orphaned CC Records in ' + reportOptions.schoolName,
            info: ('This report selects any CC Record where the student, section, course, ' + reportOptions.schoolType +
            ' or term does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
            reportOptions.ddaAccess + '.'),
            fields: ['dcid', {key: 'ccid', parser: 'number'}, 'student', 'studentid', 'courseSection',
                     'courseSectionSort',
                     'schoolName', 'schoolId', {key: 'termId', parser: 'number'}, 'ccTermId'],
            columns: [
              {key: 'ccid', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDACC'},
              {key: 'student', label: 'Student', minWidth: 200, sortable: true, formatter: 'StudentExist'},
              {
                key: 'courseSection', label: 'Course.Section', minWidth: 50, sortable: true, formatter: 'DoesNotExist',
                sortOptions: {field: 'Course_SectionSort'}
              },
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true, formatter: 'SchoolExist'},
              {key: 'termId', label: 'TermID', minWidth: 50, sortable: true, formatter: 'CCTermExist'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'ccid',
            wizardLink: 1
          };
        },
        OrphanedFeeTransaction: function () {
          reportData = {
            title: 'Orphaned Fee_Transaction Records',
            header: 'Orphaned Fee_Transaction Records in ' + reportOptions.schoolName,
            info: ('This report selects any Fee_Transaction Record where the student' + reportOptions.schoolType +
            'or fee does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
            reportOptions.ddaAccess + '.'),
            fields: ['dcid', {key: 'feeTransactionId', parser: 'number'}, 'student', 'studentid', 'feeName', 'feeId',
                     'schoolName', 'schoolId'],
            columns: [
              {key: 'feeTransactionId', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDAFeeTransaction'},
              {key: 'student', label: 'Student', minWidth: 50, sortable: true, formatter: 'StudentExist'},
              {key: 'feeName', label: 'Fee Name', minWidth: 100, sortable: true, formatter: 'FeeExist'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true, formatter: 'SchoolExist'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'feeTransactionId',
            wizardLink: 1
          };
        },
        OrphanedHonorRoll: function () {
          if (dataOptions.schoolid === 0) {
            reportOptions.schoolType = 'or school ';
          } else {
            reportOptions.schoolType = '';
          }

          reportData = {
            title: 'Orphaned Honor Roll Records',
            header: 'Orphaned HonorRoll Records in ' + reportOptions.schoolName,
            info: ('This report selects any HonorRoll Record where the student ' + reportOptions.schoolType +
            'does not exist.' + '<p>Selecting a record will take you to the record in Direct Database ' +
            reportOptions.ddaAccess + '.'),
            fields: ['dcid', {key: 'honorRollId', parser: 'number'}, 'student', 'studentid', 'schoolName', 'schoolId'],
            columns: [
              {key: 'honorRollId', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDAHonorRoll'},
              {key: 'student', label: 'Student', minWidth: 50, sortable: true, formatter: 'StudentExist'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, formatter: 'SchoolExistNoDistrict'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'honorRollId',
            wizardLink: 1
          };
        },
        OrphanedPGFinalGrades: function () {
          reportData = {
            title: 'Orphaned PGFinalGrades Records',
            header: 'Orphaned PGFinalGrades Records in ' + reportOptions.schoolName,
            info: ('This report selects any PGFinalGrades Record where the student, section, or course number does not ' +
            'exist.' +
            '<p>Selecting a record will take you to the record in Direct Database ' + reportOptions.ddaAccess + '.'),
            fields: ['dcid', 'id', 'student', 'studentid', 'courseSection', 'courseSectionSort'],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDAPGFinalGrades'},
              {key: 'student', label: 'Student', minWidth: 50, sortable: true, formatter: 'StudentExist'},
              {
                key: 'courseSection', label: 'Course.Section', minWidth: 100, sortable: true, formatter: 'DoesNotExist',
                sortOptions: {field: 'courseSectionSort'}
              }
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };
        },
        OrphanedReenrollments: function () {
          if (dataOptions.schoolid === 0) {
            reportOptions.schoolType = 'or school ';
          } else {
            reportOptions.schoolType = '';
          }

          reportData = {
            title: 'Orphaned Reenrollment Records',
            header: 'Orphaned Reenrollment Records in ' + reportOptions.schoolName,
            info: ('This report selects any Reenrollment Record where the student ' + reportOptions.schoolType +
            'does not exist, or if the grade ' +
            'level is not within the grade levels of the school.<p>Selecting a record will take you to the record in ' +
            'Direct Database ' + reportOptions.ddaAccess + '.'),
            fields: ['dcid', 'id', 'student', 'studentid', 'schoolName', 'schoolId',
              {key: 'gradeLevel', parser: 'number'},
                     'schoolHighGrade', 'schoolLowGrade'],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDAReenrollments'},
              {key: 'student', label: 'Student', minWidth: 50, sortable: true, formatter: 'StudentExist'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true, formatter: 'SchoolExist'},
              {key: 'gradeLevel', label: 'Grade Level', minWidth: 50, sortable: true, formatter: 'GradeLevelValid'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };
        },
        OrphanedSection: function () {
          reportData = {
            title: 'Orphaned Section Records',
            header: 'Orphaned Section Records in ' + reportOptions.schoolName,
            info: ('This report selects any Section Record where the course, teacher, ' + reportOptions.schoolType +
            'or term does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
            reportOptions.ddaAccess + '.'),
            fields: ['dcid', 'id', 'courseSection', 'courseSectionSort', 'teacher', 'teacherId', 'schoolName',
                     'schoolId',
                     'schoolTermId', {key: 'sectionTermId', parser: 'number'}],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDASection'},
              {
                key: 'courseSection', label: 'Course.Section', minWidth: 50, sortable: true, formatter: 'DoesNotExist',
                sortOptions: {field: 'courseSectionSort'}
              },
              {key: 'teacher', label: 'Teacher', minWidth: 200, sortable: true, formatter: 'TeacherExist'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true, formatter: 'SchoolExist'},
              {key: 'sectionTermId', label: 'TermID', minWidth: 50, sortable: true, formatter: 'SectionTermExist'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };
        },
        OrphanedSpEnrollments: function () {
          reportData = {
            title: 'Orphaned Special Program Records',
            header: 'Orphaned Special Program Records in ' + reportOptions.schoolName,
            info: ('This report selects any Special Program Enrollment where the student' + reportOptions.schoolType +
            ' or program does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
            reportOptions.ddaAccess + '.'),
            fields: ['dcid', 'id', 'student', 'studentid', 'programName', 'programId', 'schoolName', 'schoolId'],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDASpEnrollments'},
              {key: 'student', label: 'Student', minWidth: 100, sortable: true, formatter: 'StudentExist'},
              {key: 'programName', label: 'Program', minWidth: 100, sortable: true, formatter: 'ProgramExist'},
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true, formatter: 'SchoolExist'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };
        },
        OrphanedStandardsGrades: function () {
          reportData = {
            title: 'Orphaned StandardsGrades Records',
            header: 'Orphaned StandardsGrades Records in ' + reportOptions.schoolName,
            info: ('This report selects any StandardsGrades Record where the student' + reportOptions.schoolType +
            ' or standard does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
            reportOptions.ddaAccess + '.'),
            fields: ['dcid', 'id', 'student', 'studentid', 'standard', 'standardId', 'schoolName',
              {key: 'yearId', parser: 'number'}, 'schoolId'],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDAStandardsGrades'},
              {key: 'student', label: 'Student', minWidth: 50, sortable: true, formatter: 'StudentExist'},
              {key: 'standard', label: 'Standard', minWidth: 150, sortable: true, formatter: 'StandardExist'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true, formatter: 'SchoolExist'},
              {key: 'yearId', label: 'YearID', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };
        },
        OrphanedStoredGrades: function () {
          reportData = {
            title: 'Orphaned StoredGrades Records',
            header: 'Orphaned StoredGrades Records in ' + reportOptions.schoolName,
            info: ('This report selects any StoredGrades Record where the' +
            'student, linked course, or linked section does not exist.<p>' +
            'Selecting a record will take you to the record in Direct Database ' + reportOptions.ddaAccess + '.'),
            fields: ['dcid', 'student', 'studentid', 'courseSection', 'courseSectionSort', 'courseName',
              {key: 'termId', parser: 'number'}, 'schoolName'],
            columns: [
              {key: 'dcid', label: 'DCID', minWidth: 50, sortable: true, formatter: 'DDAStoredGrades'},
              {key: 'student', label: 'Student', minWidth: 50, sortable: true, formatter: 'StudentExist'},
              {
                key: 'courseSection', label: 'Course.Section', minWidth: 150, sortable: true, formatter: 'DoesNotExist',
                sortOptions: {field: 'courseSectionSort'}
              },
              {key: 'courseName', label: 'Course Name', minWidth: 200, sortable: true},
              {key: 'termId', label: 'TermID', minWidth: 50, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'dcid',
            wizardLink: 1
          };
        },
        OrphanedStudentRace: function () {
          reportData = {
            title: 'Orphaned StudentRace Records',
            header: 'Orphaned StudentRace Records in ' + reportOptions.schoolName,
            info: ('This report selects any StudentRace Record where the student or race code does not exist.<p>' +
            'Selecting a record will take you to the record in Direct Database ' + reportOptions.ddaAccess + '~'),
            fields: ['dcid', {key: 'id', parser: 'number'}, 'student', 'studentid', 'raceCode', 'raceCodeId'],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDAStudentRace'},
              {key: 'student', label: 'Student', minWidth: 200, sortable: true, formatter: 'StudentExist'},
              {key: 'raceCode', label: 'Race Code', minWidth: 100, sortable: true, formatter: 'RaceCodeExist'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };
        },
        OrphanedStudents: function () {
          if (dataOptions.schoolid === 0) {
            reportOptions.schoolType = 'school does not exist, or the ';
          } else {
            reportOptions.schoolType = '';
          }

          reportData = {
            title: 'Orphaned Student Records',
            header: 'Orphaned Student Records in ' + reportOptions.schoolName,
            info: ('This report selects any Student Record where the ' + reportOptions.schoolType +
            'grade level is not within the high and low grade levels for the school.<p>' +
            'Selecting a record will take you to the record in Direct Database ' + reportOptions.ddaAccess + '.'),
            fields: ['dcid', 'student', 'schoolName', 'schoolId', {key: 'gradeLevel', parser: 'number'},
                     'schoolHighGrade',
                     'schoolLowGrade'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 100, sortable: true, formatter: 'DDAStudents'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true, formatter: 'SchoolExist'},
              {key: 'gradeLevel', label: 'Grade Level', minWidth: 200, sortable: true, formatter: 'GradeLevelValid'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student'
          };
        },
        OrphanedStudentTestScore: function () {
          reportData = {
            title: 'Orphaned Student Test Score Records',
            header: 'Orphaned Student Test Score Records in ' + reportOptions.schoolName,
            info: ('This report selects any Student Test Score Record where the student, test, test score' +
            reportOptions.schoolType + 'or test date does not exist.<p>' +
            'Selecting a record will take you to the record in Direct Database ' + reportOptions.ddaAccess + '.'),
            fields: ['dcid', {key: 'id', parser: 'number'}, 'student', 'studentid', 'test', 'testId', 'studentTestId',
                     'testScore', 'testScoreId', 'testDate', 'schoolName', 'schoolId'],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDAStudentTestScore'},
              {key: 'student', label: 'Student', minWidth: 100, sortable: true, formatter: 'StudentExist'},
              {key: 'test', label: 'Test', minWidth: 100, sortable: true, formatter: 'TestExist'},
              {key: 'testScore', label: 'Test Score', minWidth: 100, sortable: true, formatter: 'TestScoreExist'},
              {key: 'testDate', label: 'Test Date', minWidth: 50, sortable: true, formatter: 'DateNoLink'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true, formatter: 'SchoolExist'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };
        },
        OrphanedTeacherRace: function () {
          reportData = {
            title: 'Orphaned TeacherRace Records',
            header: 'Orphaned TeacherRace Records in ' + reportOptions.schoolName,
            info: ('This report selects any TeacherRace Record where the teacher or race code does not exist.<p>' +
            'Selecting a record will take you to the record in Direct Database ' + reportOptions.ddaAccess + '.'),
            fields: ['dcid', {key: 'id', parser: 'number'}, 'teacher', 'teacherid', 'raceCode', 'raceCodeId'],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDATeacherRace'},
              {key: 'teacher', label: 'Teacher', minWidth: 50, sortable: true, formatter: 'TeacherExist'},
              {key: 'raceCode', label: 'Race Code', minWidth: 200, sortable: true, formatter: 'RaceCodeExist'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };
        },
        OrphanedTermBins: function () {
          if (dataOptions.schoolid === 0) {
            reportOptions.schoolType = 'or school ';
          } else {
            reportOptions.schoolType = '';
          }

          reportData = {
            title: 'Orphaned TermBins Records',
            header: 'Orphaned TermBins Records in ' + reportOptions.schoolName,
            info: ('This report selects any TermBins Record where the term ' + reportOptions.schoolType +
            'does not exist.<p>' + 'Selecting a record will take you to the record in Direct Database ' +
            reportOptions.ddaAccess + '.'),
            fields: ['dcid', {key: 'id', parser: 'number'}, 'storeCode', 'term', 'schoolName', 'schoolId', 'termName'],
            columns: [
              {key: 'id', label: 'ID', minWidth: 50, sortable: true, formatter: 'DDATermBins'},
              {key: 'storeCode', label: 'StoreCode', minWidth: 50, sortable: true},
              {key: 'term', label: 'Term', minWidth: 100, sortable: true, formatter: 'DoesNotExist'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true, formatter: 'SchoolExist'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'id',
            wizardLink: 1
          };
        },
        OrphanReport: function () {
          powerTools.hideSpinner();
          reportData = {
            title: 'Orphaned Records Report',
            header: 'Orphaned Records Report',
            info: ('This report will perform a listing of the count records for each system setup item PowerTools ' +
            'diagnoses. <br>Due to the complexity of this report, this page may take some time to complete loading.'),
            fields: ['report', 'reportName'],
            columns: [
              {key: 'report', label: 'Report', minWidth: 150, sortable: false, formatter: 'OverviewLink'},
              {key: 'reportName', label: 'Count of Records', minWidth: 150, sortable: false, formatter: 'OverviewCount'}
            ],
            template: PowerTools.templateNoOption()
          };
        },
        OutsideSchoolCC: function () {
          reportData = {
            title: 'Section Enrollments Outside the School Enrollments',
            header: 'Students with Section Enrollments Outside the School Enrollments in ' + reportOptions.schoolName,
            info: ('This report selects any student who has a section' +
            ' enrollment which is not contained within a valid school enrollment.<br>' +
            'Selecting a record will take you to the students all enrollments page, ' +
            'where the enrollment may be corrected.'),
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseNumber', 'sectionNumber', 'courseName',
                     'dateEnrolled', 'dateLeft'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'AllEnrollments'},
              {key: 'courseNumber', label: 'Course.Section', minWidth: 100, sortable: true, formatter: 'CourseSection'},
              {key: 'courseName', label: 'Course Name', minWidth: 150, sortable: true},
              {key: 'dateEnrolled', label: 'Date Enrolled', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'dateLeft', label: 'Date Left', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        OutsideSchoolSpEnrollments: function () {
          reportData = {
            title: 'Special Program Enrollments Outside the School Enrollments',
            header: 'Students with Special Program Enrollments Outside the School Enrollments in ' +
            reportOptions.schoolName,
            info: ('This report selects any student who has a Special Program enrollment which is not contained within a ' +
            'valid school enrollment.<br>Selecting a record will take you to the students Special Programs page, ' +
            'where the enrollment may be corrected.<br>' +
            '<B>Many states allow an exit date of 0/0/0 as an acceptable ' +
            'Special Program exit date, or an enrollment spanning multiple years. Please check with your states ' +
            'documentation or DOE for clarification. An exit date of 0/0/0 would result in a Special Program enrollment ' +
            'outside of a school enrollment.</b>'),
            fields: ['dcid', 'studentid', 'student', 'programName', 'schoolName', 'entryDate', 'exitDate'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'SpecialPrograms'},
              {key: 'programName', label: 'Special Program', minWidth: 150, sortable: true},
              {key: 'entryDate', label: 'Entry Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'exitDate', label: 'Exit Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'schoolName', label: 'SpEnrollment School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        OutsideYTSchool: function () {
          reportData = {
            title: 'School Enrollments Outside the Years and Terms',
            header: 'Students with School Enrollments Outside Years and Terms in ' + reportOptions.schoolName,
            info: ('This report selects all students who have a school enrollment which is not contained within any years ' +
            'and terms existing in the school.<br>' +
            'Selecting a record will take you to the students Transfer Info ' +
            'page, where the record can be corrected. Invalid records can be corrected by either removing the invalid ' +
            'enrollment, or by correcting the dates to make sure they fall within the schools years and terms.<br>' +
            'A no-show enrollment should be indicated by an exit date matching the entry date of the enrollment.'),
            fields: ['dcid', 'studentid', 'student', 'schoolName', {key: 'gradeLevel', parser: 'number'}, 'entryDate',
                     'exitDate'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'TransferInfo'},
              {key: 'gradeLevel', label: 'Grade Level', minWidth: 50, sortable: true},
              {key: 'entryDate', label: 'Entry Date', minWidth: 100, sortable: true, formatter: 'EnrollmentDateNoLink'},
              {key: 'exitDate', label: 'Exit Date', minWidth: 100, sortable: true, formatter: 'EnrollmentDateNoLink'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        OverlappingCC: function () {
          reportData = {
            title: 'Overlapping Section Enrollments',
            header: 'Students with Overlapping Section Enrollments in ' + reportOptions.schoolName,
            info: ('This report selects all students who are enrolled in a section more than once at any given time in a ' +
            'school year. Selecting a student takes you to the students All Enrollments page, where the data ' +
            'can be corrected.<br>' +
            'The easiest method for correcting these records is to use the "Clean up overlapping enrollments" function ' +
            'at the bottom of the newly opened page.'),
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseName', 'courseNumber', 'sectionNumber',
                     'yearID',
                     'termID'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'AllEnrollments'},
              {key: 'courseName', label: 'Course Name', minWidth: 150, sortable: true},
              {key: 'courseNumber', label: 'Course.Section', minWidth: 100, sortable: true, formatter: 'CourseSection'},
              {key: 'yearID', label: 'Year', minWidth: 100, sortable: true},
              {key: 'termID', label: 'Term', minWidth: 100, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        OverlappingSchool: function () {
          reportData = {
            title: 'Overlapping School Enrollments',
            header: 'Students with Overlapping School Enrollments in ' + reportOptions.schoolName,
            info: ('This page displays the reenrollment record which is overlapping another enrollment. Selecting a ' +
            'student will take you to the Transfer Info page, where the data can be corrected.<br>' +
            'The data must be corrected manually, either by removing the invalid record, or by correcting the enrollment ' +
            'dates so they do not overlap.'),
            fields: ['dcid', 'studentid', 'student', 'schoolName', {key: 'gradeLevel', parser: 'number'}, 'entryDate',
                     'exitDate'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'TransferInfo'},
              {key: 'gradeLevel', label: 'Grade Level', minWidth: 50, sortable: true},
              {key: 'entryDate', label: 'Entry Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'exitDate', label: 'Exit Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        OverlappingSpEnrollments: function () {
          reportData = {
            title: 'Overlapping Special Program Enrollments',
            header: 'Students with Overlapping Special Program Enrollments in ' + reportOptions.schoolName,
            info: ('This report selects all students who are enrolled in a special program more than once at any given ' +
            'time in a school year. Selecting a student takes you to the students Special Programs page, where the data ' +
            'can be corrected.' +
            '<p>' +
            'The easiest method for correcting these records is to correct the dates on the enrollments so they do not ' +
            'overlap, or to remove the duplicate enrollment by deletion.'),
            fields: ['dcid', 'student', 'specialProgram', 'entryDate', 'schoolName'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'SpecialPrograms'},
              {key: 'specialProgram', label: 'Program Name', minWidth: 150, sortable: true},
              {key: 'entryDate', label: 'Date of overlap', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        OverlappingTerms: function () {
          reportData = {
            title: 'Overlapping Terms',
            header: 'Overlapping terms in ' + reportOptions.schoolName,
            info: ('This report selects all year long terms which overlap another year long term.' + '<p>' +
            'Overlapping terms can cause many problems, including issues with attendance calculations. Overlapping terms ' +
            'must be corrected manually'),
            fields: ['schoolName', 'term1Id', 'term2Id', 'schoolId', 'term1FirstDay', 'term1LastDay', 'term2FirstDay',
                     'term2LastDay'],
            columns: [
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true},
              {key: 'term1FirstDay', label: 'Term 1 Start', minWidth: 150, sortable: true, formatter: 'DateNoLink'},
              {key: 'term1LastDay', label: 'Term 1 End', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'term2FirstDay', label: 'Term 2 Start', minWidth: 200, sortable: true, formatter: 'DateNoLink'},
              {key: 'term2LastDay', label: 'Term 2 End', minWidth: 200, sortable: true, formatter: 'DateNoLink'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'schoolName'
          };
        },
        PaddedSchoolEnrollments: function () {
          reportData = {
            title: 'Padded School Enrollments',
            header: 'Students with Padded School Enrollments in ' + reportOptions.schoolName,
            info: ('This report selects any student who is enrolled in school, however they are not enrolled in class at ' +
            'the beginning of their school enrollment, or they are not enrolled in class at the end of their school ' +
            'enrollment.' +
            '<br>' +
            'Selecting a record will take you to the students All Enrollments page, where the duplicate period ' +
            'enrollments may be reviewed.'),
            fields: ['dcid', 'studentid', 'student', {key: 'studentNumber', parser: 'number'}, 'entryDate', 'exitDate',
                     'firstCC', 'lastCC'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'TransferInfo'},
              {key: 'studentNumber', label: 'Student Number', minWidth: 100, sortable: true},
              {
                key: 'entryDate', label: 'School Entry Date', minWidth: 100, sortable: true,
                formatter: 'EnrollmentDateNoLink'
              },
              {
                key: 'exitDate',
                label: 'School Exit Date',
                minWidth: 100,
                sortable: true,
                formatter: 'EnrollmentDateNoLink'
              },
              {
                key: 'firstCC', label: 'Date of First CC Record', minWidth: 100, sortable: true,
                formatter: 'EnrollmentDateNoLink'
              },
              {
                key: 'lastCC', label: 'Date of Last CC Record', minWidth: 100, sortable: true,
                formatter: 'EnrollmentDateNoLink'
              }
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        PastPending: function () {
          reportData = {
            title: 'Invalid Pending Transfer Dates',
            header: 'Students with Invalid Pending Transfer Dates in ' + reportOptions.schoolName,
            info: ('This report identifies any students who have a pending transfer date in the past. A pending transfer ' +
            'date in the past indicates an automated transfer which did not occur.<br>' +
            'The record must be corrected ' +
            'by either transferring the student out of school, or by adjusting the students enroll_status field in DDA ' +
            'or student field value. You may also clear out the enrollment_transfer_date_pend field using DDA or ' +
            'Student Field value if the students enrollment information is currently correct.<br>' +
            'Selecting a student will take you ' +
            'to the students Transfer Info page. It may be possible to correct the enrollment data from this page by ' +
            'transferring the student.'),
            fields: ['dcid', 'studentid', 'student', {key: 'gradeLevel', parser: 'number'}, 'enrollmentStatus',
                     'pendingDate'
            ],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'TransferInfo'},
              {key: 'gradeLevel', label: 'Grade Level', minWidth: 50, sortable: true},
              {key: 'enrollmentStatus', label: 'Enrollment Status', minWidth: 150, sortable: true},
              {
                key: 'pendingDate', label: 'Pending Transfer Date', minWidth: 150, sortable: true,
                formatter: 'EnrollmentDateNoLink'
              }
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        PossibleDupStudents: function () {
          reportData = {
            title: 'Possible Duplicate Students',
            header: 'Possible Duplicate Students',
            info: ('This report selects any student who has another student with the same first name, last name and dates ' +
            'of birth.<p>Selecting a student will take you to the students Demographics page.'),
            fields: ['dcid', 'student', {key: 'studentNumber', parser: 'number'}, 'dob', 'student2dcid', 'student2',
              {key: 'student2StudentNumber', parser: 'number'}],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'Demographics'},
              {key: 'studentNumber', label: 'Student Number', minWidth: 50, sortable: true},
              {key: 'student2', label: 'Student 2', minWidth: 150, sortable: true, formatter: 'Demographics2'},
              {key: 'student2StudentNumber', label: 'Student Number 2', minWidth: 50, sortable: true},
              {key: 'dob', label: 'DOB', minWidth: 50, sortable: true, formatter: 'DateNoLink'}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student'
          };
        },
        PossibleDupTeachers: function () {
          reportData = {
            title: 'Possible Duplicate Teachers',
            header: 'Possible Duplicate Teachers',
            info: ('This report selects any staff member who has another staff member with the same first name, last name ' +
            'and SSN.<p>Selecting a teacher will take you to the staff members page.'),
            fields: ['dcid', 'teacher', 'schoolName', 'status', 'teacher2dcid', 'teacher2', 'teacher2SchoolName',
                     'teacher2Status'],
            columns: [
              {key: 'teacher', label: 'Teacher', minWidth: 150, sortable: true, formatter: 'TeacherEdit'},
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true},
              {key: 'status', label: 'Current Status', minWidth: 50, sortable: true},
              {key: 'teacher2', label: 'Teacher 2', minWidth: 150, sortable: true, formatter: 'TeacherEdit2'},
              {key: 'teacher2SchoolName', label: 'School Name 2', minWidth: 150, sortable: true},
              {key: 'teacher2Status', label: 'Current Status 2', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'teacher'
          };
        },
        ReportsWithSpaces: function () {
          reportData = {
            title: 'Reports Ending in a Space',
            header: 'Reports Ending in a Space',
            info: ('This report selects any report where the name ends in a space.<p>' +
            'Selecting a record will take ' +
            'you to the report setup, where the space can be removed from the end of the name, or the report may be ' +
            'deleted.'),
            fields: ['dcid', 'reportName', 'reportType'],
            columns: [
              {key: 'reportName', label: 'Report Name', minWidth: 150, sortable: true, formatter: 'Reports'},
              {key: 'reportType', label: 'Report Type', minWidth: 150, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'reportName'
          };

        },
        SchoolNetReport: function () {
          powerTools.hideSpinner();
          reportData = {
            title: 'SchoolNet Report',
            header: 'SchoolNet Report',
            info: ('This report will perform a listing of the count records for each system setup item PowerTools ' +
            'diagnoses.' +
            '<br>Due to the complexity of this report, this page may take some time to complete loading.'),
            fields: ['report', 'reportName'],
            columns: [
              {key: 'report', label: 'Report', minWidth: 150, sortable: false, formatter: 'OverviewLink'},
              {key: 'reportName', label: 'Count of Records', minWidth: 150, sortable: false, formatter: 'OverviewCount'}
            ],
            template: PowerTools.templateNoOption()
          };
        },
        SectionInvalidSM: function () {
          reportData = {
            title: 'Sections Missing Section Meeting Record',
            header: 'Sections missing Section Meeting records in ' + reportOptions.schoolName,
            info: ('This report displays any section which does not have a valid corresponding section meeting record.' +
            '<p>' +
            'These records may be corrected by adding an expression to the section. If the section already has an ' +
            'expression, you may correct these records by running the Reset Section Meetings special operation.<p>' +
            'Clicking on a section will take you to the Edit Section page for that section.'),
            fields: ['dcid', 'courseNumber', 'sectionNumber', {key: 'termId', parser: 'number'}, 'expression',
                     'schoolName'],
            columns: [
              {
                key: 'courseNumber',
                label: 'Course.Section',
                minWidth: 150,
                sortable: true,
                formatter: 'EditSectionLink'
              },
              {key: 'termId', label: 'Term ID', minWidth: 50, sortable: true},
              {key: 'expression', label: 'Expression', minWidth: 50, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'courseNumber'
          };
        },
        SpEnrollmentBadGrade: function () {
          reportData = {
            title: 'Special Program Enrollments with Incorrect Grade Levels',
            header: 'Students having Special Program enrollments with invalid grade levels in ' +
            reportOptions.schoolName,
            info: ('This report selects any student who has a Special Program enrollment where grade level of the ' +
            'enrollment does not match the grade level of the school enrollment which contains the special program ' +
            'enrollment.' +
            '<br>' +
            'Selecting a record will take you to the students Special Programs page, where the enrollment may be ' +
            'corrected.'),
            fields: ['dcid', 'studentid', 'student', 'schoolName', 'programName', {key: 'gradeLevel', parser: 'number'},
              {key: 'programGrade', parser: 'number'}, 'entryDate', 'exitDate'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'SpecialPrograms'},
              {key: 'programName', label: 'Special Program Name', minWidth: 150, sortable: true},
              {key: 'gradeLevel', label: 'Student Grade Level', minWidth: 100, sortable: true},
              {key: 'programGrade', label: 'SpEnrollment Grade Level', minWidth: 100, sortable: true},
              {key: 'entryDate', label: 'Entry Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'exitDate', label: 'Exit Date', minWidth: 100, sortable: true, formatter: 'DateNoLink'},
              {key: 'schoolName', label: 'School Name', minWidth: 200, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        },
        StdConversionLongGrade: function () {
          reportData = {
            title: 'Standard Conversion Scales Having Grades Over 8 Characters',
            header: 'Standard Conversion Scales Having Grades Over 8 Characters',
            info: ('This report selects any standards conversion scale which contains a grade/label which is longer than 8 ' +
            'characters in length.<br>Selecting a record will take you to the standards conversion scale, ' +
            'where the grade/label may be corrected, or the grade may be removed.'),
            fields: ['dcid', 'name', 'grade'],
            columns: [
              {key: 'name', label: 'Conversion Name', minWidth: 150, sortable: true, formatter: 'StdConversion'},
              {key: 'grade', label: 'Grade', minWidth: 50, sortable: true}
            ],
            template: PowerTools.templateNoCY(),
            sortKey: 'name'
          };
        },
        StudentNumberIssue: function () {
          reportData = {
            title: 'Students with Student Numbers greater than 2147483647',
            header: 'Students with Student Numbers Greater Than 2147483647 in ' + reportOptions.schoolName,
            info: ('This report displays any student with a student ' +
            'number higher than 2147483647. This issue is documented in the following PowerSource articles:<br>' +
            '<a href="https://powersource.pearsonschoolsystems.com/d/7269" target="PowerSource">' +
            'PowerSource article 7269</a><br>' +
            '<a href="https://powersource.pearsonschoolsystems.com/d/8669" target="PowerSource">' +
            'PowerSource article 8669</a><br>' +
            '<a href="https://powersource.pearsonschoolsystems.com/d/8768" target="PowerSource">' +
            'PowerSource article 8768</a><br>' +
            '<a href="https://powersource.pearsonschoolsystems.com/d/8769" target="PowerSource">' +
            'PowerSource article 8769</a><br>' +
            '<a href="https://powersource.pearsonschoolsystems.com/d/10472" target="PowerSource">' +
            'PowerSource article 10472</a>'),
            fields: ['dcid', 'studentid', 'student', {key: 'studentNumber', parser: 'number'}, 'schoolName'],
            columns: [
              {key: 'student', label: 'Student', minWidth: 150, sortable: true, formatter: 'Demographics'},
              {key: 'studentNumber', label: 'Student Number', minWidth: 50, sortable: true},
              {key: 'schoolName', label: 'School Name', minWidth: 150, sortable: true}
            ],
            template: PowerTools.templateCY(),
            sortKey: 'student',
            showSelectButtons: 1
          };
        }
      },
      loadReport: function () {
        if (dataOptions.ddaRedirect === 'on') {
          reportOptions.ddaAccess = 'Access, where the invalid data can be corrected or the record may be deleted';
        } else {
          reportOptions.ddaAccess = 'Export, where the record to be corrected may be reviewed for correction';
        }
        if (dataOptions.schoolid === 0) {
          reportOptions.schoolType = 'school';
          reportOptions.schoolName = 'All Schools';
        } else {
          reportOptions.schoolType = '';
          reportOptions.schoolName = dataOptions.schoolname;
        }
        powerTools.reportConfig[dataOptions.reportid]();
        powerTools.checkDDAPermissions();
        powerTools.showSelectButtons();
      }
    };