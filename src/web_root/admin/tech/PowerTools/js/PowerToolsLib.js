'use strict';

/**
 * Converts a date to '0/0/0' if the date is 1/1/1900, otherwise sets the format to PowerSchool format.
 * @param {string} inputFormat The date string you are checking and converting
 */
function convertDate(inputFormat) {
  var isoExp = /^\s*(\d{4})-(\d\d)-(\d\d)\s*$/, date = new Date(NaN), month, parts = isoExp.exec(inputFormat);

  if (inputFormat === '1901-01-01') {
    return '0/0/0';
  } else {
    if (parts) {
      month = + parts[2];
      date.setFullYear(parts[1], month - 1, parts[3]);
      if (month !== date.getMonth() + 1) {git
        date.setTime(NaN);
      }
    }
    return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join('/');
  }
}

/**
 * Creates a selection of students
 * @param {string} action 'replace' or 'add' to the existing selection,
 */
function selectStudents(action) {
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
      closeLoading();
      $j('body').append('<div id="curSelectFail" title="Error"><p>There was an error making the students the current ' +
        'selection.</p></div >');
      $j('#curSelectFail').dialog();
    }
  });
}

/**
 * Creates the hidden inputs for the selection of students
 * @param {string} method
 */
function clickStudentSelects(method) {
  loadingDialog();
  $j.getJSON('json/' + dataOptions.reportid + '.json.html?curyearonly=" + dataOptions.curyearonly', function (result) {
    $j.each(result.ResultSet, function () {
      if (this.dcid) {
        $j('#StudentList').append('<li><a target="_top" href="/admin/students/home.html?frn=001' + this.dcid + '">' +
          this.student + '</a></li>');
        $j('#studentSelection').append('<input type="hidden" value="' + this.studentid + '"/>');
      }
    });
    selectStudents(method);
  });
}

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
    var elRow = this.getTrEl(oRecord);
    if (lang.isString(cell.columnKey) && lang.isString(cell.recordId)) {
      oRecord = this.getRecord(cell.recordId);
      var oColumn = this.getColumn(cell.columnKey);
      if (oColumn) {
        nColKeyIndex = oColumn.getKeyIndex();
      }
    }
    if (cell.record && cell.column && cell.column.getKeyIndex) {
      oRecord = cell.record;
      nColKeyIndex = cell.column.getKeyIndex();
    }
    if ((nColKeyIndex !== null) && elRow && elRow.cells && elRow.cells.length > 0) {
      return elRow.cells[nColKeyIndex] || null;
    }
  }
  return null;
};

function selectOptions() {
  $j('[name=maxlines],[name=curyearonly]').val('?curyearonly=' + dataOptions.curyearonly + '&maxlines=' +
    dataOptions.maxLines + '&reportname=' + dataOptions.reportid);
}

/**
 * Creates a hyperlink to a specific student page in the datatable
 * @param {variable} elCell Passed from YUI
 * @param {variable} oRecord Passed from YUI
 * @param {variable} oData Passed from YUI
 * @param {string} page The URL of the student page to visit
 * @param {string} idField The name of the field in the JSON string for the reference (DCID)
 */
function studentLink(elCell, oRecord, oData, page, idField) {
  var dcid = oRecord.getData(idField);
  elCell.innerHTML = '<a href="/admin/students/home.html?frn=001' + dcid +
    '&ac=suv;lsp=/admin/students/' + page + '" target=PowerTools>' + oData + '</a>';
}

/**
 * Creates a hyperlink to a specific admin page in the datatable
 * @param {string} elCell
 * @param {string} oRecord
 * @param {string} oData
 * @param {string} page
 * @param {string} idField
 */
function adminLink(elCell, oRecord, oData, page, idField) {
  var dcid = oRecord.getData(idField);
  elCell.innerHTML =
    '<a href="/admin/' + page + dcid + '" target=Powertools>' + oData + '</a>';
}

/**
 * Creates a link to a record in DDA or DDE in the datatable
 * @param {variable} elCell Passed from YUI
 * @param {variable} oRecord Passed from YUI
 * @param {variable} oData Passed from YUI
 * @param {string} tableNumber 3 Character table number of the table
 * @param {string} [idField] The field name of the reference ID (dcid)
 */
