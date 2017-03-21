'use strict';
//noinspection JSUnusedGlobalSymbols
var powerTools = {
  reportData: {},
  reportOptions: {},
  menuOptions: {
    reportGroups: [
      {name: 'Enrollment'},
      {name: 'Misc'},
      {name: 'Orphan'},
      {name: 'Maint'}
    ],
    loadMenuOptions: function () {
      if (powerTools.dataOptions.schoolid === 0) {
        $j('#CalendarIssues').parent().hide();
      } else {
        $j('#OrphanedAttendanceTime').parent().hide();
      }
      if (powerTools.dataOptions.hidePaddedSchool === 'on') {
        $j('#PaddedSchoolEnrollments').parent().hide();
      }
      if (powerTools.dataOptions.hideSpEnrollments === 'on') {
        $j('#OutsideSchoolSpEnrollments,#SpEnrollmentBadGrade').parent().hide();
      }
      if (powerTools.dataOptions.hideBlankGrades === 'on') {
        $j('#BlankStoredGrades').parent().hide();
      }
      if (powerTools.dataOptions.hideDupGrades === 'on') {
        $j('#DupStoredGrades').parent().hide();
      }
    },
    collapseAll: function () {
      $j(powerTools.menuOptions.reportGroups).each(function (index, reports) {
        $j('#' + reports.name + 'Tools').hide();
      });
    },
    reportClick: function (report) {
      $j('#' + report + 'Report').click(function () {
        powerTools.menuOptions.collapseAll();
        $j('#' + report + 'Tools').show();
      });
    },
    showHideMenus: function (report) {
      $j('#' + report + 'Display').click(function () {
        if ($j('#' + report + 'Tools').is(':visible')) {
          $j('#' + report + 'Tools').hide();
          return false;
        } else {
          $j('#' + report + 'Tools').show();
          return false;
        }
      });
    }
  },
  initializeHomePage: function () {
    $j.getJSON('json/dataOptions.json', function (result) {
      powerTools.dataOptions = result;
      powerTools.loadHomePage();
      setTimeout(function () {
        $j('#btnContMax').click(function () {
          powerTools.detectHeaderState();
        });
      }, 500);
    });
  },
  initializeStudentPage: function () {
    loadingDialog();
    $j.getJSON('json/dataOptions.json', function (result) {
      powerTools.dataOptions = result;
      powerTools.dataOptions.frn = document.location.search.substring(5);
      powerTools.initReport('StudentReport');
    });
  },
  activateLinks: function (parentDiv) {
    $j(parentDiv + ' .ptreportlink').click(function () {
      powerTools.initReport(this.id);
    });
  },
  initStudentReport: function () {
    powerTools.dataOptions.reportid = 'StudentReport';
    powerTools.dataOptions.curYearSelect = '';
    $j('#wizardLink').html(null);
    powerTools.loadReport();
  },
  initReport: function (report) {
    closeLoading();
    if (!report) {
      report = powerTools.dataOptions.reportid;
    }
    powerTools.dataOptions.reportid = report;
    if (!powerTools.dataOptions.curYearSelect) {
      powerTools.dataOptions.curYearSelect = '';
    }
    $j('#wizardLink').html(null);
    powerTools.loadReport();
  },
  enableFilter: function () {
    if ($j('#filterdata').length === 0) {
      //noinspection JSUnresolvedFunction
      $j('#top_container').append('<br><span id="filterdata">' +
        'Search Records: <input type="text" id="filter">' +
        '<button onclick="powerTools.reportData.updateFilter()">Search</button></span><br>');
    }
  },
  openLoadingBar: function () {
    console.log('Content Main: ' + $j('#content-main'));
    console.log('Container: ' + $j('#container'));
    var leftoffset = $j('#content-main').offset().left,
      headerHeight = $j('#container').height();
    loadingDialog();
    $j('.ui-widget-overlay').css({'left': leftoffset, 'top': headerHeight});
  },
  loadReport: function () {
    powerTools.dataOptions.searchString = '';
    if (powerTools.dataOptions.ddaRedirect === 'on') {
      powerTools.reportOptions.ddaAccess =
        'Access, where the invalid data can be corrected or the record may be deleted';
    } else {
      powerTools.reportOptions.ddaAccess =
        'Export, where the record to be corrected may be reviewed for correction';
    }
    if (powerTools.dataOptions.schoolid === 0) {
      powerTools.reportOptions.schoolType = 'school';
      powerTools.reportOptions.schoolName = 'All Schools';
    } else {
      powerTools.reportOptions.schoolType = '';
      powerTools.reportOptions.schoolName = powerTools.dataOptions.schoolname;
    }
    powerTools.reportConfig[powerTools.dataOptions.reportid]();
    powerTools.loadReportData();
    powerTools.showSelectButtons();
    powerTools.detectHeaderState();
  },
  detectHeaderState: function () {
    var loc = $j('#usercontext-bar').position().top + $j('#usercontext-bar').height();
    $j('#nav-main,#content-main').css('top', loc);
  },
  loadReportData: function () {
    var selectedYear;
    powerTools.openLoadingBar();
    $j('#ptHomeLink').html('<a onClick="powerTools.loadHomePage();">' +
      'PowerTools</a> &gt;');
    $j('#bcReportName,title').text(powerTools.reportData.title);
    $j('#reportInfo').html('<p>' + powerTools.reportData.info + '</p>');
    $j('h1').text(powerTools.reportData.header);
    powerTools.showWizardLink();
    if ($j('#top_container>select[title="Years Selected"')) {
      selectedYear = $j('#top_container>select[title="Years Selected"').val();
    }
    powerTools.loadYUIReport(selectedYear);
  },
  loadMenu: function () {
    $j.get('template/menu.html', function (result) {
      $j('#nav-main-menu').html(result);
      powerTools.menuOptions.loadMenuOptions();
      powerTools.activateLinks('#nav-main-menu');
      if (powerTools.dataOptions.expandMenu !== 'on') {
        powerTools.menuOptions.collapseAll();
        $j(powerTools.menuOptions.reportGroups).each(function (index, reports) {
          powerTools.menuOptions.showHideMenus(reports.name);
          powerTools.menuOptions.reportClick(reports.name);
        });
      }
    });
    setTimeout(function () {
      powerTools.detectHeaderState();
    }, 200);
  },
  loadHomePage: function () {
    $j.getJSON('json/changelog.json', function (result) {
      $j('#paginated').html('<h3><span id="version"><a onclick="powerTools.loadChangeLog();">Version ' +
        result[0].version + '</a></span>' +
        '</h3><div id="ptinfo">This is the PowerTools Diagnostic Utility, which can be used to ' +
        'identify many known issues from within the PowerSchool application.<p> <span class="errorField">PowerTools ' +
        'is supported by PowerSchool Technical Support, and is not supported by PowerSchool Development.</span><br>' +
        'To submit enhancements, or to report any discrepancies, please email ' +
        '<a href="mailto:supportoperations@powerschool.com">supportoperations@powerschool.com</a></div>');
    });
    $j('#bcReportName,#top_container,#bottom_container,h1,#wizardLink').html(null);
    $j('#ptHomeLink,title').text('PowerTools');
    $j('#reportInfo').html('<img src="/images/PowerTools.gif" alt= "If you are seeing this message, the ' +
      'images for PowerTools are not properly loaded. Although PowerTools will function properly without the ' +
      'images, it is recommended to install the images in order to enjoy the full PowerTools experience, based on ' +
      'the installation instructions on PowerSource." id="logo">');
    $j('#selectStudents').hide();
    powerTools.loadMenu();
  },
  loadChangeLog: function () {
    var changeTable = '';
    $j('#top_container,#bottom_container,#reportInfo,#paginated').html(null);
    $j('#ptHomeLink').html('<a onclick="powerTools.loadHomePage();">PowerTools</a> &gt;');
    $j('#bcReportName,title,h1').text('Change Log');
    $j('#selectStudents').hide();
    $j.getJSON('json/changelog.json', function (result) {
      $j(result).each(function (index, record) {
        changeTable += ('<h3>Version ' + record.version + '</h3><ul>');
        //noinspection JSUnresolvedVariable
        $j(record.changes).each(function (index, changeItem) {
          changeTable += ('<li>' + changeItem.item + '</li>');
        });
        changeTable += ('</ul>');
      });
      $j('#reportInfo').html(changeTable);
    });
  },
  loadPreferences: function () {
    $j('#top_container,#bottom_container,#reportInfo,#paginated').html(null);
    $j('#ptHomeLink').html('<a onclick="powerTools.loadHomePage();">PowerTools</a> &gt;');
    $j('#bcReportName,title').text('Preferences');
    $j('#selectStudents').hide();
    $j.get('template/prefs.html', function (result) {
      $j('#reportInfo').html(result);
    });
  },
  loadYUIReport: function (selectedYear) {
    var curYearOnly;
    if (selectedYear) {
      curYearOnly = selectedYear;
    } else {
      powerTools.dataOptions.curYearSelect = '';
      curYearOnly = powerTools.dataOptions.curyearonly;
    }

    //noinspection JSUnusedLocalSymbols
    var ClientPagination = (function () {
      var customFormatters = {
        Activities: function (elCell, oRecord, oColumn, oData) {
          powerTools.adminLink(elCell, oRecord, oData, 'activitiessetup/edit.html?frn=006', 'dcid');
        },
        AllEnrollments: function (elCell, oRecord, oColumn, oData) {
          powerTools.studentLink(elCell, oRecord, oData, 'allenrollments.html', 'dcid');
        },
        Attendance: function (elCell, oRecord, oColumn, oData) {
          var dcid = oRecord.getData('dcid'), attendanceType = oRecord.getData('attendanceType');
          if (attendanceType === 'Meeting') {
            elCell.innerHTML = '<a href="/admin/students/home.html?frn=001' + dcid +
              '&ac=suv;lsp=/admin/attendance/view/meeting.html" target=Powertools>' + oData + '</a>';
          } else {
            elCell.innerHTML = '<a href="/admin/students/home.html?frn=001' + dcid +
              '&ac=suv;lsp=/admin/attendance/view/daily.html" target=Powertools>' + oData + '</a>';
          }
        },
        AttCodeExist: function (elCell, oRecord, oColumn, oData) {
          var attendanceCodeId = oRecord.getData('attendanceCodeId'),
            attendanceRecordCodeId = oRecord.getData('attendanceRecordCodeId');
          if (!oData && !attendanceCodeId) {
            elCell.innerHTML =
              '<span class="errorField">Attendance Code ID ' + attendanceRecordCodeId + ' does not exist</span>';
          } else if (!oData) {
            elCell.innerHTML = '(Present)';
          } else {
            elCell.innerHTML = oData;
          }
        },
        BellScheduleItems: function (elCell, oRecord, oColumn, oData) {
          var dcid = oRecord.getData('bellScheduleItemDcid'),
            id = oRecord.getData('bellScheduleItemId'),
            schoolName = oRecord.getData('schoolName'),
            yearId = oRecord.getData('yearId');
          elCell.innerHTML =
            '<a href="/admin/schoolsetup/bellschedules/items.html?frn=133' + dcid + '&id=' + id + '&name=' +
            oData +
            ' at ' + schoolName + ' for ' + yearId + '" target=Powertools>' + oData + '</a>';
        },
        BlankDay: function (elCell, oRecord, oColumn, oData) {
          if (oData) {
            elCell.innerHTML = oData;
          } else {
            elCell.innerHTML = '<span class="errorField">BLANK</span>';
          }
        },
        Calendar: function (elCell, oRecord, oColumn, oData) {
          var formattedDate = powerTools.convertDate(oData);
          elCell.innerHTML =
            '<a href="/admin/schoolsetup/calendarsetup/calendarsetup.html?scheddate=' + formattedDate +
            '" target=Powertools>' + formattedDate + '</a>';
        },
        CCTermExist: function (elCell, oRecord) {
          var termId1 = oRecord.getData('termId'), termId2 = oRecord.getData('ccTermId');
          if (!termId1) {
            elCell.innerHTML = '<span class="errorField">TermID ' + termId2 + ' does not exist</span>';
          } else {
            elCell.innerHTML = termId1;
          }
        },
        CourseGroups: function (elCell, oRecord, oColumn, oData) {
          powerTools.adminLink(elCell, oRecord, oData, 'coursegroups/edit.html?frn=006', 'dcid');
        },
        CourseSection: function (elCell, oRecord) {
          var courseNumber = oRecord.getData('courseNumber'), sectionNumber = oRecord.getData('sectionNumber');
          elCell.innerHTML = courseNumber + '.' + sectionNumber;
        },
        CourseSectionExist: function (elCell, oRecord, oColumn, oData) {
          powerTools.existCheck(elCell, oRecord, oData, 'sectionId', 'Section ID');
        },
        EditSectionLink: function (elCell, oRecord) {
          var courseNumber = oRecord.getData('courseNumber'),
            sectionNumber = oRecord.getData('sectionNumber'),
            dcid = oRecord.getData('dcid');
          elCell.innerHTML =
            '<a href="/admin/sections/edit.html?frn=003' + dcid + '" target=PowerTools>' + courseNumber + '.' +
            sectionNumber + '</a>';
        },
        DateNoLink: function (elCell, oRecord, oColumn, oData) {
          elCell.innerHTML = powerTools.convertDate(oData);
        },
        DDAAttendance: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '157', 'attendanceDcid');
        },
        DDAAttendanceTime: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '158');
        },
        DDACC: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '004');
        },
        DDAFeeTransaction: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '147');
        },
        DDAHonorRoll: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '034');
        },
        DDAPGFinalGrades: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '095');
        },
        DDAReenrollments: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '018');
        },
        DDASection: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '003');
        },
        DDASchoolCourse: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '153');
        },
        DDASpEnrollments: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '041');
        },
        DDAStoredGrades: function (elCell, oRecord, oColumn, oData) {
          var page;
          //noinspection JSUnresolvedVariable
          if (powerTools.dataOptions.DDAPagePerms === 'on') {
            page = 'usm';
          } else {
            page = 'dde';
          }
          elCell.innerHTML =
            '<a href="/admin/tech/' + page + '/home.html?mcr=031' + oData + '" target=Powertools>' + oData +
            '</a>';
        },
        DDAStudentRace: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '201');
        },
        DDAStudents: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '001');
        },
        DDAStudentTestScore: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '089');
        },
        DDATeacherRace: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '202');
        },
        DDATermBins: function (elCell, oRecord, oColumn, oData) {
          powerTools.ddaLink(elCell, oRecord, oData, '033');
        },
        Demographics: function (elCell, oRecord, oColumn, oData) {
          powerTools.studentLink(elCell, oRecord, oData, 'generaldemographics.html', 'dcid');
        },
        Demographics2: function (elCell, oRecord, oColumn, oData) {
          powerTools.studentLink(elCell, oRecord, oData, 'generaldemographics.html', 'student2dcid');
        },
        EnrollmentDateNoLink: function (elCell, oRecord, oColumn, oData) {
          var date;
          if (oData) {
            date = powerTools.convertDate(oData);
          } else {
            date = 'Not Enrolled';
          }
          elCell.innerHTML = date;
        },
        DoesNotExist: function (elCell, oRecord, oColumn, oData) {
          if (oData.search('does not exist') > -1) {
            elCell.innerHTML = '<span class="errorField">' + oData + '</span>';
          } else {
            elCell.innerHTML = oData;
          }
        },
        FeeExist: function (elCell, oRecord, oColumn, oData) {
          powerTools.existCheck(elCell, oRecord, oData, 'feeId', 'Fee ID');
        },
        GradeLevelValid: function (elCell, oRecord, oColumn, oData) {
          var schoolId = oRecord.getData('schoolId'),
            schoolHighGrade = oRecord.getData('schoolHighGrade'),
            schoolLowGrade = oRecord.getData('schoolLowGrade'),
            schoolName = oRecord.getData('schoolName');
          if ((schoolId === '999999') && (oData !== '99')) {
            elCell.innerHTML =
              '<span class="errorField">Enrollment is at Graduated students, but grade level is ' + oData +
              '</span>';
          } else if (!schoolName || ((oData >= schoolLowGrade) && (oData <= schoolHighGrade))) {
            elCell.innerHTML = oData;
          } else {
            elCell.innerHTML =
              '<span class="errorField">' + schoolName + ' does not have a grade level of ' + oData + '</span> ';
          }
        },
        GradeScales: function (elCell, oRecord, oColumn, oData) {
          powerTools.adminLink(elCell, oRecord, oData, 'marks/editscale.html?frn=090', 'dcid');
        },
        GradYear: function (elCell, oRecord) {
          var gradYear = oRecord.getData('yearOfGraduation');
          if (gradYear === 0) {
            elCell.innerHTML = '<span class="errorField">Not set</span>';
          } else {
            elCell.innerHTML = gradYear;
          }
        },
        Incident: function (elCell, oRecord, oColumn, oData) {
          powerTools.adminLink(elCell, oRecord, oData, 'admin/incidents/incidentlog.html?id=', 'incidentId');
        },
        InvalidGPA: function (elCell, oRecord) {
          var gpa = oRecord.getData('gpaPoints'), expGpa = oRecord.getData('gradePoints');
          if (gpa !== expGpa) {
            elCell.innerHTML = '<span class="errorField">' + gpa + ' / ' + expGpa + '</span>';
          } else {
            elCell.innerHTML = gpa + ' / ' + expGpa;
          }
        },
        InvalidLGrade: function (elCell, oRecord) {
          var lGrade = oRecord.getData('grade'), expLGrade = oRecord.getData('gradescaleGrade');
          if (lGrade !== expLGrade) {
            elCell.innerHTML = '<span class="errorField">' + lGrade + ' / ' + expLGrade + '</font>';
          } else {
            elCell.innerHTML = lGrade + ' / ' + expLGrade;
          }
        },
        LogEntry: function (elCell, oRecord, oColumn, oData) {
          var dcid = oRecord.getData('dcid'), logDcid = oRecord.getData('logdcid');
          elCell.innerHTML = '<a href="/admin/students/home.html?frn=001' + dcid +
            '&ac=suv;lsp=/admin/students/customlogentry.html?frn=008' + logDcid + '&studentfrn=001' + dcid +
            '" target=Powertools>' + oData + '</a>';
        },
        NextSchool: function (elCell, oRecord) {
          var nextSchoolName = oRecord.getData('nextSchoolName');
          var nextSchoolNumber = oRecord.getData('nextSchoolID');
          if (!nextSchoolName && nextSchoolNumber === '0') {
            elCell.innerHTML = '<span class="errorField">Not set</span>';
          } else if (!nextSchoolName && nextSchoolNumber !== '0') {
            elCell.innerHTML =
              '<span class="errorField">School number ' + nextSchoolNumber + ' does not exist</span>';
          } else {
            elCell.innerHTML = nextSchoolName;
          }
        },
        NextGrade: function (elCell, oRecord) {
          var schoolName = oRecord.getData('nextSchoolName'),
            schoolId = oRecord.getData('nextSchoolNumber'),
            nextGrade = Number(oRecord.getData('nextYearGrade')),
            lowGrade = Number(oRecord.getData('lowGrade')),
            highGrade = Number(oRecord.getData('highGrade'));
          if ((schoolName !== '' && schoolId !== 0) && (nextGrade < lowGrade || nextGrade > highGrade)) {
            elCell.innerHTML = '<span class="errorField">Students next grade is ' + nextGrade +
              ', however the schools grade levels are between ' + lowGrade + ' and ' + highGrade + '</span>';
          } else {
            elCell.innerHTML = nextGrade;
          }
        },
        NotSpecified: function (elCell, oRecord, oColumn, oData) {
          if (oData === 'Not Specified') {
            elCell.innerHTML = '<span class="errorField">Not Specified</span>';
          } else {
            elCell.innerHTML = oData;
          }
        },
        OverviewCount: function (elCell, oRecord, oColumn, oData) {
          var curYearOnly;
          if (powerTools.dataOptions.curYearSelect !== '') {
            curYearOnly = powerTools.dataOptions.curYearSelect;
          } else {
            curYearOnly = powerTools.dataOptions.curyearonly;
          }
          var forcedTotal = oRecord.getData('forcedTotal');
          if (forcedTotal) {
            elCell.innerHTML =
              ('<a id="' + oRecord.getData('reportName') + '" class="ptreportlink">' + forcedTotal + '</a>');
          } else {
            $j.getJSON('json/' + oData + '.json?curyearonly=' + curYearOnly + '&frn=' +
              powerTools.dataOptions.frn,
              function (result) {
                //noinspection JSUnresolvedVariable
                result.ResultSet.pop();
                //noinspection JSUnresolvedVariable
                elCell.innerHTML =
                  ('<a id="' + oRecord.getData('reportName') + '" class="ptreportlink">' + result.ResultSet.length +
                  '</a>');
              });
          }
        },
        OverviewLink: function (elCell, oRecord, oColumn, oData) {
          elCell.innerHTML =
            ('<a id="' + oRecord.getData('reportName') + '" class="ptreportlink">' + oData + '</a>');
        },
        PeriodExist: function (elCell, oRecord, oColumn, oData) {
          powerTools.existCheck(elCell, oRecord, oData, 'periodId', 'Period ID');
        },
        PreviousGrades: function (elCell, oRecord, oColumn, oData) {
          powerTools.studentLink(elCell, oRecord, oData, 'previousgrades.html', 'dcid');
        },
        ProgramExist: function (elCell, oRecord, oColumn, oData) {
          powerTools.existCheck(elCell, oRecord, oData, 'programId', 'Program ID');
        },
        RaceCodeExist: function (elCell, oRecord, oColumn, oData) {
          powerTools.existCheck(elCell, oRecord, oData, 'raceCodeId', 'Race code');
        },
        Reports: function (elCell, oRecord, oColumn, oData) {
          var dcid = oRecord.getData('dcid'), type = oRecord.getData('reportType');
          if (type === 'Object Report') {
            elCell.innerHTML =
              '<a href="/admin/objectreports/new.html?frn=022' + dcid + '" target=Powertools>' + oData + '</a>';
          } else if (type === 'Mailing Label') {
            elCell.innerHTML =
              '<a href="/admin/mailinglabels/edit.html?frn=022' + dcid + '" target=Powertools>' + oData + '</a>';
          } else if (type === 'Form Letter') {
            elCell.innerHTML =
              '<a href="/admin/formletters/edit.html?frn=022' + dcid + '" target=Powertools>' + oData + '</a>';
          } else if (type === 'Report Card') {
            elCell.innerHTML =
              '<a href="/admin/reportcards/edit.html?frn=022' + dcid + '" target=Powertools>' + oData + '</a>';
          }
        },
        ScheduleSetup: function (elCell, oRecord, oColumn, oData) {
          powerTools.studentLink(elCell, oRecord, oData, 'schedulesetup.html', 'dcid');
        },
        SchoolExist: function (elCell, oRecord) {
          var school = oRecord.getData('schoolName'), schoolNumber = oRecord.getData('schoolId');
          if (schoolNumber === '0') {
            elCell.innerHTML = 'District Office';
          } else if (!school) {
            elCell.innerHTML = '<span class="errorField">School number ' + schoolNumber + ' does not exist</span>';
          } else {
            elCell.innerHTML = school;
          }
        },
        SchoolExistNoDistrict: function (elCell, oRecord) {
          var school = oRecord.getData('schoolName'), schoolNumber = oRecord.getData('schoolId');
          if (schoolNumber === '0') {
            elCell.innerHTML = '<span class="errorField">District Office should not have these records</span>';
          } else if (!school) {
            elCell.innerHTML = '<span class="errorField">School number ' + schoolNumber + ' does not exist</span>';
          } else {
            elCell.innerHTML = school;
          }
        },
        SchoolExistNoGradStudents: function (elCell, oRecord) {
          var school = oRecord.getData('schoolName'),
            schoolNumber = oRecord.getData('schoolNumber');
          if (!school) {
            elCell.innerHTML = '<span class="errorField">School number ' + schoolNumber + ' does not exist</span>';
          } else if (school === 'Graduated Students') {
            elCell.innerHTML = '<span class="errorField">Graduated Students</span>';
          } else {
            elCell.innerHTML = school;
          }
        },
        SectionTermExist: function (elCell, oRecord) {
          var termId1 = oRecord.getData('schoolTermId'), termId2 = oRecord.getData('sectionTermId');
          if (!termId1) {
            elCell.innerHTML = '<span class="errorField">TermID ' + termId2 + ' does not exist</span>';
          } else {
            elCell.innerHTML = termId1;
          }
        },
        SpecialPrograms: function (elCell, oRecord, oColumn, oData) {
          powerTools.studentLink(elCell, oRecord, oData, 'specialprograms.html', 'dcid');
        },
        StudentExist: function (elCell, oRecord, oColumn, oData) {
          powerTools.existCheck(elCell, oRecord, oData, 'studentId', 'Student ID');
        },
        TeacherEdit: function (elCell, oRecord, oColumn, oData) {
          powerTools.adminLink(elCell, oRecord, oData, 'faculty/home.html?frn=005', 'dcid');
        },
        TeacherEdit2: function (elCell, oRecord, oColumn, oData) {
          powerTools.adminLink(elCell, oRecord, oData, 'faculty/home.html?frn=005', 'teacher2dcid');
        },
        TeacherExist: function (elCell, oRecord, oColumn, oData) {
          powerTools.existCheck(elCell, oRecord, oData, 'teacherId', 'Teacher ID');
        },
        TestScoreExist: function (elCell, oRecord, oColumn, oData) {
          powerTools.existCheck(elCell, oRecord, oData, 'testScoreId', 'Test Score ID');
        },
        TestExist: function (elCell, oRecord, oColumn, oData) {
          var testId = oRecord.getData('testId'), studentTestId = oRecord.getData('studentTestId');
          if (!testId) {
            elCell.innerHTML = '<span class="errorField">StudentTestID ' + studentTestId + ' does not exist</span>';
          } else if (!oData) {
            elCell.innerHTML = '<span class="errorField">Test ID ' + testId + ' does not exist</span>';
          } else {
            elCell.innerHTML = oData;
          }
        },
        Transactions: function (elCell, oRecord, oColumn, oData) {
          powerTools.studentLink(elCell, oRecord, oData, 'transactions.html', 'dcid');
        },
        TransferInfo: function (elCell, oRecord, oColumn, oData) {
          powerTools.studentLink(elCell, oRecord, oData, 'transferinfo.html', 'dcid');
        }
      };

      var myColumnDefs = powerTools.reportData.columns,
        myDataSource = new YAHOO.util.DataSource('json/' +
          powerTools.dataOptions.reportid + '.json?curyearonly=' +
          curYearOnly + '&frn=' + powerTools.dataOptions.frn + '&filter='), oConfigs = {
          paginator: new YAHOO.widget.Paginator({
            rowsPerPage: powerTools.dataOptions.maxLines,
            curYearOption: curYearOnly,
            containers: ['top_container', 'bottom_container'],
            template: powerTools.reportData.template,
            rowsPerPageOptions: [
              {value: 25, text: '25 Rows'},
              {value: 50, text: '50 Rows'},
              {value: 100, text: '100 Rows'},
              {value: 500, text: '500 Rows'},
              {value: 'all', text: 'All Rows'}
            ]
          }),
          sortedBy: {
            key: powerTools.reportData.sortKey,
            dir: YAHOO.widget.DataTable.CLASS_ASC
          },
          MSG_LOADING: 'Loading Report'
        },
        myDataTable = new YAHOO.widget.DataTable('paginated', myColumnDefs, myDataSource, oConfigs);

      YAHOO.widget.DataTable.Formatter = $j.extend(YAHOO.widget.DataTable.Formatter, customFormatters);

      //noinspection JSUnresolvedVariable
      myDataSource.responseType = YAHOO.util.XHRDataSource.TYPE_JSON;
      myDataSource.connXhrMode = 'queueRequests';
      myDataSource.responseSchema = {
        resultsList: 'ResultSet',
        fields: powerTools.reportData.fields
      };
      myDataSource.doBeforeCallback = function (oRequest, oFullResponse, oParsedResponse) {
        oParsedResponse.results.pop();
        powerTools.dataSet = oParsedResponse.results || [];

        var data = oParsedResponse.results || [],
          filtered = [],
          i, l;

        if (oRequest) {
          powerTools.dataOptions.searchString = $j('#filter').val();
          powerTools.dataSet = [];
          oRequest = oRequest.toLowerCase();
          var keys = [];
          $j(powerTools.reportData.columns).each(function (index, result) {
            keys.push(result.key);
          });
          for (i = 0, l = data.length; i < l; ++i) {
            for (var k = 0; k < keys.length; k++) {
              var keyitem = keys[k],
                checkVal = data[i][keyitem].toString().toLowerCase();
              if (checkVal.length === 10 && checkVal.indexOf('-') === 4 &&
                new Date(checkVal).toLocaleDateString() !== 'Invalid Date') {
                checkVal = new Date(checkVal);
                checkVal.setDate(checkVal.getDate() + 1);
                checkVal = checkVal.toLocaleDateString();
              }
              if (!checkVal.indexOf(oRequest)) {
                filtered.push(data[i]);
                powerTools.dataSet.push(data[i]);
                break;
              }
            }
          }
          oParsedResponse.results = filtered;
        }
        setTimeout(powerTools.enableFilter, 100);
        window.closeLoading();
        return oParsedResponse;
      };

      powerTools.reportData.updateFilter = function () {
        if ($j('#filter').val() !== powerTools.dataOptions.searchString) {
          var state = myDataTable.getState();
          powerTools.openLoadingBar();
          state.sortedBy = {
            key: powerTools.reportData.sortKey,
            dir: YAHOO.widget.DataTable.CLASS_ASC
          };

          myDataSource.sendRequest(YAHOO.util.Dom.get('filter').value, {
            success: myDataTable.onDataReturnInitializeTable,
            failure: myDataTable.onDataReturnInitializeTable,
            scope: myDataTable,
            argument: state
          });
        }
      };
      return {
        oDS: myDataSource,
        oDT: myDataTable
      };
    })();
  },
  adminLink: function (elCell, oRecord, oData, page, idField) {
    var dcid = oRecord.getData(idField);
    elCell.innerHTML = '<a href="/admin/' + page + dcid + '" target=Powertools>' + oData + '</a>';
  },
  convertDate: function (inputFormat) {
    var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/, date = new Date(NaN), month, parts = isoExp.exec(inputFormat);
    if (inputFormat === '1901-01-01') {
      return '0/0/0';
    } else {
      if (parts) {
        month = +parts[2];
        date.setFullYear(parts[1], month - 1, parts[3]);
        if (month !== date.getMonth() + 1) {
          date.setTime(NaN);
        }
      }
      return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/');
    }
  },
  ddaLink: function (elCell, oRecord, oData, tableNumber, idField) {
    var dcid, page;
    if (idField) {
      dcid = oRecord.getData(idField);
    } else {
      dcid = oRecord.getData('dcid');
    }
    if (powerTools.dataOptions.ddaUserPerms === 'on' && powerTools.dataOptions.ddaRedirect === 'on') {
      page = 'usm';
    } else {
      page = 'dde';
    }
    elCell.innerHTML =
      '<a href="/admin/tech/' + page + '/home.html?mcr=' + tableNumber + dcid + '" target=Powertools>' + oData +
      '</a>';
  },
  existCheck: function (elCell, oRecord, oData, field, label) {
    var reference = oRecord.getData(field);
    if (!oData) {
      elCell.innerHTML = '<span class="errorField">' + label + ' ' + reference + ' does not exist</span>';
    } else {
      elCell.innerHTML = oData;
    }
  },
  studentLink: function (elCell, oRecord, oData, page, idField) {
    var dcid = oRecord.getData(idField);
    elCell.innerHTML = '<a href="/admin/students/home.html?frn=001' + dcid + '&ac=suv;lsp=/admin/students/' + page +
      '" target=PowerTools>' + oData + '</a>';
  },
  showWizardLink: function () {
    if (powerTools.reportData.wizardLink === 1 && powerTools.dataOptions.ddaUserPerms === 'on' &&
      powerTools.dataOptions.userid > 0) {
      $j('#wizardLink').html('<p>These records may be corrected using the ' +
        '<a onclick="powerTools.loadWizard()">' +
        powerTools.reportData.title + ' Wizard</a>');
    }
  },
  showSelectButtons: function () {
    if (powerTools.reportData.showSelectButtons === 1) {
      $j('#selectStudents').show();
    } else {
      $j('#selectStudents').hide();
    }
  },
  reloadReport: function (selectedYear) {
    powerTools.dataOptions.curYearSelect = selectedYear;
    powerTools.loadYUIReport(selectedYear);
  },
  templateCYOnly: function () {
    return '{FirstPageLink} {PreviousPageLink} {PageLinks}  {NextPageLink} {LastPageLink} {CurrentYearDropdown}';
  },
  templateNoOption: function () {
    return '';
  },
  templateNoCY: function () {
    return '{FirstPageLink} {PreviousPageLink} {PageLinks} {NextPageLink} {LastPageLink} {RowsPerPageDropdown}';
  },
  templateCY: function () {
    return '{FirstPageLink} {PreviousPageLink} {PageLinks} {NextPageLink} {LastPageLink} {RowsPerPageDropdown}' +
      '{CurrentYearDropdown}';
  },
  curYearOption: function () {
    var Paginator = YAHOO.widget.Paginator,
      l = YAHOO.lang;

    Paginator.ui.CurrentYearDropdown = function (p) {
      this.paginator = p;
      p.subscribe('destroy', this.destroy, this, true);
    };

    Paginator.ui.CurrentYearDropdown.init = function (p) {
      p.setAttributeConfig('currentYearOptions', {
        value: [],
        validator: l.isArray
      });
    };

    Paginator.ui.CurrentYearDropdown.prototype = {
      render: function (id_base) {
        this.select = document.createElement('select');
        this.select.id = id_base + 'cy';
        this.select.title = 'Years Selected';
        YAHOO.util.Event.on(this.select, 'change', this.onChange, this, true);
        this.rebuild();
        return this.select;
      },
      rebuild: function () {
        var sel = this.select,
          options = [
            {value: '0', text: 'All Years'},
            {value: '1', text: 'Current Year'}
          ],
          opt,
          cfg,
          val,
          i,
          len;

        for (i = 0, len = options.length; i < len; ++i) {
          cfg = options[i];
          opt = sel.options[i] || sel.appendChild(document.createElement('option'));
          val = l.isValue(cfg.value) ? cfg.value : cfg;
          opt.innerHTML = l.isValue(cfg.text) ? cfg.text : cfg;
          opt.value = val;
        }

        while (sel.options.length > options.length) {
          sel.removeChild(sel.firstChild);
        }

        this.update();
      },
      update: function (e) {
        if (e && e.prevValue === e.newValue) {
          return;
        }

        var cy,
          options = this.select.options,
          i,
          len;

        if (powerTools.dataOptions.curYearSelect !== '') {
          cy = powerTools.dataOptions.curYearSelect;
        } else {
          cy = powerTools.dataOptions.curyearonly;
        }

        for (i = 0, len = options.length; i < len; ++i) {
          if (options[i].value === cy) {
            options[i].selected = true;
            break;
          }
        }
      },
      onChange: function () {
        powerTools.openLoadingBar();
        powerTools.dataOptions.curYearSelect = (this.select.value);
        powerTools.reloadReport(this.select.value);
      },
      destroy: function () {
        YAHOO.util.Event.purgeElement(this.select);
        this.select.parentNode.removeChild(this.select);
        this.select = null;
      }
    };
  },
  clickSelectStudents: function (method) {
    powerTools.openLoadingBar();
    $j.each(powerTools.dataSet, function () {
      //noinspection JSUnresolvedVariable
      if (this.dcid) {
        //noinspection JSUnresolvedVariable,HtmlUnknownTarget
        $j('#StudentList').append('<li><a target="_top" href="/admin/students/home.html?frn=001' + this.dcid +
          '">' + this.student + '</a></li>');
        //noinspection JSUnresolvedVariable
        $j('#studentSelection').append('<input type="hidden" value="' + this.studentid + '"/>');
      }
    });
    powerTools.selectStudents(method);
  },
  selectStudents: function (action) {
    var curSelect = $j.unique($j('input:hidden').map(function () {
      return 'ids=' + $j(this).val();
    })).get().join('&');
    curSelect = curSelect + '&selectionAction=' + action + '&temp=false';
    $j.ajax({
      type: 'POST',
      url: '/admin/SaveSelectedStudentsToSelection.action',
      cache: false,
      data: curSelect.replace(/ids=&/gi, ''),
      success: function () {
        top.location = '/admin/home.html';
      },
      error: function () {
        $j('body').append('<div id="curSelectFail" title="Error"><p>There was an error making the students the ' +
          'current selection.</p></div >');
        //noinspection JSUnresolvedFunction
        $j('#curSelectFail').dialog();
      }
    });
  },
  selectOptions: function () {
    $j('[name=curyearonly]').val(powerTools.dataOptions.curyearonly);
  },
  reportConfig: {
    ActivitiesWithSpaces: function () {
      powerTools.reportData = {
        title: 'Activities With Spaces',
        header: 'Activities with Spaces in the Field Names',
        info: 'This report selects any activity where the field name contains a space.<p>Selecting a record will ' +
        'take you to the activity, where the space can be removed from the field name, or the activity may be ' +
        'deleted.',
        fields: ['dcid', 'activityName', 'fieldName'],
        columns: [
          {
            key: 'activityName',
            label: 'Activity Name',
            midWidth: 150,
            sortable: true,
            formatter: 'Activities'
          },
          {
            key: 'fieldName',
            label: 'Field Name',
            minWidth: 150,
            sortable: true
          }],
        template: powerTools.templateNoCY(),
        sortKey: 'activityName'
      };
    },
    BlankStoredGrades: function () {
      powerTools.reportData = {
        title: 'Blank Stored Grades',
        header: 'Students with Blank Stored Grades in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student who has a stored grade which has no letter grade, percentage is ' +
        '0, and the comment is blank.<p>' +
        'Selecting a record will take you to the students Historical Grades page, where the blank grade can be ' +
        'deleted.',
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseNumber', 'courseName', 'storeCode', {
          key: 'termID',
          parser: 'number'
        }, 'storedGradeDcid'],
        columns: [
          {
            key: 'student',
            label: 'Student',
            minWidth: 150,
            sortable: true,
            formatter: 'PreviousGrades'
          },
          {
            key: 'courseName',
            label: 'Course Name',
            minWidth: 150,
            sortable: true
          },
          {
            key: 'courseNumber',
            label: 'Course Number',
            minWidth: 50,
            sortable: true
          }, {
            key: 'storeCode',
            label: 'Store Code',
            minWidth: 50,
            sortable: true
          }, {
            key: 'termID',
            label: 'Term ID',
            minWidth: 50,
            sortable: true
          }, {
            key: 'schoolName',
            label: 'School',
            minWidth: 200,
            sortable: true
          }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1,
        wizardLink: 1
      };
    },
    CalendarIssues: function () {
      powerTools.reportData = {
        title: 'Incomplete Calendar Days',
        info: 'This report selects any calendar day record that is in-session, however either the Cycle Day is ' +
        'blank, the Bell Schedule is blank, or the Membership value is 0.<p>Selecting a record will take you to ' +
        'the calendar setup for that record. Records may be corrected by populating the data for the day, or ' +
        'removing the in-session checkbox.',
        fields: ['date', 'cycleDay', 'bellSchedule', 'membershipValue'],
        columns: [{
          key: 'date',
          label: 'Date',
          minWidth: 150,
          sortable: true,
          formatter: 'Calendar'
        }, {
          key: 'cycleDay',
          label: 'Cycle Day',
          minWidth: 100,
          sortable: true,
          formatter: 'BlankDay'
        }, {
          key: 'bellSchedule',
          label: 'Bell Schedule',
          minWidth: 150,
          sortable: true,
          formatter: 'BlankDay'
        }, {
          key: 'membershipValue',
          label: 'Membership Value',
          minWidth: 100,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'date'
      };
      if (powerTools.dataOptions.schoolid === 0) {
        powerTools.reportData.header = ('There are no calendar records at the District Office');
      } else {
        powerTools.reportData.header =
          ('In-session Calendar Day Records with No Cycle Day, Bell Schedule, or Membership in ' +
          powerTools.dataOptions.schoolname);
      }
    },
    CourseGroupsWithSpaces: function () {
      powerTools.reportData = {
        title: 'Course Groups Ending in a Space',
        header: 'Course Groups Ending in a Space',
        info: 'This report selects any course group where the name ends in a space.<p>' +
        'Selecting a record will take you to the course group, where the space can be removed from the end of ' +
        'the name, or the course group may be deleted.',
        fields: ['dcid', 'courseGroup', 'type', 'schoolName'],
        columns: [{
          key: 'courseGroup',
          label: 'Course Group',
          minWidth: 150,
          sortable: true,
          formatter: 'CourseGroups'
        }, {
          key: 'type',
          label: 'Type',
          minWidth: 150,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'courseGroup'
      };
    },
    DupAttendance: function () {
      powerTools.reportData = {
        title: 'Duplicate Attendance Records',
        header: 'Students with Duplicate Attendance Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student who has duplicate daily or meeting attendance records.<p>' +
        'Selecting a record will take you to the students Attendance page, however the bad records must be ' +
        'removed via DDA.' +
        '<p>A duplicate daily record is indicated by a student having two attendance records on the same date.' +
        '<p>' +
        'A duplicate meeting record is indicated by a student who has two records in the same section enrollment ' +
        'for the same date and the same period.',
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'attDate', {
          key: 'ccID',
          parser: 'number'
        }, {
          key: 'periodID',
          parser: 'number'
        }, 'attendanceType', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'Attendance'
        }, {
          key: 'attDate',
          label: 'Attendance Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'ccID',
          label: 'CCID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'periodID',
          label: 'Period ID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'attendanceType',
          label: 'Attendance Type',
          minWidth: 100,
          sortable: true
        }, {
          key: 'count',
          label: 'Count',
          minWidth: 50,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    DupAttendanceCode: function () {
      powerTools.reportData = {
        title: 'Duplicate Attendance Code Records',
        header: 'Duplicate Attendance Code Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays attendance code records that are duplicated. An attendance code is ' +
        'considered duplicate when there are two records with the same school id, year id and attendance code. ' +
        'It is not recommended to simply delete these records as removing the attendance codes through normal ' +
        'deletion will orphan attendance records.',
        fields: ['attendanceCode', 'yearId', 'schoolName', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'attendanceCode',
          label: 'Att. Code',
          minWidth: 50,
          sortable: true
        }, {
          key: 'yearId',
          label: 'School Year',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'schoolName',
        wizardLink: 1
      };
    },
    DupAttendanceConversion: function () {
      powerTools.reportData = {
        title: 'Duplicate Attendance Conversion Records',
        header: 'Duplicate Attendance Conversion Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays attendance conversion records that are duplicated. An attendance conversion ' +
        'is considered duplicate when there are two records with the same school id, year id, and name. It is ' +
        'not recommended to simply delete these records as removing the attendance conversions will orphan bell ' +
        'schedule settings and attendance conversion items.',
        fields: ['name', 'schoolName', 'yearId', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'name',
          label: 'Attendance Conversion',
          minWidth: 150,
          sortable: true
        }, {
          key: 'yearId',
          label: 'School Year',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'schoolName',
        wizardLink: 1
      };
    },
    DupBellSchedule: function () {
      powerTools.reportData = {
        title: 'Duplicate Bell Schedule Records',
        header: 'Duplicate Bell Schedule Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays bell schedule records that are duplicated. A bell schedule is considered ' +
        'duplicate when there are two records with the same name, the same School ID, and the same Year ID. It ' +
        'is not recommended to simply delete these records as removing the bell schedules through normal ' +
        'deletion will orphan calendar day records.',
        fields: ['name', 'schoolName', 'yearId', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'name',
          label: 'Bell Schedule',
          minWidth: 150,
          sortable: true
        }, {
          key: 'yearId',
          label: 'School Year',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'schoolName',
        wizardLink: 1
      };
    },
    DupBellScheduleItems: function () {
      powerTools.reportData = {
        title: 'Duplicate Bell Schedule Items',
        header: 'Duplicate Bell Schedule Items in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays bell schedule item records that are duplicated. A duplicate bell schedule ' +
        'item is a bell schedule containing the same period twice. These records must be removed manually as a ' +
        'period should only be used once per day.<p>' +
        'Clicking on the bell schedule name will take you to the bell schedule ' +
        'adjustment. While you may remove periods from the bell schedule for any school at any school, if you ' +
        'would like to add periods, you must do so at the school in the year in which the bell schedule exists.',
        fields: ['name', 'period', 'schoolName', 'yearId', 'bellScheduleItemDcid', 'bellScheduleItemId', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'name',
          label: 'Bell Schedule Name',
          minWidth: 150,
          sortable: true,
          formatter: 'BellScheduleItems'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'period',
          label: 'Period',
          minWidth: 50,
          sortable: true
        }, {
          key: 'yearId',
          label: 'School Year',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'name'
      };
    },
    DupCalendarDay: function () {
      powerTools.reportData = {
        title: 'Duplicate Calendar Day Records',
        header: 'Duplicate Calendar Day Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays calendar day records that are duplicated. A calendar_day record is ' +
        'considered duplicate when there are two records with the same date and school id.',
        fields: ['date', 'schoolName', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }, {
          key: 'date',
          label: 'Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'schoolName',
        wizardLink: 1
      };
    },
    DupCourseNumbers: function () {
      powerTools.reportData = {
        title: 'Duplicate Course Number Records',
        header: 'Duplicate Course Number Records',
        info: 'This report displays records in the Courses table that are duplicated.<p>' +
        'Duplicate course numbers must be either changed or removed to prevent incorrect reporting. The course ' +
        'number must be removed or changed via DDA in the courses table.',
        fields: ['courseNumber', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'courseNumber',
          label: 'Course Number',
          minWidth: 150,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 150,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'courseNumber'
      };
    },
    DupDays: function () {
      powerTools.reportData = {
        title: 'Duplicate Day Records',
        header: 'Duplicate Cycle Day Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays Cycle Day records that are duplicated. A cycle day is considered duplicate ' +
        'when there are two records with the same School ID, same Year ID, and same letter. It is not ' +
        'recommended to simply delete these records as removing the cycle days through normal deletion will ' +
        'orphan calendar day records.',
        fields: ['letter', 'schoolName', 'yearId', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'letter',
          label: 'Day',
          minWidth: 50,
          sortable: true
        }, {
          key: 'yearId',
          label: 'School Year',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'schoolName',
        wizardLink: 1
      };
    },
    DupEntryCodes: function () {
      powerTools.reportData = {
        title: 'Duplicate Entry Code Records',
        header: 'Duplicate Entry Code Records',
        info: 'This report displays Entry code records that are duplicated. An Entry code is considered ' +
        'duplicate when there are two records with the same code.',
        fields: ['entryCode', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'entryCode',
          label: 'Entry Code',
          minWidth: 150,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 150,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'entryCode',
        wizardLink: 1
      };
    },
    DupExitCodes: function () {
      powerTools.reportData = {
        title: 'Duplicate Exit Code Records',
        header: 'Duplicate Exit Code Records',
        info: 'This report displays exit code records that are duplicated. An Exit code is considered duplicate ' +
        'when there are two records with the same code.',
        fields: ['exitCode', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'exitCode',
          label: 'Exit Code',
          minWidth: 150,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 150,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'exitCode',
        wizardLink: 1
      };
    },
    DupFTE: function () {
      powerTools.reportData = {
        title: 'Duplicate FTE Records',
        header: 'Duplicate FTE Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays FTE records that are duplicated. A Full-Time Equivalency is considered ' +
        'duplicate when there are two records with the same name, the same School ID, and the same Year Id. It ' +
        'is not recommended to simply delete these records as removing the FTE\'s through normal deletion will ' +
        'orphan student and reenrollment records.',
        fields: ['name', 'schoolName', 'yearId', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'name',
          label: 'FTE Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'yearId',
          label: 'School Year',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'schoolName',
        wizardLink: 1
      };
    },
    DupGen: function () {
      powerTools.reportData = {
        title: 'Duplicate Gen Table Records',
        header: 'Duplicate Gen Table Records in All Schools',
        info: 'This report displays records in the Gen table that are duplicated. A Gen record is considered ' +
        'duplicate when there are two records with the same category, name, school id, year id, value, valueli, ' +
        'valueli2, valueli3, valueli4, valuer, valuer2, valuet, valuet2 and value.',
        fields: ['cat', 'name', 'value', 'yearid', 'schoolName', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'cat',
          label: 'Category',
          minWidth: 150,
          sortable: true
        }, {
          key: 'name',
          label: 'Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'value',
          label: 'Value',
          minWidth: 50,
          sortable: true
        }, {
          key: 'yearid',
          label: 'School Year',
          minWidth: 50,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'name',
        wizardLink: 1
      };
    },
    DuplicateTeacherNumber: function () {
      powerTools.reportData = {
        title: 'Duplicate Teachers',
        header: 'Teachers with the Same Teacher Number in Multiple Schools',
        info: 'This report selects any staff member who exists in more than one school with the same teacher ' +
        'number.<p>Selecting a teacher will take you to the staff members page.',
        fields: ['dcid', 'teacher', 'schoolName', 'teacher2dcid', 'teacher2', 'teacher2SchoolName',
          'teacher2Number'],
        columns: [{
          key: 'teacher',
          label: 'Teacher Name',
          minWidth: 150,
          sortable: true,
          formatter: 'TeacherEdit'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 100,
          sortable: true
        }, {
          key: 'teacher2',
          label: 'Teacher Name',
          minWidth: 150,
          sortable: true,
          formatter: 'TeacherEdit2'
        }, {
          key: 'teacher2SchoolName',
          label: 'School Name',
          minWidth: 100,
          sortable: true
        }, {
          key: 'teacher2Number',
          label: 'Teacher Number',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'teacher'
      };
    },
    DupPeriodEnrollment: function () {
      powerTools.reportData = {
        title: 'Duplicate Period Enrollments',
        header: 'Students with Multiple Enrollments in the Same Period in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student who is enrolled more than once in a period at any point in time.' +
        '<p>' +
        'Selecting a record will take you to the students All Enrollments page, where the duplicate period ' +
        'enrollments may be reviewed.<p>' +
        '<b>This page is highly dependent on the Section Meetings records. If you are getting incorrect results, ' +
        'please reset section meetings.</b>',
        fields: ['dcid', 'studentid', 'student', 'schoolName', {
          key: 'studentNumber',
          parser: 'number'
        }, 'dateEnrolled', 'periodNumber'],
        columns: [{
          key: 'student',
          label: 'Student Name',
          minWidth: 150,
          sortable: true,
          formatter: 'AllEnrollments'
        }, {
          key: 'studentNumber',
          label: 'Student Number',
          minWidth: 100,
          sortable: true
        }, {
          key: 'dateEnrolled',
          label: 'Date Dup Enrollment Starts',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'periodNumber',
          label: 'Expression',
          minWidth: 100,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    DupPeriodNumber: function () {
      powerTools.reportData = {
        title: 'Duplicate Period Number Records',
        header: 'Duplicate Period Number Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays period number records that are duplicated. A period is considered duplicate ' +
        'when there are two periods with the same period number, same School ID, and same Year ID.',
        fields: ['period', 'schoolName', 'yearId', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'period',
          label: 'Period Number',
          minWidth: 50,
          sortable: true
        }, {
          key: 'yearId',
          label: 'School Year',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'schoolName',
        wizardLink: 1
      };
    },
    DupPrefs: function () {
      powerTools.reportData = {
        title: 'Duplicate Preference Records',
        header: 'Duplicate Preference Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays records in the Prefs table that are duplicated. A Preference is considered ' +
        'duplicate when there are two records with the same name, school id, year id and user id.',
        fields: ['name', 'yearId', 'schoolId', {
          key: 'count',
          parser: 'number'
        }, {
          key: 'userId',
          parser: 'number'
        }],
        columns: [{
          key: 'name',
          label: 'Pref Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'schoolId',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'yearId',
          label: 'School Year',
          minWidth: 50,
          sortable: true
        }, {
          key: 'userId',
          label: 'UserId',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'name',
        wizardLink: 1
      };
    },
    DupServerConfig: function () {
      powerTools.reportData = {
        title: 'Duplicate Server Config Records',
        header: 'Duplicate Server Config Records',
        info: 'This report displays server configuration records that are duplicated. A server_config record is ' +
        'considered duplicate when there are two records with the same name and server instance id.',
        fields: [{
          key: 'serverInstanceId',
          parser: 'number'
        }, 'name', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'name',
          label: 'Name',
          minWidth: 250,
          sortable: true
        }, {
          key: 'serverInstanceId',
          label: 'Server Instance ID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'name',
        wizardLink: 1
      };
    },
    DupServerInstance: function () {
      powerTools.reportData = {
        title: 'Duplicate Server Instance Records',
        header: 'Duplicate Server Instance Records',
        info: 'This report displays server instance records that are duplicated. A server instance record is ' +
        'considered duplicate when there are two records with the same name and server instance id.',
        fields: [{
          key: 'id',
          parser: 'number'
        }, 'hostIp', 'userSuppliedName', 'serverState'],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'hostIp',
          label: 'Server IP',
          minWidth: 150,
          sortable: true
        }, {
          key: 'userSuppliedName',
          label: 'HostName',
          minWidth: 150,
          sortable: true
        }, {
          key: 'serverState',
          label: 'Server State',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };
    },
    DupStoredGrades: function () {
      powerTools.reportData = {
        title: 'Duplicate StoredGrades',
        header: 'Students with Duplicate Stored Grades in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student who has duplicate stored grades for a course and term.<p>' +
        'Selecting a record will take you to the students Historical Grades page, where the duplicate records ' +
        'can be deleted.<p>' +
        'A duplicate storedgrade record is indicated by a student having two stored grades with the same course ' +
        'number, termid, and storecode.',
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseNumber', 'courseName', 'storeCode', {
          key: 'termID',
          parser: 'number'
        }],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'PreviousGrades'
        }, {
          key: 'courseName',
          label: 'Course Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'courseNumber',
          label: 'Course Number',
          minWidth: 50,
          sortable: true
        }, {
          key: 'storeCode',
          label: 'Store Code',
          minWidth: 50,
          sortable: true
        }, {
          key: 'termID',
          label: 'Term ID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    DupStudentID: function () {
      powerTools.reportData = {
        title: 'Duplicate Student IDs',
        header: 'Duplicate Student IDs in All Schools',
        info: 'This report selects any student whose ID matches the ID of another student in the database.<p>' +
        'Selecting a student will take you to the students General Demographics page, though the records for the ' +
        'student may have trouble displaying due to this issue.<p>' +
        'If you encounter this issue, please contact PowerSchool Technical Support for assistance in cleaning up ' +
        'these records.',
        fields: ['id', 'dcid', 'student1', 'student2dcid', 'student2'],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'student1',
          label: 'Student 1',
          minWidth: 150,
          sortable: true,
          formatter: 'Demographics'
        }, {
          key: 'student2',
          label: 'Student 2',
          minWidth: 150,
          sortable: true,
          formatter: 'Demographics2'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student1'
      };
    },
    DupStudentNumber: function () {
      powerTools.reportData = {
        title: 'Duplicate Student Numbers',
        header: 'Duplicate Student Numbers in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student who has a student number which is also assigned to another ' +
        'student.<p>' +
        'Selecting a record will take you to the students General Demographics page, where the student number ' +
        'can be changed.<p><b>Note: </b>This report may identify students enrolled twice in the same ' +
        'district.',
        fields: ['studentNumber', 'dcid', 'student', 'schoolName', 'student2dcid', 'student2', 'school2Name'],
        columns: [{
          key: 'studentNumber',
          label: 'Student Number',
          minWidth: 150,
          sortable: true
        }, {
          key: 'student',
          label: 'Student 1',
          minWidth: 150,
          sortable: true,
          formatter: 'Demographics'
        }, {
          key: 'schoolName',
          label: 'Student 1 School Name',
          minWidth: 200,
          sortable: true
        }, {
          key: 'student2',
          label: 'Student 2',
          minWidth: 50,
          sortable: true,
          formatter: 'Demographics2'
        }, {
          key: 'school2Name',
          label: 'Student 2 School Name',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'studentNumber'
      };
    },
    DupTeacherNumber: function () {
      powerTools.reportData = {
        title: 'Duplicate Teacher Numbers',
        header: 'Duplicate Teacher Numbers in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any teacher who has a teacher number which is also assigned to another ' +
        'teacher.<p>' +
        'Selecting a record will take you to the teachers record, where the teacher number can be changed on the ' +
        'Edit Information section.<p>' +
        '<b>Note: </b>This report may identify teachers entered twice in the same district.',
        fields: ['teacherNumber', 'dcid', 'teacher', 'schoolName', 'teacher2dcid', 'teacher2', 'school2Name'],
        columns: [{
          key: 'teacherNumber',
          label: 'Teacher Number',
          minWidth: 150,
          sortable: true
        }, {
          key: 'teacher',
          label: 'Teacher 1',
          minWidth: 150,
          sortable: true,
          formatter: 'TeacherEdit'
        }, {
          key: 'schoolName',
          label: 'Teacher 1 School Name',
          minWidth: 200,
          sortable: true
        }, {
          key: 'teacher2',
          label: 'Teacher 2',
          minWidth: 50,
          sortable: true,
          formatter: 'TeacherEdit2'
        }, {
          key: 'school2Name',
          label: 'Teacher 2 School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'teacherNumber'
      };
    },
    DupTermBins: function () {
      powerTools.reportData = {
        title: 'Duplicate Final Grade Setup Records',
        header: 'Duplicate Final Grade Setup Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays Final Grade Setup (Termbins) records that are duplicated. A Final Grade ' +
        'Setup is considered duplicate when there are two records with the same SchoolID, the same TermID, and ' +
        'the same StoreCode.',
        fields: ['storeCode', 'termId', 'schoolYear', 'schoolName', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }, {
          key: 'schoolYear',
          label: 'School Year',
          minWidth: 75,
          sortable: true
        }, {
          key: 'termId',
          label: 'Term',
          minWidth: 75,
          sortable: true
        }, {
          key: 'storeCode',
          label: 'Store Code',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'schoolName',
        wizardLink: 1
      };
    },
    DupTerms: function () {
      powerTools.reportData = {
        title: 'Duplicate Term Records',
        header: 'Duplicate Term Records in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays term records that are duplicated. A term is considered duplicate when there ' +
        'are two records with the same SchoolID, and same Term ID.',
        fields: ['termId', 'schoolName', 'yearId', {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'yearId',
          label: 'School Year',
          minWidth: 75,
          sortable: true
        }, {
          key: 'termId',
          label: 'Term ID',
          minWidth: 75,
          sortable: true
        }, {
          key: 'count',
          label: 'Count of Records',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'schoolName',
        showSelectButtons: 1,
        wizardLink: 1
      };
    },
    EnrollmentReport: function () {
      powerTools.reportData = {
        title: 'Enrollment Report',
        header: 'Enrollment Report',
        info: 'This report will perform a listing of the count of records for each enrollment item PowerTools ' +
        'diagnoses.<br>Items with an asterisk (*) can report data for the current term only.<p>' +
        'Due to the complexity of this report, this page may take some time to complete loading.',
        fields: ['report', 'reportName'],
        columns: [{
          key: 'report',
          label: 'Report',
          minWidth: 150,
          sortable: false,
          formatter: 'OverviewLink'
        }, {
          key: 'reportName',
          label: 'Count of Records',
          minWidth: 150,
          sortable: false,
          formatter: 'OverviewCount'
        }],
        template: powerTools.templateCYOnly()
      };
    },
    FutureActiveSchool: function () {
      powerTools.reportData = {
        title: 'Invalid Future Active Enrollments',
        header: 'Students with Active Enrollments for Future Dates in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects all students whose enrollments are active, but have future enrollment dates ' +
        'which do not start on the first day of a year long term.<p>' +
        'Selecting a record will take you to the students Transfer Info page, where the enrollment dates can be ' +
        'corrected if necessary. If the student should be preregistered, the record must be corrected by editing ' +
        'the enroll_status field using either DDA or Student Field Value.',
        fields: ['dcid', 'studentid', 'student', 'schoolName', {
          key: 'gradeLevel',
          parser: 'number'
        }, 'enrollStatus', 'entryDate', 'exitDate'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'TransferInfo'
        }, {
          key: 'gradeLevel',
          label: 'Grade Level',
          minWidth: 50,
          sortable: true
        }, {
          key: 'enrollStatus',
          label: 'Enrollment Status',
          minWidth: 50,
          sortable: true
        }, {
          key: 'entryDate',
          label: 'Entry Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'exitDate',
          label: 'Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    GradeScaleDupCutoff: function () {
      powerTools.reportData = {
        title: 'Grade Scales with Duplicate Cutoff Percentages',
        header: 'Grade Scales with Duplicate Cutoff Percentages',
        info: 'This report selects any grade scale which contains more than one item with the same cutoff ' +
        'percentage.' +
        '<p>' +
        'Selecting a record will take you to the grade scale, where the cutoff percentages may be corrected, or ' +
        'the duplicate item may be removed.',
        fields: ['dcid', 'name', {
          key: 'cutoff',
          parser: 'number'
        }, {
          key: 'count',
          parser: 'number'
        }],
        columns: [{
          key: 'name',
          label: 'Grade Scale Name',
          minWidth: 150,
          sortable: true,
          formatter: 'GradeScales'
        }, {
          key: 'cutoff',
          label: 'Cutoff Percent',
          minWidth: 50,
          sortable: true
        }, {
          key: 'count',
          label: 'Count',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'name'
      };
    },
    IncompleteSched: function () {
      powerTools.reportData = {
        title: 'Students with Incomplete Scheduling Setup',
        header: 'Students with Incomplete Scheduling Setup in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student who is set to be Schedule Next year, however the Next School, ' +
        'Next Year Grade, or Year of Graduation is not set.<p>Selecting a record will take you to the students ' +
        'Scheduling Setup page, where the scheduling setup may be corrected by either populating the data, or by ' +
        'unchecking the "Schedule this Student" checkbox.',
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'schoolId', 'nextSchoolName', 'nextSchoolID', {
          key: 'nextYearGrade',
          parser: 'number'
        }, 'lowGrade', 'highGrade', 'yearOfGraduation'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'ScheduleSetup'
        }, {
          key: 'nextSchoolName',
          label: 'Next School',
          minWidth: 200,
          sortable: true,
          formatter: 'NextSchool'
        }, {
          key: 'nextYearGrade',
          label: 'Next Year Grade',
          minWidth: 50,
          sortable: true,
          formatter: 'NextGrade'
        }, {
          key: 'yearOfGraduation',
          label: 'Year of Graduation',
          minWidth: 50,
          sortable: true,
          formatter: 'GradYear'
        }, {
          key: 'schoolName',
          label: 'Current School',
          minWidth: 200,
          sortable: true,
          formatter: 'SchoolExistNoDistrict'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    IncompleteTransfers: function () {
      powerTools.reportData = {
        title: 'Incomplete Student Transfers',
        header: 'Students with Incomplete Student Transfers in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays any student who has been transferred out of school, transferred to another ' +
        'school, but has not been enrolled in the new school. This type of incomplete transfer has been known to ' +
        'cause various issues with attendance reporting.<p>' +
        'Selecting a record will take you to the students Transfer Info page. The record must be corrected by ' +
        'enrolling the student back in school, or by modifying the schoolid to match the enrollment school id of ' +
        'the record.',
        fields: ['dcid', 'studentid', 'student', {
          key: 'gradeLevel',
          parser: 'number'
        }, 'schoolName', 'enrollmentSchoolName', 'exitDate'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'TransferInfo'
        }, {
          key: 'gradeLevel',
          label: 'Grade Level',
          minWidth: 50,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }, {
          key: 'enrollmentSchoolName',
          label: 'Enrollment School Name',
          minWidth: 200,
          sortable: true
        }, {
          key: 'exitDate',
          label: 'Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    IncorrectLunchBal: function () {
      //noinspection HtmlUnknownTarget
      powerTools.reportData = {
        title: 'Incorrect Lunch Balances',
        header: 'Students with Incorrect Lunch Balances in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student who has a lunch balance which does not match the starting balance ' +
        'plus the net effect of all lunch transactions. The "Running Balance" plus the "Starting Balance" should ' +
        'match the "Current Balance."<p>' +
        'Selecting a record will take you to the students Lunch Transactions page. The data can easily be ' +
        'corrected for all students by running the special operation called "Recalculate Lunch Balances" from ' +
        'the <a href="/admin/tech/specop.html">Special Operations</a> page.',
        fields: ['dcid', 'student', 'schoolName', 'startingBalance', 'runningBalance', 'currentBalance'],
        columns: [
          {
            key: 'student',
            label: 'Student',
            minWidth: 150,
            sortable: true,
            formatter: 'Transactions'
          },
          {
            key: 'startingBalance',
            label: 'Starting Balance',
            minWidth: 100,
            sortable: true,
            formatter: 'currency'
          }, {
            key: 'runningBalance',
            label: 'Running Balance',
            minWidth: 100,
            sortable: true,
            formatter: 'currency'
          }, {
            key: 'currentBalance',
            label: 'Current Balance',
            minWidth: 100,
            sortable: true,
            formatter: 'currency'
          }, {
            key: 'schoolName',
            label: 'School Name',
            minWidth: 200,
            sortable: true
          }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    IncorrectStoredGrades: function () {
      powerTools.reportData = {
        title: 'Incorrect Stored Grades',
        header: 'Students with Incorrect Stored Grades in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student who has a grade where the letter grade or the GPA points does ' +
        'not match what is expected, based off the grade scale used when storing the grades.<p>' +
        'Items in red indicate a mismatch between the Historical Grade record, and the Grade Scale calculation.' +
        '<p>' +
        'The GPA points are determined by the letter grade of the Stored Grade record compared to the GPA Points ' +
        'of the letter grade in the gradescale. The GPA points are determined by the percentage of the Stored ' +
        'Grade record compared to the cutoff percentage of the grade scale.<p>' +
        'Selecting a record will take you to the students Historical Grades page, where the blank grade can be ' +
        'deleted.',
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseName', 'courseNumber', 'storeCode', 'termID',
          {
            key: 'percent',
            parser: 'number'
          }, 'grade', 'gradescaleGrade', {
            key: 'gpaPoints',
            parser: 'number'
          }, {
            key: 'gradePoints',
            parser: 'number'
          }],
        columns: [
          {
            key: 'student',
            label: 'Student',
            minWidth: 50,
            sortable: true,
            formatter: 'PreviousGrades'
          }, {
            key: 'courseName',
            label: 'Course Name',
            minWidth: 50,
            sortable: true
          }, {
            key: 'courseNumber',
            label: 'Course Number',
            minWidth: 50,
            sortable: true
          }, {
            key: 'storeCode',
            label: 'Store Code',
            minWidth: 50,
            sortable: true
          }, {
            key: 'termID',
            label: 'Term ID',
            minWidth: 50,
            sortable: true
          }, {
            key: 'percent',
            label: 'Percent',
            minWidth: 50,
            sortable: true
          }, {
            key: 'grade',
            label: 'Grade / Expected',
            minWidth: 50,
            sortable: true,
            formatter: 'InvalidLGrade'
          }, {
            key: 'gpaPoints',
            label: 'GPA Points / Expected',
            minWidth: 50,
            sortable: true,
            formatter: 'InvalidGPA'
          },
          {
            key: 'schoolName',
            label: 'School',
            minWidth: 150,
            sortable: true
          }
        ],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    IncorrectStudYear: function () {
      //noinspection HtmlUnknownTarget
      powerTools.reportData = {
        title: 'Incorrect Studyear Field',
        header: 'Students with CC Records Having Incorrect Studyear Values in ' +
        powerTools.reportOptions.schoolName,
        info: 'This report selects any cc record where the Studyear field is incorrect. A valid studyear field ' +
        'is the Student ID plus the Year ID of the CC record.<p>' +
        'Selecting a record will take you to all enrollments page to verify the enrollment is valid. To correct ' +
        'these records, proceed to the <a href="/admin/tech/executecommand.html" target="_blank">Execute Command ' +
        'Page</a> and run the command **fixstudyear',
        fields: ['dcid', 'student', 'courseSection', 'reason', {
          key: 'studentid',
          parser: 'number'
        }, {
          key: 'yearId',
          parser: 'number'
        }, {
          key: 'studYear',
          parser: 'number'
        }],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 100,
          sortable: true,
          formatter: 'AllEnrollments'
        }, {
          key: 'courseSection',
          label: 'Course.Section',
          minWidth: 100,
          sortable: true
        }, {
          key: 'reason',
          label: 'Incorrect Value',
          minWidth: 100,
          sortable: true
        }, {
          key: 'studentid',
          label: 'StudentID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'yearId',
          label: 'YearID',
          minWidth: 30,
          sortable: true
        }, {
          key: 'studYear',
          label: 'StudYear',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    InvalidCC: function () {
      powerTools.reportData = {
        title: 'Invalid Section Enrollments',
        header: 'Students with Reverse Section Enrollments in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any class enrollment which has an exit date prior to the entry date of the ' +
        'class enrollment. Selecting a student will take you to the students All Enrollments page, where the ' +
        'data can be corrected.<p>Enrollments must be corrected by manually changing either the date enrolled ' +
        'or date left of the invalid enrollment.' +
        '<p>A no-show enrollment should be indicated by the exit date matching the entry date of the enrollment.',
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseName', 'courseNumber', 'sectionNumber',
          'dateEnrolled', 'dateLeft'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'AllEnrollments'
        }, {
          key: 'courseName',
          label: 'Course Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'courseNumber',
          label: 'Course.Section',
          minWidth: 100,
          sortable: true,
          formatter: 'CourseSection'
        }, {
          key: 'dateEnrolled',
          label: 'Date Enrolled',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'dateLeft',
          label: 'Date Left',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    InvalidLunch: function () {
      powerTools.reportData = {
        title: 'Invalid Lunch Transactions',
        header: 'Students with Invalid Lunch Transactions in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student with a lunch transaction type that has been identified to be ' +
        'invalid.<p>' +
        'Selecting a record will take you to the students lunch transactions page. The records must be removed ' +
        'or corrected by DDA.',
        fields: ['dcid', 'student', 'schoolName', 'date', 'transType', 'currentBal'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'TransferInfo'
        }, {
          key: 'date',
          label: 'Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'transType',
          label: 'Transtype',
          minWidth: 100,
          sortable: true
        }, {
          key: 'currentBal',
          label: 'Current Balance',
          minWidth: 100,
          sortable: true,
          formatter: 'currency'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    InvalidSchool: function () {
      powerTools.reportData = {
        title: 'Reverse School Enrollments',
        header: 'Students with Reverse School Enrollments in ' + powerTools.reportOptions.schoolName,
        info: 'This report identifies all students who have a school enrollment with an exit date prior to the ' +
        'enrollment date.<p>' +
        'Selecting a student will take you to the Transfer Info page, where the records can be corrected. These ' +
        'enrollments can either be corrected by removing the invalid enrollments or by changing the enrollment ' +
        'dates so they are not reversed.<p>' +
        'A no-show enrollment should be indicated by the exit date matching the entry date of the enrollment.',
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'gradeLevel', 'entryDate', 'exitDate'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'TransferInfo'
        }, {
          key: 'gradeLevel',
          label: 'Grade Level',
          minWidth: 50,
          sortable: true
        }, {
          key: 'entryDate',
          label: 'Entry Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'exitDate',
          label: 'Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    InvalidSpEnrollments: function () {
      powerTools.reportData = {
        title: 'Reverse Special Program Enrollments',
        header: 'Students with Reverse Special Program Enrollments in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student who has a Special Program enrollment with the exit date prior to ' +
        'the entry date.<p>Selecting a record will take you to the students Special Programs page, where the ' +
        'enrollment may be corrected.' +
        '<p><b>Many states allow an exit date of 0/0/0 as an acceptable Special Program exit date. Please check ' +
        'with your states documentation or DOE for clarification.</b>',
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'programName', 'entryDate', 'exitDate'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'SpecialPrograms'
        }, {
          key: 'programName',
          label: 'Special Program Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'entryDate',
          label: 'Entry Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'exitDate',
          label: 'Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minwidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    InvalidTrack: function () {
      powerTools.reportData = {
        title: 'Students with Invalid Tracks',
        header: 'Students with Invalid Tracks in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any students whose Track field is populated with something other than ' +
        'A,B,C,D,E, or F.' +
        '<p>Selecting a record will take you to the students Transfer Info page, where the invalid enrollments ' +
        'track may be corrected by selecting the Entry Date, then modifying the Track to be either blank or the ' +
        'students actual school track.',
        fields: ['dcid', 'studentid', 'student', 'schoolName', {
          key: 'gradeLevel',
          parser: 'number'
        }, 'entryDate', 'exitDate', 'track'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'TransferInfo'
        }, {
          key: 'gradeLevel',
          label: 'Grade Level',
          minWidth: 50,
          sortable: true
        }, {
          key: 'entryDate',
          label: 'Entry Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'exitDate',
          label: 'Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'track',
          label: 'Track',
          minWidth: 50,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    InvCourseNumberCC: function () {
      powerTools.reportData = {
        title: 'CC Record Course Number issues',
        header: 'Invalid Course Number in the CC Table in ' + powerTools.reportOptions.schoolName,
        info: 'This report displays any CC record where the course number exists in the courses table, but has a ' +
        'different case sensitivity. This issue is documented in ' +
        '<a href="https://support.powerschool.com/d/55894" target="PowerSource">PowerSource article ' +
        '55894</a>.',
        fields: ['student', {
          key: 'sectionId',
          parser: 'number'
        }, 'schoolName', {
          key: 'termId',
          parser: 'number'
        }, 'ccCourseNumber', 'ccSectionNumber', 'districtCourseNumber'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true
        }, {
          key: 'sectionId',
          label: 'SectionID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'termId',
          label: 'TermID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'ccCourseNumber',
          label: 'Sections Course #',
          minWidth: 50,
          sortable: true
        }, {
          key: 'ccSectionNumber',
          label: 'Section #',
          minWidth: 50,
          sortable: true
        }, {
          key: 'districtCourseNumber',
          label: 'Courses Course #',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        wizardLink: 1
      };
    },
    MaintReport: function () {
      powerTools.reportData = {
        title: 'Maintenance Report',
        header: 'Maintenance Report',
        info: 'This report will perform a listing of the count records for each system setup item PowerTools ' +
        'diagnoses.' +
        '<br>Due to the complexity of this report, this page may take some time to complete loading.',
        fields: ['report', 'reportName'],
        columns: [{
          key: 'report',
          label: 'Report',
          minWidth: 150,
          sortable: false,
          formatter: 'OverviewLink'
        }, {
          key: 'reportName',
          label: 'Count of Records',
          minWidth: 150,
          sortable: false,
          formatter: 'OverviewCount'
        }],
        template: powerTools.templateNoOption()
      };
    },
    MiscReport: function () {
      powerTools.reportData = {
        title: 'Miscellaneous Report',
        header: 'Miscellaneous Report',
        info: 'This report will perform a listing of the count of records for each miscellaneous item PowerTools ' +
        'diagnoses.<br>Items with an asterisk (*) can report data for the current term only.<p>' +
        'Due to the complexity of this report, this page may take some time to complete loading.',
        fields: ['report', 'reportName'],
        columns: [{
          key: 'report',
          label: 'Report',
          minWidth: 150,
          sortable: false,
          formatter: 'OverviewLink'
        }, {
          key: 'reportName',
          label: 'Count of Records',
          minWidth: 150,
          sortable: false,
          formatter: 'OverviewCount'
        }],
        template: powerTools.templateCYOnly()
      };
    },
    MissingFTEStudent: function () {
      powerTools.reportData = {
        title: 'Missing Full Time Equivalencies',
        header: 'Students with Missing Full Time Equivalencies in ' + powerTools.reportOptions.schoolName,
        info: 'This report selects any student who has a Full Time Equivalency that is either blank, or does not ' +
        'belong to the school the student is enrolled in.<p>Selecting a record will take you to the students ' +
        'Transfer Info page, where the FTE may be corrected.',
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'entryDate', 'exitDate'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'TransferInfo'
        }, {
          key: 'entryDate',
          label: 'Entry Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'exitDate',
          label: 'Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    MissingRace: function () {
      powerTools.reportData = {
        title: 'Students Missing Ethnicity or Race',
        header: 'Students with Blank Ethnicities or Missing Student Race Records in ' +
        powerTools.reportOptions.schoolName,
        fields: ['dcid', 'studentid', 'student', 'ethnicity', 'race', 'fedEthnicity', 'schoolName'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'Demographics'
        }, {
          key: 'ethnicity',
          label: 'Scheduling Ethnicity',
          minWidth: 50,
          sortable: true,
          formatter: 'NotSpecified'
        }, {
          key: 'race',
          label: 'Federal Race',
          minWidth: 50,
          sortable: true,
          formatter: 'NotSpecified'
        }, {
          key: 'fedEthnicity',
          label: 'Hispanic/Latino',
          minWidth: 50,
          sortable: true,
          formatter: 'NotSpecified'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };

      if (powerTools.dataOptions.hispaniconly !== 1) {
        powerTools.reportData.info =
          'This report selects any student who has a blank ethnicity, does not have hispanic or latino ' +
          'declared, or has no Federal Race records.';
      } else {
        powerTools.reportData.info =
          'This report selects any student who has a blank ethnicity, or does not have hispanic or latino ' +
          'declared and has no Federal Race records.';
      }
    },
    NonInSessionAttendance: function () {
      var accessType;
      if (powerTools.dataOptions.ddaRedirect === 'on') {
        accessType = 'Access';
      } else {
        accessType = 'Export';
      }
      powerTools.reportData = {
        title: 'Non-Session Attendance',
        header: 'Students with Attendance on Non-Session Days in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any student who has an attendance record that is on a day not in session on ' +
        'the calendar, or any meeting attendance record that the section is not in session either by the cycle ' +
        'day or bell schedule. It is also possible the the attendance record belongs to a section that no ' +
        'longer exists. ' +
        'This report also selects any student who has an attendance record when the student is either not in ' +
        'school, or not in that section on the date the attendance record exists.<p>Selecting a student will ' +
        'take you to the students Attendance page, though the attendance records may need to be corrected using ' +
        'DDA. Selecting an Attendance ID will take you to the record in Direct Database ' + accessType +
        '.<p>A non in-session day is indicated by the Calendar not having the In-Session ' +
        'checkbox checked.<p>This report is dependant on the Section Meetings table. If you are experiencing ' +
        'incorrect data, please reset section meetings.'),
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'attendanceDcid', {
          key: 'attendanceID',
          parser: 'number'
        }, 'attendanceDate', 'attendanceType', {
          key: 'ccID',
          parser: 'number'
        }, {
          key: 'periodID',
          parser: 'number'
        }, 'attendanceCode', 'errormsg'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'Attendance'
        }, {
          key: 'attendanceID',
          label: 'Attendance ID',
          minWidth: 100,
          sortable: true,
          formatter: 'DDAAttendance'
        }, {
          key: 'attendanceDate',
          label: 'Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'attendanceType',
          label: 'Attendance Type',
          minWidth: 100,
          sortable: true
        }, {
          key: 'ccID',
          label: 'CCID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'periodID',
          label: 'Period ID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'attendanceCode',
          label: 'Att. Code',
          minWidth: 30,
          sortable: true
        }, {
          key: 'errormsg',
          label: 'Error',
          minWidth: 150,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1,
        wizardLink: 1
      };
    },
    OrphanedAttendance: function () {
      powerTools.reportData = {
        title: 'Orphaned Attendance Records',
        header: 'Orphaned Attendance Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any Attendance Record where the student, attendance code, CC record, ' +
        'section, course, ' + powerTools.reportOptions.schoolType +
        'or period number does not exist, based off the options selected.<p>Selecting a record will take you ' +
        'to the record in Direct Database ' + powerTools.reportOptions.ddaAccess + '.'),
        fields: ['attendanceDcid', {
          key: 'attendanceId',
          parser: 'number'
        }, 'student', 'studentId', 'attendanceCode', 'attendanceCodeId', 'attendanceRecordCodeId', 'courseSection',
          'courseSectionSort', 'period', 'periodId', 'schoolName', 'schoolNumber'],
        columns: [{
          key: 'attendanceId',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDAAttendance'
        }, {
          key: 'student',
          label: 'Student',
          minWidth: 50,
          sortable: true,
          formatter: 'StudentExist'
        }, {
          key: 'attendanceCode',
          label: 'AttCode',
          minWidth: 50,
          sortable: true,
          formatter: 'AttCodeExist'
        }, {
          key: 'courseSection',
          label: 'Course.Section',
          minWidth: 100,
          sortable: true,
          formatter: 'DoesNotExist',
          sortOptions: {field: 'CourseSectionSort'}
        }, {
          key: 'period',
          label: 'Period',
          minWidth: 50,
          sortable: true,
          formatter: 'PeriodExist'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true,
          formatter: 'SchoolExist'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'attendanceId',
        wizardLink: 1
      };
    },
    OrphanedAttendanceTime: function () {
      powerTools.reportData = {
        title: 'Orphaned Attendance_Time Records',
        header: 'Orphaned Attendance_Time Records in All Schools',
        info: ('This report selects any Attendance_Time Record where the attendance record not exist.<p>' +
        'Selecting a record will take you to the record in Direct Database ' + powerTools.reportOptions.ddaAccess +
        '.'),
        fields: ['dcid', {
          key: 'id',
          parser: 'number'
        }, {
          key: 'attendanceId',
          parser: 'number'
        }],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDAAttendanceTime'
        }, {
          key: 'attendanceId',
          label: 'Attendance ID',
          minWidth: 50,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };

    },
    OrphanedCC: function () {
      powerTools.reportData = {
        title: 'Orphaned CC Records',
        header: 'Orphaned CC Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any CC Record where the student, section, course, ' +
        powerTools.reportOptions.schoolType +
        ' or term does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
        powerTools.reportOptions.ddaAccess + '.'),
        fields: ['dcid', {
          key: 'ccid',
          parser: 'number'
        }, 'student', 'studentId', 'courseSection', 'courseSectionSort', 'schoolName', 'schoolId', {
          key: 'termId',
          parser: 'number'
        }, 'ccTermId'],
        columns: [{
          key: 'ccid',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDACC'
        }, {
          key: 'student',
          label: 'Student',
          minWidth: 200,
          sortable: true,
          formatter: 'StudentExist'
        }, {
          key: 'courseSection',
          label: 'Course.Section',
          minWidth: 50,
          sortable: true,
          formatter: 'DoesNotExist',
          sortOptions: {field: 'Course_SectionSort'}
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true,
          formatter: 'SchoolExist'
        }, {
          key: 'termId',
          label: 'TermID',
          minWidth: 50,
          sortable: true,
          formatter: 'CCTermExist'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'ccid',
        wizardLink: 1
      };
    },
    OrphanedFeeTransaction: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = ', school,';
      } else {
        schoolOption = '';
      }
      powerTools.reportData = {
        title: 'Orphaned Fee_Transaction Records',
        header: 'Orphaned Fee_Transaction Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any Fee_Transaction Record where the student' + schoolOption +
        ' or fee does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
        powerTools.reportOptions.ddaAccess + '.'),
        fields: ['dcid', {
          key: 'feeTransactionId',
          parser: 'number'
        }, 'student', 'studentid', 'feeName', 'feeId', 'schoolName', 'schoolId'],
        columns: [{
          key: 'feeTransactionId',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDAFeeTransaction'
        }, {
          key: 'student',
          label: 'Student',
          minWidth: 50,
          sortable: true,
          formatter: 'StudentExist'
        }, {
          key: 'feeName',
          label: 'Fee Name',
          minWidth: 100,
          sortable: true,
          formatter: 'FeeExist'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true,
          formatter: 'SchoolExist'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'feeTransactionId',
        wizardLink: 1
      };
    },
    OrphanedHonorRoll: function () {
      if (powerTools.dataOptions.schoolid === 0) {
        powerTools.reportOptions.schoolType = 'or school ';
      } else {
        powerTools.reportOptions.schoolType = '';
      }
      powerTools.reportData = {
        title: 'Orphaned Honor Roll Records',
        header: 'Orphaned HonorRoll Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any HonorRoll Record where the student ' + powerTools.reportOptions.schoolType +
        'does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
        powerTools.reportOptions.ddaAccess + '.'),
        fields: ['dcid', {
          key: 'honorRollId',
          parser: 'number'
        }, 'student', 'studentid', 'schoolName', 'schoolId'],
        columns: [{
          key: 'honorRollId',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDAHonorRoll'
        }, {
          key: 'student',
          label: 'Student',
          minWidth: 50,
          sortable: true,
          formatter: 'StudentExist'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          formatter: 'SchoolExistNoDistrict'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'honorRollId',
        wizardLink: 1
      };
    },
    OrphanedPGFinalGrades: function () {
      powerTools.reportData = {
        title: 'Orphaned PGFinalGrades Records',
        header: 'Orphaned PGFinalGrades Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any PGFinalGrades Record where the student, section, or course number does ' +
        'not exist.<p>Selecting a record will take you to the record in Direct Database ' +
        powerTools.reportOptions.ddaAccess + '.'),
        fields: ['dcid', 'id', 'student', 'studentId', 'courseSection', 'courseSectionSort'],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDAPGFinalGrades'
        }, {
          key: 'student',
          label: 'Student',
          minWidth: 50,
          sortable: true,
          formatter: 'StudentExist'
        }, {
          key: 'courseSection',
          label: 'Course.Section',
          minWidth: 100,
          sortable: true,
          formatter: 'DoesNotExist',
          sortOptions: {field: 'courseSectionSort'}
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };
    },
    OrphanedReenrollments: function () {
      if (powerTools.dataOptions.schoolid === 0) {
        powerTools.reportOptions.schoolType = 'or school ';
      } else {
        powerTools.reportOptions.schoolType = '';
      }
      powerTools.reportData = {
        title: 'Orphaned Reenrollment Records',
        header: 'Orphaned Reenrollment Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any Reenrollment Record where the student ' +
        powerTools.reportOptions.schoolType + 'does not exist, or if the grade ' +
        'level is not within the grade levels of the school.<p>Selecting a record will take you to the record in ' +
        'Direct Database ' + powerTools.reportOptions.ddaAccess + '.'),
        fields: ['dcid', 'id', 'student', 'studentId', 'schoolName', 'schoolId', {
          key: 'gradeLevel',
          parser: 'number'
        }, 'schoolHighGrade', 'schoolLowGrade'],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDAReenrollments'
        }, {
          key: 'student',
          label: 'Student',
          minWidth: 50,
          sortable: true,
          formatter: 'StudentExist'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true,
          formatter: 'SchoolExist'
        }, {
          key: 'gradeLevel',
          label: 'Grade Level',
          minWidth: 50,
          sortable: true,
          formatter: 'GradeLevelValid'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };
    },
    OrphanedSection: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = ' school, ';
      } else {
        schoolOption = '';
      }
      powerTools.reportData = {
        title: 'Orphaned Section Records',
        header: 'Orphaned Section Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any Section Record where the course, teacher, ' + schoolOption +
        ' or term does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
        powerTools.reportOptions.ddaAccess + '.'),
        fields: ['dcid', 'id', 'courseSection', 'courseSectionSort', 'teacher', 'teacherId', 'schoolName',
          'schoolId',
          'schoolTermId', {
            key: 'sectionTermId',
            parser: 'number'
          }],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDASection'
        }, {
          key: 'courseSection',
          label: 'Course.Section',
          minWidth: 50,
          sortable: true,
          formatter: 'DoesNotExist',
          sortOptions: {field: 'courseSectionSort'}
        }, {
          key: 'teacher',
          label: 'Teacher',
          minWidth: 200,
          sortable: true,
          formatter: 'TeacherExist'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true,
          formatter: 'SchoolExist'
        }, {
          key: 'sectionTermId',
          label: 'TermID',
          minWidth: 50,
          sortable: true,
          formatter: 'SectionTermExist'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };
    },
    OrphanedSchoolCourse: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = ' or school';
      } else {
        schoolOption = '';
      }
      powerTools.reportData = {
        title: 'Orphaned School_Course Records',
        header: 'Orphaned School_Course Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any School_Course Record where the course' + schoolOption +
        ' does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
        powerTools.reportOptions.ddaAccess + '.'),
        fields: ['dcid', 'id', 'courseId', 'schoolNumber', 'schoolName', 'courseName'],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDASchoolCourse'
        }, {
          key: 'courseId',
          label: 'Course ID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true,
          formatter: 'SchoolExistNoGradStudents'
        }, {
          key: 'courseName',
          label: 'Course Name',
          minWidth: 200,
          sortable: true,
          formatter: 'DoesNotExist'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };
    },
    OrphanedSpEnrollments: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = ', school,';
      } else {
        schoolOption = '';
      }
      powerTools.reportData = {
        title: 'Orphaned Special Program Records',
        header: 'Orphaned Special Program Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any Special Program Enrollment where the student' + schoolOption +
        ' or program does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
        powerTools.reportOptions.ddaAccess + '.'),
        fields: ['dcid', 'id', 'student', 'studentId', 'programName', 'programId', 'schoolName', 'schoolId'],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDASpEnrollments'
        }, {
          key: 'student',
          label: 'Student',
          minWidth: 100,
          sortable: true,
          formatter: 'StudentExist'
        }, {
          key: 'programName',
          label: 'Program',
          minWidth: 100,
          sortable: true,
          formatter: 'ProgramExist'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true,
          formatter: 'SchoolExist'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };
    },
    OrphanedStoredGrades: function () {
      powerTools.reportData = {
        title: 'Orphaned StoredGrades Records',
        header: 'Orphaned StoredGrades Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any StoredGrades Record where the' +
        'student, linked course, or linked section does not exist.<p>' +
        'Selecting a record will take you to the record in Direct Database ' + powerTools.reportOptions.ddaAccess +
        '.'),
        fields: ['dcid', 'student', 'studentId', 'courseSection', 'courseSectionSort', 'courseName', {
          key: 'termId',
          parser: 'number'
        }, 'schoolName'],
        columns: [{
          key: 'dcid',
          label: 'DCID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDAStoredGrades'
        }, {
          key: 'student',
          label: 'Student',
          minWidth: 50,
          sortable: true,
          formatter: 'StudentExist'
        }, {
          key: 'courseSection',
          label: 'Course.Section',
          minWidth: 150,
          sortable: true,
          formatter: 'DoesNotExist',
          sortOptions: {field: 'courseSectionSort'}
        }, {
          key: 'courseName',
          label: 'Course Name',
          minWidth: 200,
          sortable: true
        }, {
          key: 'termId',
          label: 'TermID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'dcid',
        wizardLink: 1
      };
    },
    OrphanedStudentRace: function () {
      powerTools.reportData = {
        title: 'Orphaned StudentRace Records',
        header: 'Orphaned StudentRace Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any StudentRace Record where the student or race code does not exist.<p>' +
        'Selecting a record will take you to the record in Direct Database ' + powerTools.reportOptions.ddaAccess +
        '~'),
        fields: ['dcid', {
          key: 'id',
          parser: 'number'
        }, 'student', 'studentid', 'raceCode', 'raceCodeId'],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDAStudentRace'
        }, {
          key: 'student',
          label: 'Student',
          minWidth: 200,
          sortable: true,
          formatter: 'StudentExist'
        }, {
          key: 'raceCode',
          label: 'Race Code',
          minWidth: 100,
          sortable: true,
          formatter: 'RaceCodeExist'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };
    },
    OrphanedStudents: function () {
      if (powerTools.dataOptions.schoolid === 0) {
        powerTools.reportOptions.schoolType = 'school does not exist, or the ';
      } else {
        powerTools.reportOptions.schoolType = '';
      }

      powerTools.reportData = {
        title: 'Orphaned Student Records',
        header: 'Orphaned Student Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any Student Record where the ' + powerTools.reportOptions.schoolType +
        'grade level is not within the high and low grade levels for the school.<p>' +
        'Selecting a record will take you to the record in Direct Database ' + powerTools.reportOptions.ddaAccess +
        '.'),
        fields: ['dcid', 'student', 'schoolName', 'schoolId', {
          key: 'gradeLevel',
          parser: 'number'
        }, 'schoolHighGrade', 'schoolLowGrade'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 100,
          sortable: true,
          formatter: 'DDAStudents'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true,
          formatter: 'SchoolExist'
        }, {
          key: 'gradeLevel',
          label: 'Grade Level',
          minWidth: 200,
          sortable: true,
          formatter: 'GradeLevelValid'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student'
      };
    },
    OrphanedStudentTestScore: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = ', school,';
      } else {
        schoolOption = '';
      }
      powerTools.reportData = {
        title: 'Orphaned Student Test Score Records',
        header: 'Orphaned Student Test Score Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any Student Test Score Record where the student, test, test score' +
        schoolOption + ' or test date does not exist.<p>' +
        'Selecting a record will take you to the record in Direct Database ' + powerTools.reportOptions.ddaAccess +
        '.'),
        fields: ['dcid', {
          key: 'id',
          parser: 'number'
        }, 'student', 'studentid', 'test', 'testId', 'studentTestId', 'testScore', 'testScoreId', 'testDate',
          'schoolName', 'schoolId'],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDAStudentTestScore'
        }, {
          key: 'student',
          label: 'Student',
          minWidth: 100,
          sortable: true,
          formatter: 'StudentExist'
        }, {
          key: 'test',
          label: 'Test',
          minWidth: 100,
          sortable: true,
          formatter: 'TestExist'
        }, {
          key: 'testScore',
          label: 'Test Score',
          minWidth: 100,
          sortable: true,
          formatter: 'TestScoreExist'
        }, {
          key: 'testDate',
          label: 'Test Date',
          minWidth: 50,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true,
          formatter: 'SchoolExist'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };
    },
    OrphanedTeacherRace: function () {
      powerTools.reportData = {
        title: 'Orphaned TeacherRace Records',
        header: 'Orphaned TeacherRace Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any TeacherRace Record where the teacher or race code does not exist.<p>' +
        'Selecting a record will take you to the record in Direct Database ' + powerTools.reportOptions.ddaAccess +
        '.'),
        fields: ['dcid', {
          key: 'id',
          parser: 'number'
        }, 'teacher', 'teacherid', 'raceCode', 'raceCodeId'],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDATeacherRace'
        }, {
          key: 'teacher',
          label: 'Teacher',
          minWidth: 50,
          sortable: true,
          formatter: 'TeacherExist'
        }, {
          key: 'raceCode',
          label: 'Race Code',
          minWidth: 200,
          sortable: true,
          formatter: 'RaceCodeExist'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };
    },
    OrphanedTermBins: function () {
      if (powerTools.dataOptions.schoolid === 0) {
        powerTools.reportOptions.schoolType = 'or school ';
      } else {
        powerTools.reportOptions.schoolType = '';
      }

      powerTools.reportData = {
        title: 'Orphaned TermBins Records',
        header: 'Orphaned TermBins Records in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any TermBins Record where the term ' + powerTools.reportOptions.schoolType +
        'does not exist.<p>Selecting a record will take you to the record in Direct Database ' +
        powerTools.reportOptions.ddaAccess + '.'),
        fields: ['dcid', {
          key: 'id',
          parser: 'number'
        }, 'storeCode', 'term', 'schoolName', 'schoolId', 'termName'],
        columns: [{
          key: 'id',
          label: 'ID',
          minWidth: 50,
          sortable: true,
          formatter: 'DDATermBins'
        }, {
          key: 'storeCode',
          label: 'StoreCode',
          minWidth: 50,
          sortable: true
        }, {
          key: 'term',
          label: 'Term',
          minWidth: 100,
          sortable: true,
          formatter: 'DoesNotExist'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true,
          formatter: 'SchoolExist'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'id',
        wizardLink: 1
      };
    },
    OrphanReport: function () {
      powerTools.reportData = {
        title: 'Orphaned Records Report',
        header: 'Orphaned Records Report',
        info: ('This report will perform a listing of the count records for each system setup item PowerTools ' +
        'diagnoses. <br>Due to the complexity of this report, this page may take some time to complete loading.'),
        fields: ['report', 'reportName'],
        columns: [{
          key: 'report',
          label: 'Report',
          minWidth: 150,
          sortable: false,
          formatter: 'OverviewLink'
        }, {
          key: 'reportName',
          label: 'Count of Records',
          minWidth: 150,
          sortable: false,
          formatter: 'OverviewCount'
        }],
        template: powerTools.templateNoOption()
      };
    },
    OutsideSchoolCC: function () {
      powerTools.reportData = {
        title: 'Section Enrollments Outside the School Enrollments',
        header: 'Students with Section Enrollments Outside the School Enrollments in ' +
        powerTools.reportOptions.schoolName,
        info: ('This report selects any student who has a section' +
        ' enrollment which is not contained within a valid school enrollment.<p>' +
        'Selecting a record will take you to the students all enrollments page, ' +
        'where the enrollment may be corrected.'),
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseNumber', 'sectionNumber', 'courseName',
          'dateEnrolled', 'dateLeft'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'AllEnrollments'
        }, {
          key: 'courseNumber',
          label: 'Course.Section',
          minWidth: 100,
          sortable: true,
          formatter: 'CourseSection'
        }, {
          key: 'courseName',
          label: 'Course Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'dateEnrolled',
          label: 'Date Enrolled',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'dateLeft',
          label: 'Date Left',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    OutsideSchoolSpEnrollments: function () {
      powerTools.reportData = {
        title: 'Special Program Enrollments Outside the School Enrollments',
        header: 'Students with Special Program Enrollments Outside the School Enrollments in ' +
        powerTools.reportOptions.schoolName,
        info: ('This report selects any student who has a Special Program enrollment which is not contained ' +
        'within a valid school enrollment.<p>Selecting a record will take you to the students Special Programs ' +
        'page, where the enrollment may be corrected.<p>' +
        '<B>Many states allow an exit date of 0/0/0 as an acceptable ' +
        'Special Program exit date, or an enrollment spanning multiple years. Please check with your states ' +
        'documentation or DOE for clarification. An exit date of 0/0/0 would result in a Special Program ' +
        'enrollment outside of a school enrollment.</b>'),
        fields: ['dcid', 'studentid', 'student', 'programName', 'schoolName', 'entryDate', 'exitDate'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'SpecialPrograms'
        }, {
          key: 'programName',
          label: 'Special Program',
          minWidth: 150,
          sortable: true
        }, {
          key: 'entryDate',
          label: 'Entry Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'exitDate',
          label: 'Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'schoolName',
          label: 'SpEnrollment School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    OutsideYTSchool: function () {
      powerTools.reportData = {
        title: 'School Enrollments Outside the Years and Terms',
        header: 'Students with School Enrollments Outside Years and Terms in ' +
        powerTools.reportOptions.schoolName,
        info: ('This report selects all students who have a school enrollment which is not contained within any ' +
        'years and terms existing in the school.<p>' +
        'Selecting a record will take you to the students Transfer Info ' +
        'page, where the record can be corrected. Invalid records can be corrected by either removing the ' +
        'invalid enrollment, or by correcting the dates to make sure they fall within the schools years and ' +
        'terms.<p>' +
        'A no-show enrollment should be indicated by an exit date matching the entry date of the enrollment.'),
        fields: ['dcid', 'studentid', 'student', 'schoolName', {
          key: 'gradeLevel',
          parser: 'number'
        }, 'entryDate', 'exitDate'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'TransferInfo'
        }, {
          key: 'gradeLevel',
          label: 'Grade Level',
          minWidth: 50,
          sortable: true
        }, {
          key: 'entryDate',
          label: 'Entry Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'exitDate',
          label: 'Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    OverlappingCC: function () {
      powerTools.reportData = {
        title: 'Overlapping Section Enrollments',
        header: 'Students with Overlapping Section Enrollments in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects all students who are enrolled in a section more than once at any given time ' +
        'in a school year. Selecting a student takes you to the students All Enrollments page, where the data ' +
        'can be corrected.<p>' +
        'The easiest method for correcting these records is to use the "Clean up overlapping enrollments" ' +
        'function at the bottom of the newly opened page.'),
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'courseName', 'courseNumber', 'sectionNumber',
          'yearID', 'termID'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'AllEnrollments'
        }, {
          key: 'courseName',
          label: 'Course Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'courseNumber',
          label: 'Course.Section',
          minWidth: 100,
          sortable: true,
          formatter: 'CourseSection'
        }, {
          key: 'yearID',
          label: 'Year',
          minWidth: 100,
          sortable: true
        }, {
          key: 'termID',
          label: 'Term',
          minWidth: 100,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    OverlappingSchool: function () {
      powerTools.reportData = {
        title: 'Overlapping School Enrollments',
        header: 'Students with Overlapping School Enrollments in ' + powerTools.reportOptions.schoolName,
        info: ('This page displays the reenrollment record which is overlapping another enrollment. Selecting a ' +
        'student will take you to the Transfer Info page, where the data can be corrected.<p>' +
        'The data must be corrected manually, either by removing the invalid record, or by correcting the ' +
        'enrollment dates so they do not overlap.'),
        fields: ['dcid', 'studentid', 'student', 'schoolName', {
          key: 'gradeLevel',
          parser: 'number'
        }, 'entryDate', 'exitDate'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'TransferInfo'
        }, {
          key: 'gradeLevel',
          label: 'Grade Level',
          minWidth: 50,
          sortable: true
        }, {
          key: 'entryDate',
          label: 'Entry Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'exitDate',
          label: 'Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    OverlappingSpEnrollments: function () {
      powerTools.reportData = {
        title: 'Overlapping Special Program Enrollments',
        header: 'Students with Overlapping Special Program Enrollments in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects all students who are enrolled in a special program more than once at any ' +
        'given time in a school year. Selecting a student takes you to the students Special Programs page, where ' +
        'the data can be corrected.<p>' +
        'The easiest method for correcting these records is to correct the dates on the enrollments so they do ' +
        'not overlap, or to remove the duplicate enrollment by deletion.'),
        fields: ['dcid', 'student', 'specialProgram', 'entryDate', 'schoolName'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'SpecialPrograms'
        }, {
          key: 'specialProgram',
          label: 'Program Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'entryDate',
          label: 'Date of overlap',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    OverlappingTerms: function () {
      powerTools.reportData = {
        title: 'Overlapping Terms',
        header: 'Overlapping terms in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects all year long terms which overlap another year long term.<p>' +
        'Overlapping terms can cause many problems, including issues with attendance calculations. Overlapping ' +
        'terms must be corrected manually'),
        fields: ['schoolName', 'term1Id', 'term2Id', 'schoolId', 'term1FirstDay', 'term1LastDay', 'term2FirstDay',
          'term2LastDay'],
        columns: [{
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }, {
          key: 'term1FirstDay',
          label: 'Term 1 Start',
          minWidth: 150,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'term1LastDay',
          label: 'Term 1 End',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'term2FirstDay',
          label: 'Term 2 Start',
          minWidth: 200,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'term2LastDay',
          label: 'Term 2 End',
          minWidth: 200,
          sortable: true,
          formatter: 'DateNoLink'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'schoolName'
      };
    },
    PaddedSchoolEnrollments: function () {
      powerTools.reportData = {
        title: 'Padded School Enrollments',
        header: 'Students with Padded School Enrollments in ' + powerTools.reportOptions.schoolName,
        info: ('This report selects any student who is enrolled in school, however they are not enrolled in ' +
        'class at the beginning of their school enrollment, or they are not enrolled in class at the end of ' +
        'their school enrollment.<p>' +
        'Selecting a record will take you to the students All Enrollments page, where the enrollment dates may be ' +
        'reviewed.'),
        fields: ['dcid', 'studentid', 'student', {
          key: 'studentNumber',
          parser: 'number'
        }, 'entryDate', 'exitDate', 'firstCC', 'lastCC'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'TransferInfo'
        }, {
          key: 'studentNumber',
          label: 'Student Number',
          minWidth: 100,
          sortable: true
        }, {
          key: 'entryDate',
          label: 'School Entry Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'exitDate',
          label: 'School Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'firstCC',
          label: 'Date of First CC Record',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }, {
          key: 'lastCC',
          label: 'Date of Last CC Record',
          minWidth: 100,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    PastPending: function () {
      powerTools.reportData = {
        title: 'Invalid Pending Transfer Dates',
        header: 'Students with Invalid Pending Transfer Dates in ' + powerTools.reportOptions.schoolName,
        info: ('This report identifies any students who have a pending transfer date in the past. A pending ' +
        'transfer date in the past indicates an automated transfer which did not occur.<p>' +
        'The record must be corrected by either transferring the student out of school, or by adjusting the ' +
        'students enroll_status field in DDA or student field value. You may also clear out the ' +
        'enrollment_transfer_date_pend field using DDA or Student Field value if the students enrollment ' +
        'information is currently correct.<p>' +
        'Selecting a student will take you to the students Transfer Info page. It may be possible to correct the ' +
        'enrollment data from this page by transferring the student.'),
        fields: ['dcid', 'studentid', 'student', {
          key: 'gradeLevel',
          parser: 'number'
        }, 'enrollmentStatus', 'pendingDate'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'TransferInfo'
        }, {
          key: 'gradeLevel',
          label: 'Grade Level',
          minWidth: 50,
          sortable: true
        }, {
          key: 'enrollmentStatus',
          label: 'Enrollment Status',
          minWidth: 150,
          sortable: true
        }, {
          key: 'pendingDate',
          label: 'Pending Transfer Date',
          minWidth: 150,
          sortable: true,
          formatter: 'EnrollmentDateNoLink'
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    PossibleDupStudReportsWithSpaces: function () {
      powerTools.reportData = {
        title: 'Reports Ending in a Space',
        header: 'Reports Ending in a Space',
        info: ('This report selects any report where the name ends in a space.<p>' +
        'Selecting a record will take ' +
        'you to the report setup, where the space can be removed from the end of the name, or the report may be ' +
        'deleted.'),
        fields: ['dcid', 'reportName', 'reportType'],
        columns: [{
          key: 'reportName',
          label: 'Report Name',
          minWidth: 150,
          sortable: true,
          formatter: 'Reports'
        }, {
          key: 'reportType',
          label: 'Report Type',
          minWidth: 150,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'reportName'
      };
    },
    SectionInvalidSM: function () {
      powerTools.reportData = {
        title: 'Sections Missing Section Meeting Record',
        header: 'Sections missing Section Meeting records in ' + powerTools.reportOptions.schoolName,
        info: ('This report displays any section which does not have a valid corresponding section meeting ' +
        'record.<p>' +
        'These records may be corrected by adding an expression to the section. If the section already has an ' +
        'expression, you may correct these records by running the Reset Section Meetings special operation.<p>' +
        'Clicking on a section will take you to the Edit Section page for that section.'),
        fields: ['dcid', 'courseNumber', 'sectionNumber', {
          key: 'termId',
          parser: 'number'
        }, 'expression', 'schoolName'],
        columns: [{
          key: 'courseNumber',
          label: 'Course.Section',
          minWidth: 150,
          sortable: true,
          formatter: 'EditSectionLink'
        }, {
          key: 'termId',
          label: 'Term ID',
          minWidth: 50,
          sortable: true
        }, {
          key: 'expression',
          label: 'Expression',
          minWidth: 50,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'courseNumber'
      };
    },
    SpEnrollmentBadGrade: function () {
      powerTools.reportData = {
        title: 'Special Program Enrollments with Incorrect Grade Levels',
        header: 'Students having Special Program enrollments with invalid grade levels in ' +
        powerTools.reportOptions.schoolName,
        info: ('This report selects any student who has a Special Program enrollment where grade level of the ' +
        'enrollment does not match the grade level of the school enrollment which contains the special program ' +
        'enrollment.<p>' +
        'Selecting a record will take you to the students Special Programs page, where the enrollment may be ' +
        'corrected.'),
        fields: ['dcid', 'studentid', 'student', 'schoolName', 'programName', {
          key: 'gradeLevel',
          parser: 'number'
        }, {
          key: 'programGrade',
          parser: 'number'
        }, 'entryDate', 'exitDate'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'SpecialPrograms'
        }, {
          key: 'programName',
          label: 'Special Program Name',
          minWidth: 150,
          sortable: true
        }, {
          key: 'gradeLevel',
          label: 'Student Grade Level',
          minWidth: 100,
          sortable: true
        }, {
          key: 'programGrade',
          label: 'SpEnrollment Grade Level',
          minWidth: 100,
          sortable: true
        }, {
          key: 'entryDate',
          label: 'Entry Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'exitDate',
          label: 'Exit Date',
          minWidth: 100,
          sortable: true,
          formatter: 'DateNoLink'
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 200,
          sortable: true
        }],
        template: powerTools.templateNoCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    StudentNumberIssue: function () {
      powerTools.reportData = {
        title: 'Students with Student Numbers greater than 2147483647',
        header: 'Students with Student Numbers Greater Than 2147483647 in ' + powerTools.reportOptions.schoolName,
        info: ('This report displays any student with a student ' +
        'number higher than 2147483647. This issue is documented in the following PowerSource article:<br>' +
        '<a href="https://support.powerschool.com/d/7269" target="PowerSource">' +
        'PowerSource article 7269</a>'),
        fields: ['dcid', 'studentid', 'student', {
          key: 'studentNumber',
          parser: 'number'
        }, 'schoolName'],
        columns: [{
          key: 'student',
          label: 'Student',
          minWidth: 150,
          sortable: true,
          formatter: 'Demographics'
        }, {
          key: 'studentNumber',
          label: 'Student Number',
          minWidth: 50,
          sortable: true
        }, {
          key: 'schoolName',
          label: 'School Name',
          minWidth: 150,
          sortable: true
        }],
        template: powerTools.templateCY(),
        sortKey: 'student',
        showSelectButtons: 1
      };
    },
    StudentReport: function () {
      powerTools.reportData = {
        title: 'Student Report',
        header: 'Student Report',
        info: 'This report will perform a listing of the count records for each student item PowerTools ' +
        'diagnoses.' +
        '<br>Due to the complexity of this report, this page may take some time to complete loading.',
        fields: ['report', 'reportName'],
        columns: [{
          key: 'report',
          label: 'Report',
          minWidth: 150,
          sortable: false,
          formatter: 'OverviewLink'
        }, {
          key: 'reportName',
          label: 'Count of Records',
          minWidth: 150,
          sortable: false,
          formatter: 'OverviewCount'
        }],
        template: powerTools.templateCYOnly()
      };
    }
  },
  selectAll: function () {
    $j('#CheckAll').click(function () {
      var checkAllStatus = $j('#CheckAll').attr('checked');
      $j('#selectOptions').find(':checkbox').each(function () {
        if ($j(this).attr('checked') !== checkAllStatus) {
          $j(this).click();
        }
      });
    });
  },
  checkWizardBox: function () {
    $j('#selectOptions :checkbox').change(function () {
      powerTools.wizardData.countRecords();
    });
  },
  ddaSelectDelete: function (fieldNumber, selectVal, callback) {
    $j.ajax({
      url: '/admin/tech/usm/home.html',
      data: {
        ac: 'usm',
        comparator1: '=',
        fieldnum_1: fieldNumber,
        search: 'Search all',
        value: selectVal
      }
    }).success(function () {
      $j.ajax({
        url: '/admin/tech/usm/home.html',
        data: {
          'delete': 'Delete Selected Records',
          'fieldnum': '0',
          'modifytext': '',
          'verifydelete': 'yes'
        }
      }).success(function () {
        powerTools.currentRecord++;
        if (powerTools.currentRecord === powerTools.dataSet.length) {
          callback();
        } else {
          powerTools.ddaSelectDelete(fieldNumber, powerTools.dataSet[powerTools.currentRecord].badval, callback);
        }
      });
    });
  },
  ddaSelectModify: function (fieldNumber, selectVal, modifyVal, callback) {
    $j.ajax({
      url: '/admin/tech/usm/home.html',
      data: {
        ac: 'usm',
        comparator1: '=',
        fieldnum_1: fieldNumber,
        search: 'Search all',
        value: selectVal
      }
    }).success(function () {
      $j.ajax({
        url: '/admin/tech/usm/home.html',
        data: {
          modify: 'Modify Selected Records',
          fieldnum: fieldNumber,
          modifytext: modifyVal
        }
      }).success(function () {
        powerTools.currentRecord++;
        if (powerTools.currentRecord === powerTools.dataSet.length) {
          callback();
        } else {
          powerTools.ddaSelectModify(fieldNumber, powerTools.dataSet[powerTools.currentRecord].badval,
            powerTools.dataSet[powerTools.currentRecord].goodval, callback);
        }
      });
    });
  },
  ddaSelectTableDelete: function (tableNumber, fieldNumber, callback) {
    $j.ajax({
      url: '/admin/tech/usm/home.html',
      data: {
        filenum: tableNumber
      },
      async: false
    }).success(function () {
      powerTools.ddaSelectDelete(fieldNumber, powerTools.dataSet[powerTools.currentRecord].badval, callback);
    });
  },
  ddaSelectTableModify: function (tableNumber, fieldNumber, callback) {
    $j.ajax({
      url: '/admin/tech/usm/home.html',
      data: {
        filenum: tableNumber
      },
      async: false
    }).success(function () {
      powerTools.ddaSelectModify(fieldNumber, powerTools.dataSet[powerTools.currentRecord].badval,
        powerTools.dataSet[powerTools.currentRecord].goodval, callback);
    });
  },
  ddaSelectTableChangeCase: function (tableNumber, fieldNumber) {
    $j.ajax({
      url: '/admin/tech/usm/home.html',
      data: {
        filenum: tableNumber
      },
      async: false
    }).success(function () {
      powerTools.ddaChangeCase(fieldNumber);
    });
  },
  ddaChangeCase: function (fieldNumber) {
    $j.ajax({
      url: '/admin/tech/usm/home.html',
      data: {
        ac: 'usm',
        comparator1: '=',
        fieldnum_1: '1',
        search: 'Search all',
        value: powerTools.dataSet[powerTools.currentRecord].id
      }
    }).success(function () {
      $j.ajax({
        url: '/admin/tech/usm/home.html',
        data: {
          modify: 'Modify Selected Records',
          fieldnum: fieldNumber,
          modifytext: '_' + powerTools.dataSet[powerTools.currentRecord].badval
        }
      }).success(function () {
        $j.ajax({
          url: '/admin/tech/usm/home.html',
          data: {
            modify: 'Modify Selected Records',
            fieldnum: fieldNumber,
            modifytext: powerTools.dataSet[powerTools.currentRecord].goodval
          }
        }).success(function () {
          powerTools.currentRecord++;
          if (powerTools.currentRecord === powerTools.dataSet.length) {
            powerTools.initReport();
          } else {
            powerTools.ddaChangeCase(fieldNumber);
          }
        });
      });
    });
  },
  wizardConfig: {
    BlankStoredGrades: function () {
      powerTools.wizardData = {
        title: 'Blank Stored Grades Wizard',
        name: 'Blank Stored Grade',
        header: 'Removing blank stored grades in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove blank stored grades. This wizard will remove all stored grades where the ' +
        'letter grade is blank, the percent is zero, and the comment is blank.',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Blank Stored Grades',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('031', 'storedGradeDcid');
        }
      };
    },
    DupAttendanceCode: function () {
      function correctAttendanceCodeEntity() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableDelete(163, 2, removeAttendanceCodes);
      }

      function removeAttendanceCodes() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableDelete(156, 1, powerTools.initReport);
      }

      powerTools.wizardData = {
        title: 'Duplicate Attendance Code Wizard',
        name: 'Duplicate Attendance Code',
        header: 'Repairing duplicate attendance code records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair duplicate attendance codes. This process will repair all attendance ' +
        'records, remove all attendance code categories from the duplicate attendance codes, then remove the ' +
        'duplicate attendance codes.',
        jsonUrl: 'json/DupAttendanceCodeWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Repair Duplicate Attendance Codes',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.ddaSelectTableModify(157, 2, correctAttendanceCodeEntity);
        }
      };
    },
    DupAttendanceConversion: function () {
      function removeAttendanceConversionItems() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableDelete(132, 2, removeAttendanceCodes);
      }

      function removeAttendanceCodes() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableDelete(131, 1, powerTools.initReport);
      }

      powerTools.wizardData = {
        title: 'Duplicate Attendance Conversion Wizard',
        name: 'Duplicate Attendance Conversion',
        header: 'Repairing duplicate Attendance Conversions in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair duplicate Attendance Conversions. This process will correct the attendance ' +
        'conversion on the bell schedules, remove the attendance conversion items record for the duplicated ' +
        'attendance conversion, then delete the duplicated attendance conversion.',
        jsonUrl: 'json/DupAttendanceConversionWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Attendance Conversions',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.ddaSelectTableModify(133, 4, removeAttendanceConversionItems);
        }
      };
    },
    DupBellSchedule: function () {
      function removeBellScheduleItems() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableDelete(134, 2, removeBellSchedules);
      }

      function removeBellSchedules() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableDelete(133, 1, powerTools.initReport);
      }

      powerTools.wizardData = {
        title: 'Duplicate Bell Schedules Wizard',
        name: 'Duplicate Bell Schedule',
        header: 'Repairing duplicate bell schedules in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair duplicate bell schedules. This process will repair all calendar records, ' +
        'then remove the duplicate bell schedules and bell schedule items.',
        jsonUrl: 'json/DupBellScheduleWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Bell Schedules',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.ddaSelectTableModify(51, 16, removeBellScheduleItems);
        }
      };
    },
    DupCalendarDay: function () {
      powerTools.wizardData = {
        title: 'Duplicate Calendar Days Wizard',
        name: 'Duplicate Calendar Day',
        header: 'Repairing duplicate calendar day records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair duplicate calendar day records. This wizard will remove all duplicate ' +
        'calendar_day records.',
        jsonUrl: 'json/DupCalendarDayWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Calendar Days',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('051', 'dcid');
        }
      };
    },
    DupDays: function () {
      function removeCycleDays() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableDelete(135, 1, powerTools.initReport);
      }

      powerTools.wizardData = {
        title: 'Duplicate Cycle Days Wizard',
        name: 'Duplicate Cycle Day',
        header: 'Repairing duplicate cycle day records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair duplicate cycle days. This process will repair all calendar day records, ' +
        'then remove the duplicate cycle days.',
        jsonUrl: 'json/DupDaysWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Cycle Days',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.ddaSelectTableModify(51, 15, removeCycleDays);
        }
      };
    },
    DupEntryCodes: function () {
      powerTools.wizardData = {
        title: 'Duplicate Entry Codes Wizard',
        name: 'Duplicate Entry Code',
        header: 'Repairing duplicate entry code records in All Schools',
        info: 'Use this wizard to repair duplicate Entry Codes. This process will remove the duplicate Entry Codes.',
        jsonUrl: 'json/DupEntryCodesWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Entry Codes',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('006', 'dcid');
        }
      };
    },
    DupExitCodes: function () {
      powerTools.wizardData = {
        title: 'Duplicate Exit Codes Wizard',
        name: 'Duplicate Exit Code',
        header: 'Repairing duplicate exit code records in All Schools',
        info: 'Use this wizard to repair duplicate Exit Codes. This process will remove the duplicate Exit Codes.',
        jsonUrl: 'json/DupExitCodesWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Exit Codes',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('006', 'dcid');
        }
      };
    },
    DupFTE: function () {
      function correctReenrollments() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableModify(18, 21, correctFTEGrade);
      }

      function correctFTEGrade() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableModify(160, 2, correctAttendanceConversion);
      }

      function correctAttendanceConversion() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableModify(132, 7, removeFTE);
      }

      function removeFTE() {
        powerTools.currentRecord = 0;
        powerTools.drDelete('159', 'dcid');
      }

      powerTools.wizardData = {
        title: 'Duplicate FTE Wizard',
        name: 'Duplicate FTE',
        header: 'Repairing duplicate FTEs in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair duplicate FTEs. This process will correct the FTEs in the Students, ' +
        'Reenrollments, FTEGrade and Attendance Conversion tables, then remove the duplicate FTE.',
        jsonUrl: 'json/DupFTEWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate FTEs',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.ddaSelectTableModify(1, 129, correctReenrollments);
        }
      };
    },
    DupGen: function () {
      powerTools.wizardData = {
        title: 'Duplicate Gen Records Wizard',
        name: 'Duplicate Gen Records',
        header: 'Repairing duplicate gen records in All Schools',
        info: 'Use this wizard to repair duplicate gen records. This process will remove the duplicate gen records.',
        jsonUrl: 'json/DupGenWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Gen Records',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('006', 'dcid');
        }
      };
    },
    DupPeriodNumber: function () {
      function correctAttendanceQueue() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableModify(48, 18, correctAttendanceTaken);
      }

      function correctAttendanceTaken() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableModify(172, 4, correctBellSchedules);
      }

      function correctBellSchedules() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableModify(134, 3, removePeriods);
      }

      function removePeriods() {
        powerTools.currentRecord = 0;
        powerTools.ddaSelectTableDelete(138, 1, powerTools.initReport);
      }

      powerTools.wizardData = {
        title: 'Duplicate Periods Wizard',
        name: 'Duplicate Period',
        header: 'Repairing duplicate periods in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair duplicate periods. This process will repair all attendance, ' +
        'attendancequeue, attendance_taken, and bell schedule records, then remove the duplicate Periods.',
        jsonUrl: 'json/DupPeriodNumberWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Periods',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.ddaSelectTableModify(157, 8, correctAttendanceQueue);
        }
      };
    },
    DupPrefs: function () {
      powerTools.wizardData = {
        title: 'Duplicate Preferences Wizard',
        name: 'Duplicate Preference',
        header: 'Repairing duplicate preference records in All Schools',
        info: 'Use this wizard to repair duplicate Preferences. This process will remove the duplicate Preferences.',
        jsonUrl: 'json/DupPrefsWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Preferences',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('009', 'dcid');
        }
      };
    },
    DupServerConfig: function () {
      powerTools.wizardData = {
        title: 'Duplicate Server Configuration Wizard',
        name: 'Duplicate Server Configuration',
        header: 'Repairing duplicate server configuration records',
        info: 'Use this wizard to repair duplicate server configuration records. This wizard will delete the ' +
        'duplicate records.',
        jsonUrl: 'json/DupServerConfigWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Server Config Records',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('175', 'dcid');
        }
      };
    },
    DupServerInstance: function () {
      powerTools.wizardData = {
        title: 'Duplicate Server Instance Wizard',
        header: 'Repairing duplicate server instance records',
        info: 'Use this wizard to repair duplicate server instance records. This process will remove the duplicate ' +
        'server instance records.',
        jsonUrl: 'json/DupServerInstanceWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Server Instance Records',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('177', 'dcid');
        }
      };
    },
    DupTermBins: function () {
      powerTools.wizardData = {
        title: 'Duplicate Final Grade Setups Wizard',
        name: 'Duplicate Final Grade Setup',
        header: 'Repairing duplicate final grade setups in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair duplicate final grade setups. This process will remove the duplicate Final ' +
        'Grade Setup items.',
        jsonUrl: 'json/DupTermBinsWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Final Grade Setups',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('033', 'dcid');
        }
      };
    },
    DupTerms: function () {
      powerTools.wizardData = {
        title: 'Duplicate Terms Wizard',
        name: 'Duplicate Term',
        header: 'Repairing duplicate terms records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair duplicate terms records. This process will remove the duplicate term records.',
        jsonUrl: 'json/DupTermsWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Duplicate Terms',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('013', 'dcid');
        }
      };
    },
    InvCourseNumberCC: function () {
      powerTools.wizardData = {
        title: 'CC Records with Incorrect Course Number Wizard',
        name: 'CC Records with Incorrect Course Number',
        header: 'Repairing CC Records with Incorrect Course Number records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair CC Records with incorrect case sensitivity. This process will correct the ' +
        'case sensitivity of the course number in the CC record.',
        jsonUrl: 'json/InvCourseCCWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Repair Course Numbers',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.ddaSelectTableChangeCase(4, 17);
        }
      };
    },
    InvCourseNumberSections: function () {
      powerTools.wizardData = {
        title: 'Section Records with Incorrect Course Number Wizard',
        name: 'Section Records with Incorrect Course Number',
        header: 'Repairing Section Records with Incorrect Section Number records in ' +
        powerTools.dataOptions.schoolname,
        info: 'Use this wizard to repair Section Records with incorrect case sensitivity. This process will correct ' +
        'the case sensitivity of the Section number.',
        jsonUrl: 'json/InvCourseNumberSectionsWizard.json',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Repair Course Numbers',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.ddaSelectTableChangeCase(3, 3);
        }
      };
    },
    NonInSessionAttendance: function () {
      powerTools.wizardData = {
        title: 'Non-Session Attendance Wizard',
        name: 'Non-Session Attendance',
        header: 'Repairing attendance on non-session days in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove attendance records that are invalid based on when the school, section, or ' +
        'student is in session. This process will remove all attendance records where the school, section, or ' +
        'student is not in session based on the options selected.',
        options: {
          checkboxes: [
            {
              id: 'noSchoolDay',
              text: 'School is not in session this day'
            },
            {
              id: 'noStudentDay',
              text: 'Student is not in school this day'
            },
            {
              id: 'noStudentSection',
              text: 'Student is not in section this day'
            },
            {
              id: 'noSectionDay',
              text: 'Section is not in session this day'
            },
            {
              id: 'noSectionPeriod',
              text: 'Section is not in session this period'
            }
          ]
        },
        countRecords: function () {
          var noSchoolDay = $j('#noSchoolDay').is(':checked'),
            noStudentDay = $j('#noStudentDay').is(':checked'),
            noStudentSection = $j('#noStudentSection').is(':checked'),
            noSectionDay = $j('#noSectionDay').is(':checked'),
            noSectionPeriod = $j('#noSectionPeriod').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noSchoolDay === true && record.errormsg.indexOf('School is not in session') > -1) ||
              (noStudentDay === true && record.errormsg.indexOf('Student not in school this day') > -1) ||
              (noStudentSection === true && record.errormsg.indexOf('Student not in section this day') > -1) ||
              (noSectionDay === true && record.errormsg.indexOf('Section not in session this day') > -1) ||
              (noSectionPeriod === true && record.errormsg.indexOf('Section not in session this period') > -1)
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Non-Session Attendance',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('157', 'attendanceDcid');
        }
      };
    },
    OrphanedAttendance: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = 'school, ';
      } else {
        schoolOption = '';
      }
      powerTools.wizardData = {
        title: 'Orphaned Attendance Wizard',
        name: 'Orphaned Attendance',
        header: 'Removing orphaned attendance records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned attendance. This process will delete all attendance records where ' +
        'the student, attendance code, CC record, section, course, ' + schoolOption + 'or period number does not ' +
        'exist, based off the options selected.',
        options: {
          checkboxes: [
            {
              id: 'NoAttCode',
              text: 'Attendance Code does not exist'
            },
            {
              id: 'NoCC',
              text: 'CC Record does not exist'
            },
            {
              id: 'NoCourse',
              text: 'Course does not exist'
            },
            {
              id: 'NoPeriod',
              text: 'Period does not exist'
            },
            {
              id: 'NoSection',
              text: 'Section does not exist'
            },
            {
              id: 'NoStudent',
              text: 'Student does not exist'
            },
            {
              id: 'NoSchool',
              text: 'School does not exist'
            }
          ]
        },
        buttonText: 'Remove Orphaned Attendance Records',
        countRecords: function () {
          var noAttCode = $j('#NoAttCode').is(':checked'),
            noCC = $j('#NoCC').is(':checked'),
            noCourse = $j('#NoCourse').is(':checked'),
            noPeriod = $j('#NoPeriod').is(':checked'),
            noSection = $j('#NoSection').is(':checked'),
            noStudent = $j('#NoStudent').is(':checked'),
            noSchool = $j('#NoSchool').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noAttCode === true && record.attendanceCode === '') ||
              (noCC === true && record.courseSection.indexOf('CCID') > -1) ||
              (noCourse === true && record.courseSection.indexOf('Course Number') > -1) ||
              (noPeriod === true && record.period === '') ||
              (noSection === true && record.courseSection.indexOf('Section ID') > -1) ||
              (noStudent === true && record.student === '') ||
              (noSchool === true && record.schoolName === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('157', 'attendanceDcid');
        }
      };
    },
    OrphanedAttendanceTime: function () {
      powerTools.wizardData = {
        title: 'Orphaned Attendance_Time Wizard',
        name: 'Orphaned Attendance_Time',
        header: 'Removing orphaned attendance_time records in All Schools',
        info: 'Use this wizard to remove orphaned attendance_time records. This process will delete all ' +
        'attendance_time records where the attendance record does not exist.',
        buttonText: 'Remove Orphaned Attendance_Time Records',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('158', 'dcid');
        }
      };
    },
    OrphanedCC: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = 'school, ';
      } else {
        schoolOption = '';
      }
      powerTools.wizardData = {
        title: 'Orphaned CC Record Wizard',
        name: 'Orphaned CC',
        header: 'Removing orphaned CC records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned CC Records. This process will delete all CC records where the ' +
        'student, section, course, ' + schoolOption + 'or term does not exist, based off the options ' +
        'selected.',
        options: {
          checkboxes: [
            {
              id: 'NoStudent',
              text: 'Student does not exist'
            },
            {
              id: 'NoSection',
              text: 'Section does not exist'
            },
            {
              id: 'NoCourse',
              text: 'Course does not exist'
            },
            {
              id: 'NoTerm',
              text: 'Term does not exist'
            },
            {
              id: 'NoSchool',
              text: 'School does not exist'
            }
          ]
        },
        buttonText: 'Remove Orphaned CC Records',
        countRecords: function () {
          var noCourse = $j('#NoCourse').is(':checked'),
            noSection = $j('#NoSection').is(':checked'),
            noStudent = $j('#NoStudent').is(':checked'),
            noTerm = $j('#NoTerm').is(':checked'),
            noSchool = $j('#NoSchool').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noCourse === true && record.courseSection.indexOf('Course Number') > -1) ||
              (noSection === true && record.courseSection.indexOf('Section ID') > -1) ||
              (noStudent === true && record.student === '') ||
              (noTerm === true && record.termId === '') ||
              (noSchool === true && record.schoolName === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('004', 'dcid');
        }
      };
    },
    OrphanedFeeTransaction: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = ', school,';
      } else {
        schoolOption = '';
      }
      powerTools.wizardData = {
        title: 'Orphaned Fee Transaction Wizard',
        name: 'Orphaned Fee Transaction',
        header: 'Removing orphaned fee transaction records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned fee transactions. This process will delete all fee transaction ' +
        'records where the student ' + schoolOption + ' or fee does not exist, based off the options selected.',
        options: {
          checkboxes: [
            {
              id: 'NoStudent',
              text: 'Student does not exist'
            },
            {
              id: 'NoFee',
              text: 'Attendance Code does not exist'
            },
            {
              id: 'NoSchool',
              text: 'School does not exist'
            }
          ]
        },
        buttonText: 'Remove Orphaned Fee Transactions',
        countRecords: function () {
          var noStudent = $j('#NoStudent').is(':checked'),
            noFee = $j('#NoFee').is(':checked'),
            noSchool = $j('#NoSchool').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noStudent === true && record.student === '') ||
              (noFee === true && record.feeId === '') ||
              (noSchool === true && record.schoolName === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('147', 'dcid');
        }
      };
    },
    OrphanedHonorRoll: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = 'or school ';
      } else {
        schoolOption = '';
      }

      powerTools.wizardData = {
        title: 'Orphaned Honor Roll Wizard',
        name: 'Orphaned Honor Roll',
        header: 'Removing orphaned honor roll records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned honor roll records. This process will delete all honor roll ' +
        'records where the student ' + schoolOption + 'does not exist.',
        options: {
          checkboxes: [
            {
              id: 'NoStudent',
              text: 'Student does not exist'
            },
            {
              id: 'NoSchool',
              text: 'School does not exist'
            }
          ]
        },
        buttonText: 'Remove Orphaned Honor Roll Records',
        countRecords: function () {
          var noStudent = $j('#NoStudent').is(':checked'),
            noSchool = $j('#NoSchool').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noStudent === true && record.student === '') ||
              (noSchool === true && record.schoolName === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('034', 'dcid');
        }
      };
    },
    OrphanedPGFinalGrades: function () {
      powerTools.wizardData = {
        title: 'Orphaned PGFinalGrade Wizard',
        name: 'Orphaned PGFinalGrade',
        header: 'Removing orphaned PGFinalGrade records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned PGFinalGrade records. This process will delete all PGFinalGrade ' +
        'records where the student, section, or course number does not exist, based off the options selected.',
        options: {
          checkboxes: [
            {
              id: 'NoStudent',
              text: 'Student does not exist'
            },
            {
              id: 'NoSection',
              text: 'Section does not exist'
            },
            {
              id: 'NoCourse',
              text: 'Course does not exist'
            }
          ]
        },
        countRecords: function () {
          var noStudent = $j('#NoStudent').is(':checked'),
            noSection = $j('#NoSection').is(':checked'),
            noCourse = $j('#NoCourse').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noStudent === true && record.student === '') ||
              (noSection === true && record.courseSection.indexOf('Section ID') > -1) ||
              (noCourse === true && record.courseSection.indexOf('Course Number') > -1)
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Orphaned PGFinalGrade Records',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('095', 'dcid');
        }
      };
    },
    OrphanedReenrollments: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = 'or school ';
      } else {
        schoolOption = '';
      }

      powerTools.wizardData = {
        title: 'Orphaned Reenrollments Wizard',
        name: 'Orphaned Reenrollment',
        header: 'Removing orphaned Reenrollment records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned Reenrollment Records. This process will delete all Reenrollment ' +
        'records where the student ' + schoolOption + 'does not exist, based off the options selected.' +
        '<br>Reenrollments with an invalid grade level will not be removed unless another option removes the record',
        options: {
          checkboxes: [
            {
              id: 'NoStudent',
              text: 'Student does not exist'
            },
            {
              id: 'NoSchool',
              text: 'School does not exist'
            }
          ]
        },
        countRecords: function () {
          var noStudent = $j('#NoStudent').is(':checked'),
            noSchool = $j('#NoSchool').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noStudent === true && record.student === '') ||
              (noSchool === true && record.schoolName === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Orphaned Reenrollments',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('018', 'dcid');
        }
      };
    },
    OrphanedSection: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = 'school, ';
      } else {
        schoolOption = '';
      }

      powerTools.wizardData = {
        title: 'Orphaned Section Wizard',
        name: 'Orphaned Section',
        header: 'Removing orphaned Sections records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned Sections Records. This process will delete all Sections records ' +
        'where the course, teacher, ' + schoolOption + 'or term does not exist, based off the options selected.',
        options: {
          checkboxes: [
            {
              id: 'NoCourse',
              text: 'Course does not exist'
            },
            {
              id: 'NoTeacher',
              text: '<span class="redText">Teacher does not exist</span>'
            },
            {
              id: 'NoTerm',
              text: 'Term does not exist'
            },
            {
              id: 'NoSchool',
              text: 'School does not exist'
            }
          ],
          checkboxNote: 'Use caution when selecting the option "Teacher does not exist" as you may wish to simply ' +
          'assign these sections to another teacher.',
		  prompts: [
		    {
			  id: 'delsectionpassword',
			  text: 'Delete Section Password'
		    }
		  ]
        },
        countRecords: function () {
          var noCourse = $j('#NoCourse').is(':checked'),
            noTeacher = $j('#NoTeacher').is(':checked'),
            noTerm = $j('#NoTerm').is(':checked'),
            noSchool = $j('#NoSchool').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noCourse === true && record.courseSection.indexOf('Course ') > -1) ||
              (noTeacher === true && record.teacher === '') ||
              (noTerm === true && record.schoolTermId === '') ||
              (noSchool === true && record.schoolName === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Orphaned Sections',
        action: function () {
		  powerTools.dataOptions.deletePass = $j('#delsectionpassword').val();
		  powerTools.currentRecord = 0;
          powerTools.drDelete('003', 'dcid');
        }
      };
    },
    OrphanedSchoolCourse: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = 'or school ';
      } else {
        schoolOption = '';
      }

      powerTools.wizardData = {
        title: 'Orphaned School_Course Wizard',
        name: 'Orphaned School_Course',
        header: 'Removing orphaned School_Course records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned School_Course Records. This process will delete all School_Course ' +
        'records where the course ' + schoolOption + 'does not exist, based off the options selected.',
        options: {
          checkboxes: [
            {
              id: 'NoCourse',
              text: 'Course does not exist'
            },
            {
              id: 'NoSchool',
              text: 'School does not exist, or is Graduated Students'
            }
          ]
        },
        countRecords: function () {
          var noCourse = $j('#NoCourse').is(':checked'),
            noSchool = $j('#NoSchool').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noCourse === true && record.courseName === 'Course does not exist') ||
              (noSchool === true && (record.schoolName === '' || record.schoolName === 'Graduated Students'))
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Orphaned School_Courses',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('153', 'dcid');
        }
      };
    },
    OrphanedSpEnrollments: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = ', school, ';
      } else {
        schoolOption = '';
      }

      powerTools.wizardData = {
        title: 'Orphaned Special Programs Wizard',
        name: 'Orphaned Special Program',
        header: 'Removing orphaned Special Programs records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned Special Programs. This process will delete all Special Programs ' +
        'records where the student' + schoolOption + ' or program does not exist, based off the options selected.',
        options: {
          checkboxes: [
            {
              id: 'NoStudent',
              text: 'Student does not exist'
            },
            {
              id: 'NoProgram',
              text: 'Special Program does not exist'
            },
            {
              id: 'NoSchool',
              text: 'School does not exist'
            }
          ]
        },
        countRecords: function () {
          var noStudent = $j('#NoStudent').is(':checked'),
            noProgram = $j('#NoProgram').is(':checked'),
            noSchool = $j('#NoSchool').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noStudent === true && record.student === '') ||
              (noProgram === true && record.programName === '') ||
              (noSchool === true && record.schoolName === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Orphaned Special Program Records',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('041', 'dcid');
        }
      };
    },
    OrphanedStoredGrades: function () {
      powerTools.wizardData = {
        title: 'Orphaned Stored Grades Wizard',
        name: 'Orphaned Stored Grade',
        header: 'Removing orphaned Stored Grades records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned Stored Grades. This process will delete all Stored Grades records ' +
        'where the student does not exist. If you wish to manually correct any records, please do so prior to ' +
        'running this wizard.',
        countRecords: function () {
          $j(powerTools.dataSet).each(function (index, record) {
            record.flaggedrecord = 1;
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Orphaned Stored Grades',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('031', 'dcid');
        }
      };
    },
    OrphanedStudentRace: function () {
      powerTools.wizardData = {
        title: 'Orphaned Student Race Wizard',
        name: 'Orphaned Student Race',
        header: 'Removing orphaned Student race records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned Student Race Records. This process will delete all Student Race ' +
        'records where the student or race code does not exist, based off the options selected.',
        options: {
          checkboxes: [
            {
              id: 'NoStudent',
              text: 'Student does not exist'
            },
            {
              id: 'NoRaceCode',
              text: 'Race code does not exist'
            }
          ]
        },
        countRecords: function () {
          var noStudent = $j('#NoStudent').is(':checked'),
            noRaceCode = $j('#NoRaceCode').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noStudent === true && record.student === '') ||
              (noRaceCode === true && record.raceCode === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Orphaned Student Race Records',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('201', 'dcid');
        }
      };
    },
    OrphanedStudentTestScore: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = ', school, ';
      } else {
        schoolOption = '';
      }

      powerTools.wizardData = {
        title: 'Orphaned Student Test Scores Wizard',
        name: 'Orphaned Student Test Score',
        header: 'Removing orphaned Student Test Scores records in ' + powerTools.dataOptions.schoolname,
        info: 'Use this wizard to remove orphaned Student Test Scores. This process will delete all Student Test ' +
        'Scores records where the student, test, test score' + schoolOption + 'or test date does not exist, based ' +
        'off the options selected.',
        options: {
          checkboxes: [
            {
              id: 'NoStudent',
              text: 'Student does not exist'
            },
            {
              id: 'NoTest',
              text: 'Test does not exist'
            },
            {
              id: 'NoTestScore',
              text: 'Test Score does not exist'
            },
            {
              id: 'NoStudentTest',
              text: 'Student Test does not exist'
            },
            {
              id: 'NoSchool',
              text: 'School does not exist'
            }
          ]
        },
        countRecords: function () {
          var noStudent = $j('#NoStudent').is(':checked'),
            noTest = $j('#NoTest').is(':checked'),
            noTestScore = $j('#NoTestScore').is(':checked'),
            noStudentTest = $j('#NoStudentTest').is(':checked'),
            noSchool = $j('#NoSchool').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noStudent === true && record.student === '') ||
              (noTest === true && record.testName === '') ||
              (noTestScore === true && record.testScore === '') ||
              (noStudentTest === true && record.testId === '') ||
              (noSchool === true && record.schoolName === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Orphaned Student Test Score Records',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('089', 'dcid');
        }
      };
    },
    OrphanedTeacherRace: function () {
      powerTools.wizardData = {
        title: 'Orphaned Teacher Race Wizard',
        name: 'Orphaned Teacher Race',
        header: 'Removing orphaned teacher race records in ' + powerTools.dataOptions.schoolName,
        info: 'Use this wizard to remove orphaned Teacher Race Records. This process will delete all Teacher Race ' +
        'records where the teacher or race code does not exist, based off the options selected.',
        options: {
          checkboxes: [
            {
              id: 'NoTeacher',
              text: 'Teacher does not exist'
            },
            {
              id: 'NoRaceCode',
              text: 'Race code does not exist'
            }
          ]
        },
        countRecords: function () {
          var noTeacher = $j('#NoTeacher').is(':checked'),
            noRaceCode = $j('#NoRaceCode').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noTeacher === true && record.teacher === '') ||
              (noRaceCode === true && record.raceCode === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Orphaned Teacher Race Records',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('202', 'dcid');
        }
      };
    },
    OrphanedTermBins: function () {
      var schoolOption;
      if (powerTools.dataOptions.schoolid === 0) {
        schoolOption = 'or school ';
      } else {
        schoolOption = '';
      }

      powerTools.wizardData = {
        title: 'Orphaned Termbins Wizard',
        name: 'Orphaned Termbins',
        header: 'Removing orphaned termbins records in ' + powerTools.dataOptions.schoolName,
        info: 'Use this wizard to remove orphaned Final Grade Setup Records. This process will delete all Final ' +
        'Grade Setup records where the term ' + schoolOption +
        'does not exist, based off the options ' +
        'selected.',
        options: {
          checkboxes: [
            {
              id: 'NoTerm',
              text: 'Term does not exist'
            },
            {
              id: 'NoSchool',
              text: 'School does not exist'
            }
          ]
        },
        countRecords: function () {
          var noTerm = $j('#NoTerm').is(':checked'),
            noSchool = $j('#NoSchool').is(':checked');
          $j(powerTools.dataSet).each(function (index, record) {
            if (
              (noTerm === true && record.term.indexOf('does not exist') > -1) ||
              (noSchool === true && record.schoolName === '')
            ) {
              record.flaggedrecord = 1;
            } else {
              record.flaggedrecord = 0;
            }
          });
          powerTools.countWizardResults();
        },
        buttonText: 'Remove Orphaned Termbins',
        action: function () {
          powerTools.currentRecord = 0;
          powerTools.drDelete('033', 'dcid');
        }
      };
    }
  },
  countWizardResults: function () {
    var records = 0;
    $j(powerTools.dataSet).each(function (index, result) {
      records += result.flaggedrecord;
    });
    $j('#recordcount').text(records);
    if (records > 0) {
      $j('#btnSubmit').removeAttr('disabled');
    } else {
      $j('#btnSubmit').attr('disabled', true);
    }
  },
  drDelete: function (tableNumber, referenceName) {
	if (!powerTools.dataOptions.deletePass) {
		powerTools.dataOptions.deletePass = $j('delsectionpassword').val();
	}
    powerTools.openLoadingBar();
    if (powerTools.dataSet[powerTools.currentRecord].flaggedrecord === 1) {
      $j.get('/admin/tech/usm/home.html', {
        'mcr': tableNumber +
        powerTools.dataSet[powerTools.currentRecord][referenceName]
      });
      $j.ajax({
        url: '/admin/selectiondeletedframed.html?ac=prim&DR-' + tableNumber +
        powerTools.dataSet[powerTools.currentRecord][referenceName] + '=delete&delsectionpassword=' +
		  powerTools.dataOptions.deletePass
      }).success(function () {
        powerTools.currentRecord++;
        if (powerTools.currentRecord === powerTools.dataSet.length) {
          powerTools.initReport(powerTools.dataOptions.reportid);
        } else {
          powerTools.drDelete(tableNumber, referenceName);
        }
      });
    } else {
      powerTools.currentRecord++;
      if (powerTools.currentRecord === powerTools.dataSet.length) {
        powerTools.initReport(powerTools.dataOptions.reportid);
      } else {
        powerTools.drDelete(tableNumber, referenceName);
      }
    }
  },
  loadWizard: function () {
    powerTools.wizardConfig[powerTools.dataOptions.reportid]();
    if (powerTools.wizardData.jsonUrl) {
      $j.getJSON(powerTools.wizardData.jsonUrl, function (result) {
        result.pop();
        powerTools.dataSet = result;
        powerTools.loadWizardPage();
      });
    } else {
      powerTools.loadWizardPage();
    }
  },
  loadWizardPage: function () {
    $j('#bcReportName').text(powerTools.wizardData.title);
    $j('#reportInfo').html('<p>' + powerTools.wizardData.info + '<p>In order to ensure the entegrity of your data, ' +
      'always make a datapump backup prior to running this wizard.');
    $j('h1').text(powerTools.wizardData.header);
    $j('#bottom_container').html('<span id="recordcount">0</span> record(s) selected<div class="button-row">' +
      '<button id="btnSubmit" disabled="disabled"></button>' +
      '</div>'
    );
    $j('#selectStudents').hide();
    $j('#btnSubmit').text(powerTools.wizardData.buttonText).click(function () {
      powerTools.wizardData.action();
    });
	$j('#paginated').html(null);
    $j('#wizardLink').html(null);
    if (powerTools.wizardData.options) {
      $j('#top_container').html(
        '<table class="linkDescList">' +
        '<thead>' +
        '<tr>' +
        '<th>Option</th>' +
        '<th>Value</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody id="wizardOptions">' +
        '</tbody>' +
        '</table>'
      );
      if (powerTools.wizardData.options.checkboxes) {
        $j('#wizardOptions').html(
          '<tr>' +
          '<td >' +
          '<label for="selectOptions">Remove records where</label>' +
          '</td>' +
          '<td style="text-align:left">' +
          '<fieldset id="selectOptions"></fieldset>' +
          '<input type="checkbox" id="CheckAll"><label for="CheckAll">Select / ' +
          'Deselect All</label>' +
          '</td>' +
          '</tr>'
        );
        $j(powerTools.wizardData.options.checkboxes).each(function () {
          $j('#selectOptions').append(
            '<span>' +
            ' <input type="checkbox" id="' + this.id + '">' +
            '<label for="' + this.id + '">' + this.text + '</label>' +
            '</span><br>'
          );
          if (powerTools.dataOptions.schoolid > 0) {
            $j('#NoSchool').attr('disabled', 'disabled');
            $j('[for=\'NoSchool\']').append(' (District Office only)');
          }
        });
      }
      if (powerTools.wizardData.options.checkboxNote) {
        $j('#wizardOptions').append(
          '<tr>' +
          '<td colspan="2" id="checkboxNote">' + powerTools.wizardData.options.checkboxNote + '</td>' +
          '</tr>'
        );
      }
      powerTools.selectAll();
      powerTools.checkWizardBox();
	  if (powerTools.wizardData.options.prompts) {
        var promptOptions;
		$j(powerTools.wizardData.options.prompts).each(function () {
		  promptOptions = promptOptions +
		  '<tr>' +
		  '<td><label>' + this.text + '</label></td>' +
		  '<td style="text-align:left"><input required type="text" id="' + this.id + '">' +
		  '</tr>';
		});
		$j('#wizardOptions').append(promptOptions);
	  }
    } else {
      $j('#top_container,#paginated,#selectOptions').html(null);
      powerTools.wizardData.countRecords();
    }
  }
};

YAHOO.widget.DataTable.prototype.getTdEl = function (cell) {
  var Dom = YAHOO.util.Dom, lang = YAHOO.lang, elCell, el = Dom.get(cell);
  if (el && (el.ownerDocument === document)) {
    if (el.nodeName.toLowerCase() !== 'td') {
      elCell = Dom.getAncestorByTagName(el, 'td');
    } else {
      elCell = el;
    }
    if (elCell && (elCell.parentNode.parentNode === this._elTbody)) {
      return elCell;
    }
  } else if (cell) {
    var oRecord, nColKeyIndex;
    //noinspection JSUnresolvedFunction,JSUnusedAssignment
    var elRow = this.getTrEl(oRecord);
    if (lang.isString(cell.columnKey) && lang.isString(cell.recordId)) {
      //noinspection JSUnusedAssignment
      oRecord = this.getRecord(cell.recordId);
      var oColumn = this.getColumn(cell.columnKey);
      if (oColumn) {
        nColKeyIndex = oColumn.getKeyIndex();
      }
    }
    if (cell.record && cell.column && cell.column.getKeyIndex) {
      //noinspection JSUnusedAssignment
      oRecord = cell.record;
      nColKeyIndex = cell.column.getKeyIndex();
    }
    if ((nColKeyIndex !== null) && elRow && elRow.cells && elRow.cells.length > 0) {
      return elRow.cells[nColKeyIndex] || null;
    }
  }
  return null;
};

$j(function () {
  $j(window).resize(function () {
    powerTools.detectHeaderState();
  });
  if (document.location.href.indexOf('admin/tech/PowerTools/ptstudentreport.html') === -1) {
    powerTools.initializeHomePage();
  } else {
    powerTools.initializeStudentPage();
  }
  powerTools.curYearOption();
  $j('#top_container,#bottom_container').bind('DOMNodeInserted DOMSubtreeModified DOMNodeRemoved', function () {
    powerTools.selectOptions();
  });
}).ajaxStart(function () {
  powerTools.openLoadingBar();
}).ajaxStop(function () {
  powerTools.activateLinks('#paginated');
  closeLoading();
});