function ddaLink(elCell, oRecord, oData, tableNumber, idField) {
  var dcid;
  if (idField) {
    dcid = oRecord.getData(idField);
  } else {
    dcid = oRecord.getData('dcid');
  }
  if (dataOptions.DDAPagePerms === 'on') {
    elCell.innerHTML =
      '<a href="/admin/tech/usm/home.html?mcr=' + tableNumber + dcid + '" target=Powertools>' + oData + '</a>';
  } else {
    elCell.innerHTML =
      '<a href="/admin/tech/dde/home.html?mcr=' + tableNumber + dcid + '" target=Powertools>' + oData + '</a>';
  }
}

function existCheck(elCell, oRecord, oData, field, label) {
  var reference = oRecord.getData(field);
  if (!oData) {
    elCell.innerHTML = '<span class="errorField">' + label + ' ' + reference + ' does not exist</span>';
  } else {
    elCell.innerHTML = oData;
  }
}

var PowerTools = {
  templateCY: function () {
    return '{FirstPageLink} {PreviousPageLink} {PageLinks} {NextPageLink} {LastPageLink} ' +
      '<select name="maxlines" ONCHANGE="location = this.options[this.selectedIndex].value;">' +
      '<option value="?curyearonly=' + dataOptions.curyearonly + '&maxlines=25&reportname=' + dataOptions.reportid +
      '">25 Rows</option>' + '<option value="?curyearonly=' + dataOptions.curyearonly + '&maxlines=50&reportname=' +
      dataOptions.reportid + '">50 Rows</option>' + '<option value="?curyearonly=' + dataOptions.curyearonly +
      '&maxlines=100&reportname=' + dataOptions.reportid + '">100 Rows</option>' + '<option value="?curyearonly=' +
      dataOptions.curyearonly + '&maxlines=500&reportname=' + dataOptions.reportid + '">500 Rows</option>' +
      '<option value="?curyearonly=' + dataOptions.curyearonly + '&maxlines=100000&reportname=' + dataOptions.reportid +
      '">Max Rows</option>' + '</select> ' +
      '<select name="curyearonly" ONCHANGE="location = this.options[this.selectedIndex].value;">' +
      '<option value="?curyearonly=0&maxlines=' + dataOptions.maxLines + '&reportname=' + dataOptions.reportid +
      '">All Years</option>' + '<option value="?curyearonly=1&maxlines=' + dataOptions.maxLines + '&reportname=' +
      dataOptions.reportid + '">Current Year</option>' + '</select>';
  },
  templateNoCY: function () {
    return '{FirstPageLink} {PreviousPageLink} {PageLinks} {NextPageLink} {LastPageLink} ' +
      '<select name="maxlines" ONCHANGE="location = this.options[this.selectedIndex].value;">' +
      '<option value="?curyearonly=0&maxlines=25&reportname=' + dataOptions.reportid + '">25 Rows</option>' +
      '<option value="?curyearonly=0&maxlines=50&reportname=' + dataOptions.reportid + '">50 Rows</option>' +
      '<option value="?curyearonly=0&maxlines=100&reportname=' + dataOptions.reportid + '">100 Rows</option>' +
      '<option value="?curyearonly=0&maxlines=500&reportname=' + dataOptions.reportid + '">500 Rows</option>' +
      '<option value="?curyearonly=0&maxlines=100000&reportname=' + dataOptions.reportid + '">Max Rows</option>' +
      '</select> ';
  },
  templateNoOption: function () {
    return '';
  },
  templateCYOnly: function () {
    return '<B>Filter these reports for </b>' +
      '<select name="curyearonly" ONCHANGE="location = this.options[this.selectedIndex].value;">' +
      '<option value="?curyearonly=0&maxlines=' + dataOptions.maxLines + '&reportname=' + dataOptions.reportid +
      '">All Years</option>' + '<option value="?curyearonly=1&maxlines=' + dataOptions.maxLines + '&reportname=' +
      dataOptions.reportid + '">Current Year</option>' + '</select>';
  },
  ActivitiesLink: function (elCell, oRecord, oColumn, oData) {
    adminLink(elCell, oRecord, oData, 'activitiessetup/edit.html?frn=006', 'dcid');
  },
  AllEnrollmentsLink: function (elCell, oRecord, oColumn, oData) {
    studentLink(elCell, oRecord, oData, 'allenrollments.html', 'dcid');
  },
  AttCodeExistCheck: function (elCell, oRecord, oColumn, oData) {
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
  AttendanceLink: function (elCell, oRecord, oColumn, oData) {
    var dcid = oRecord.getData('dcid'),
      attendanceType = oRecord.getData('attendanceType');
    if (attendanceType === 'Meeting') {
      elCell.innerHTML = '<a href="/admin/students/home.html?frn=001' + dcid +
        '&ac=suv;lsp=/admin/attendance/view/meeting.html" target=Powertools>' + oData + '</a>';
    } else {
      elCell.innerHTML = '<a href="/admin/students/home.html?frn=001' + dcid +
        '&ac=suv;lsp=/admin/attendance/view/daily.html" target=Powertools>' + oData + '</a>';
    }
  },
  BellScheduleItemsLink: function (elCell, oRecord, oColumn, oData) {
    var dcid = oRecord.getData('bellScheduleItemsDcid'),
      id = oRecord.getData('bellScheduleItemsId'),
      schoolName = oRecord.getData('schoolName'),
      yearId = oRecord.getData('yearId');
    elCell.innerHTML =
      '<a href="/admin/schoolsetup/bellschedules/items.html?frn=133' + dcid + '&id=' + id + '&name=' + oData + ' at ' +
      schoolName + ' for ' + yearId + '" target=Powertools>' + oData + '</a>';
  },
  BlankDayFormat: function (elCell, oRecord, oColumn, oData) {
    if (oData) {
      elCell.innerHTML = oData;
    } else {
      elCell.innerHTML = '<span class="errorField">BLANK</span>';
    }
  },
  CalendarLink: function (elCell, oRecord, oColumn, oData) {
    var formattedDate = convertDate(oData);
    elCell.innerHTML = '<a href="/admin/schoolsetup/calendarsetup/calendarsetup.html?scheddate=' + formattedDate +
      '" target=Powertools>' + formattedDate + '</a>';
  },
  CCTermExistCheck: function (elCell, oRecord) {
    var termId1 = oRecord.getData('termId'),
      termId2 = oRecord.getData('ccTermId');
    if (!termId1) {
      elCell.innerHTML = '<span class="errorField">TermID ' + termId2 + ' does not exist</span>';
    } else {
      elCell.innerHTML = termId1;
    }
  },
  CourseGroupsLink: function (elCell, oRecord, oColumn, oData) {
    adminLink(elCell, oRecord, oData, 'coursegroups/edit.html?frn=006', 'dcid');
  },
  CourseSection: function (elCell, oRecord) {
    var courseNumber = oRecord.getData('courseNumber'),
      sectionNumber = oRecord.getData('sectionNumber');
    elCell.innerHTML = courseNumber + '.' + sectionNumber;
  },
  CourseSectionLink: function (elCell, oRecord) {
    var courseNumber = oRecord.getData('courseNumber'),
      sectionNumber = oRecord.getData('sectionNumber'),
      dcid = oRecord.getData('dcid');
    elCell.innerHTML =
      '<a href="/admin/sections/edit.html?frn=003' + dcid + '" target=PowerTools>' + courseNumber + '.' +
      sectionNumber + '</a>';
  },
  DateNoLink: function (elCell, oRecord, oColumn, oData) {
    if (oData === '1900-01-01') {
      elCell.innerHTML = '0/0/0';
    } else {
      elCell.innerHTML = convertDate(oData);
    }
  },
  DDAAttendanceLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '157', 'attendanceDcid');
  },
  DDAAttendanceTimeLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '158');
  },
  DDACCLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '004');
  },
  DDAFeeTransactionLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '147');
  },
  DDAHonorRollLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '034');
  },
  DDAPGFinalGradesLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '095');
  },
  DDAReenrollmentsLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '018');
  },
  DDASectionLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '003');
  },
  DDASpEnrollmentsLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '041');
  },
  DDAStandardsGradesLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '099');
  },
  DDAStoredGradesLink: function (elCell, oRecord, oColumn, oData) {
    elCell.innerHTML = '<a href="/admin/tech/usm/home.html?mcr=031' + oData + '" target=Powertools>' + oData + '</a>';
  },
  DDAStudentRaceLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '201');
  },
  DDAStudentsLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '001');
  },
  DDAStudentTestScoreLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '089');
  },
  DDATeacherRaceLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '202');
  },
  DDATermBinsLink: function (elCell, oRecord, oColumn, oData) {
    ddaLink(elCell, oRecord, oData, '033');
  },
  DDEAttendanceLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '157', 'attendanceDcid');
  },
  DDEAttendanceTimeLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '158');
  },
  DDECCLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '004');
  },
  DDEFeeTransactionLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '147');
  },
  DDEHonorRollLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '034');
  },
  DDEPGFinalGradesLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '095');
  },
  DDEReenrollmentsLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '018');
  },
  DDESectionLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '003');
  },
  DDESpEnrollmentsLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '041');
  },
  DDEStandardsGradesLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '099');
  },
  DDEStoredGradesLink: function (elCell, oRecord, oColumn, oData) {
    elCell.innerHTML = '<a href="/admin/tech/dde/home.html?mcr=031' + oData + '" target=Powertools>' + oData + '</a>';
  },
  DDEStudentRaceLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '201');
  },
  DDEStudentsLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '001');
  },
  DDEStudentTestScoreLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '089');
  },
  DDETeacherRaceLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '202');
  },
  DDETermBinsLink: function (elCell, oRecord, oColumn, oData) {
    ddeLink(elCell, oRecord, oData, '033');
  },
  DemographicsLink: function (elCell, oRecord, oColumn, oData) {
    studentLink(elCell, oRecord, oData, 'generaldemographics.html', 'dcid');
  },
  Demographics2Link: function (elCell, oRecord, oColumn, oData) {
    studentLink(elCell, oRecord, oData, 'generaldemographics.html', 'student2dcid');
  },
  DoesNotExist: function (elCell, oRecord, oColumn, oData) {
    if (oData.search('does not exist') > -1) {
      elCell.innerHTML = '<span class="errorField">' + oData + '</span>';
    } else {
      elCell.innerHTML = oData;
    }
  },
  EnrollmentDateNoLink: function (elCell, oRecord, oColumn, oData) {
    var date;
    if (oData) {
      date = convertDate(oData);
    } else {
      date = 'Not Enrolled';
    }
    elCell.innerHTML = date;
  },
  FeeExistCheck: function (elCell, oRecord, oColumn, oData) {
    existCheck(elCell, oRecord, oData, 'feeId', 'Fee ID');
  },
  GradeLevelValidCheck: function (elCell, oRecord, oColumn, oData) {
    var schoolId = oRecord.getData('schoolId'),
      schoolHighGrade = oRecord.getData('schoolHighGrade'),
      schoolLowGrade = oRecord.getData('schoolLowGrade'),
      schoolName = oRecord.getData('schoolName');
    if ((schoolId === '999999') && (oData !== '99')) {
      elCell.innerHTML =
        '<span class="errorField">Enrollment is at Graduated students, but grade level is ' + oData + '</span>';
    } else if (!schoolName || ((oData >= schoolLowGrade) && (oData <= schoolHighGrade))) {
      elCell.innerHTML = oData;
    } else {
      elCell.innerHTML =
        '<span class="errorField">' + schoolName + ' does not have a grade level of ' + oData + '</span> ';
    }
  },
  GradeScalesLink: function (elCell, oRecord, oColumn, oData) {
    adminLink(elCell, oRecord, oData, 'marks/editscale.html?frn=090', 'dcid');
  },
  GradYear: function (elCell, oRecord) {
    var gradYear = oRecord.getData('yearOfGraduation');
    if (gradYear === 0) {
      elCell.innerHTML = '<span class="errorField">Not set</span>';
    } else {
      elCell.innerHTML = gradYear;
    }
  },
  IncidentLink: function (elCell, oRecord, oColumn, oData) {
    adminLink(elCell, oRecord, oData, 'admin/incidents/incidentlog.html?id=', 'incidentId');
  },
  InvalidGPAPoints: function (elCell, oRecord) {
    var gpa = oRecord.getData('gpaPoints'),
      expGpa = oRecord.getData('gradePoints');
    if (gpa !== expGpa) {
      elCell.innerHTML = '<span class="errorField">' + gpa + ' / ' + expGpa + '</span>';
    } else {
      elCell.innerHTML = gpa + ' / ' + expGpa;
    }
  },
  InvalidGrade: function (elCell, oRecord) {
    var lGrade = oRecord.getData('grade'),
      expLGrade = oRecord.getData('gradescaleGrade');
    if (lGrade !== expLGrade) {
      elCell.innerHTML = '<span class="errorField">' + lGrade + ' / ' + expLGrade + '</font>';
    } else {
      elCell.innerHTML = lGrade + ' / ' + expLGrade;
    }
  },
  LogEntryLink: function (elCell, oRecord, oColumn, oData) {
    var dcid = oRecord.getData('dcid'),
      logDcid = oRecord.getData('logdcid');
    elCell.innerHTML =
      '<a href="/admin/students/home.html?frn=001' + dcid + '&ac=suv;lsp=/admin/students/customlogentry.html?frn=008' +
      logDcid + '&studentfrn=001' + dcid + '" target=Powertools>' + oData + '</a>';
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
  NextSchool: function (elCell, oRecord) {
    var nextSchoolName = oRecord.getData('nextSchoolName');
    var nextSchoolNumber = oRecord.getData('nextSchoolID');
    if (!nextSchoolName && nextSchoolNumber === '0') {
      elCell.innerHTML = '<span class="errorField">Not set</span>';
    } else if (!nextSchoolName && nextSchoolNumber !== '0') {
      elCell.innerHTML = '<span class="errorField">School number ' + nextSchoolNumber + ' does not exist</span>';
    } else {
      elCell.innerHTML = nextSchoolName;
    }
  },
  NotSpecifiedError: function (elCell, oRecord, oColumn, oData) {
    if (oData === 'Not Specified') {
      elCell.innerHTML = '<span class="errorField">Not Specified</span>';
    } else {
      elCell.innerHTML = oData;
    }
  },
  OverviewCount: function (elCell, oRecord, oColumn, oData) {
    var forcedTotal = oRecord.getData('forcedTotal');
    if (forcedTotal) {
      elCell.innerHTML =
        ('<a href="report.html?curyearonly=' + dataOptions.curyearonly + '&maxlines=' + dataOptions.maxLines +
          '&reportname=' + dataOptions.reportid + '">' + forcedTotal + '</a>');
    } else {
      $j.getJSON('json/' + oData + '.json.html?curyearonly=' + dataOptions.curyearonly, function (result) {
        result.ResultSet.pop();
        elCell.innerHTML =
          ('<a href="report.html?curyearonly=' + dataOptions.curyearonly + '&maxlines=' + dataOptions.maxLines +
            '&reportname=' + oData + '">' + result.ResultSet.length + '</a>');
      });
    }
  },
  OverviewLink: function (elCell, oRecord, oColumn, oData) {
    var reportName = oRecord.getData('reportName');
    elCell.innerHTML =
      ('<a href="report.html?curyearonly=' + dataOptions.curyearonly + '&maxlines=' + dataOptions.maxLines +
        '&reportname=' + reportName + '">' + oData + '</a>');
  },
  PeriodExistCheck: function (elCell, oRecord, oColumn, oData) {
    existCheck(elCell, oRecord, oData, 'periodId', 'Period ID');
  },
  PreviousGradesLink: function (elCell, oRecord, oColumn, oData) {
    studentLink(elCell, oRecord, oData, 'previousgrades.html', 'dcid');
  },
  ProgramExistCheck: function (elCell, oRecord, oColumn, oData) {
    existCheck(elCell, oRecord, oData, 'programId', 'Program ID');
  },
  RaceCodeExistCheck: function (elCell, oRecord, oColumn, oData) {
    existCheck(elCell, oRecord, oData, 'raceCodeId', 'Race code');
  },
  ReportsLink: function (elCell, oRecord, oColumn, oData) {
    var dcid = oRecord.getData('dcid'),
      type = oRecord.getData('reportType');
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
    studentLink(elCell, oRecord, oData, 'schedulesetup.html', 'dcid');
  },
  SchoolExistCheck: function (elCell, oRecord) {
    var school = oRecord.getData('schoolName'),
      schoolNumber = oRecord.getData('schoolId');
    if (schoolNumber === '0') {
      elCell.innerHTML = 'District Office';
    } else if (!school) {
      elCell.innerHTML = '<span class="errorField">School number ' + schoolNumber + ' does not exist</span>';
    } else {
      elCell.innerHTML = school;
    }
  },
  SchoolExistNoDistrictCheck: function (elCell, oRecord) {
    var school = oRecord.getData('schoolName'),
      schoolNumber = oRecord.getData('schoolId');
    if (schoolNumber === '0') {
      elCell.innerHTML = '<span class="errorField">District Office should not have these records</span>';
    } else if (!school) {
      elCell.innerHTML = '<span class="errorField">School number ' + schoolNumber + ' does not exist</span>';
    } else {
      elCell.innerHTML = school;
    }
  },
  SectionTermExistCheck: function (elCell, oRecord) {
    var termId1 = oRecord.getData('schoolTermId'),
      termId2 = oRecord.getData('sectionTermId');
    if (!termId1) {
      elCell.innerHTML = '<span class="errorField">TermID ' + termId2 + ' does not exist</span>';
    } else {
      elCell.innerHTML = termId1;
    }
  },
  SpecialProgramsLink: function (elCell, oRecord, oColumn, oData) {
    studentLink(elCell, oRecord, oData, 'specialprograms.html', 'dcid');
  },
  StandardExistCheck: function (elCell, oRecord, oColumn, oData) {
    existCheck(elCell, oRecord, oData, 'standardId', 'Standard ID');
  },
  StandardsLink: function (elCell, oRecord, oColumn, oData) {
    adminLink(elCell, oRecord, oData, '/standards/editstandard.html?frn=053', 'dcid');
  },
  StdConversionLink: function (elCell, oRecord, oColumn, oData) {
    adminLink(elCell, oRecord, oData, 'stdconversiontable/editscale.html?frn=006', 'dcid');
  },
  StudentExistCheck: function (elCell, oRecord, oColumn, oData) {
    existCheck(elCell, oRecord, oData, 'studentId', 'Student ID');
  },
  TeacherEditLink: function (elCell, oRecord, oColumn, oData) {
    adminLink(elCell, oRecord, oData, 'faculty/home.html?frn=005', 'dcid');
  },
  TeacherEdit2Link: function (elCell, oRecord, oColumn, oData) {
    adminLink(elCell, oRecord, oData, 'faculty/home.html?frn=005', 'teacher2dcid');
  },
  TeacherExistCheck: function (elCell, oRecord, oColumn, oData) {
    existCheck(elCell, oRecord, oData, 'teacherId', 'Teacher ID');
  },
  TestExistCheck: function (elCell, oRecord, oColumn, oData) {
    var testId = oRecord.getData('testId'),
      studentTestId = oRecord.getData('studentTestId');
    if (!testId) {
      elCell.innerHTML = '<span class="errorField">StudentTestID ' + studentTestId + ' does not exist</span>';
    } else if (!oData) {
      elCell.innerHTML = '<span class="errorField">Test ID ' + testId + ' does not exist</span>';
    } else {
      elCell.innerHTML = oData;
    }
  },
  TestScoreExistCheck: function (elCell, oRecord, oColumn, oData) {
    existCheck(elCell, oRecord, oData, 'testScoreId', 'Test Score ID');
  },
  TransactionsLink: function (elCell, oRecord, oColumn, oData) {
    studentLink(elCell, oRecord, oData, 'transactions.html', 'dcid');
  },
  TransferInfoLink: function (elCell, oRecord, oColumn, oData) {
    studentLink(elCell, oRecord, oData, 'transferinfo.html', 'dcid');
  }
};

$j(function () {
  $j('#top_container,#bottom_container').bind('DOMNodeInserted DOMSubtreeModified DOMNodeRemoved', function () {
    selectOptions();
  });
}).ajaxStart(function () {
  loadingDialog();
});
