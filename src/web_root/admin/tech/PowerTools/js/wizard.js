/**
 * Select the records from the currently selected table in DDA
 * @callback callback
 * @param {number} fieldNumber The field number of the field to search
 * @param {string} selectVal The value you are searching for
 * @param {string} modifyVal The value you are changing the field to
 * @param {callback} callback The value you are changing the field to
 */
function ddaSelectModify(fieldNumber, selectVal, modifyVal, callback) {
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
      currentRecord++;
      if (currentRecord === wizardData.length) {
        callback();
      } else {
        ddaSelectModify(fieldNumber, wizardData[currentRecord].badval, wizardData[currentRecord].goodval, callback);
      }
    });
  });
}

/**
 * Select and Delete records from DDA
 * @callback callback
 * @param {number} fieldNumber The number of the field in the table
 * @param {String} selectVal The value of the string you are searching for
 * @param {callback} callback The function to be executed upon completion
 */
function ddaSelectDelete(fieldNumber, selectVal, callback) {
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
      currentRecord++;
      if (currentRecord === wizardData.length) {
        callback();
      } else {
        ddaSelectDelete(fieldNumber, wizardData[currentRecord].badval, callback);
      }
    });
  });
}

/**
 * Performs the deletion of nonAtomicDrDelete
 * @param {string} tableNumber The table number of the record to be deleted
 */
function nonAtomicDRDeletion(tableNumber) {
  $j.ajax({
    url: '/admin/tech/usm/home.html?ac=prim&DR-' + tableNumber + wizardData[currentRecord].dcid + '=delete'
  }).success(function () {
    currentRecord++;
    if (currentRecord === wizardData.length) {
      $j.ajax({
        url: '/admin/tech/home.html',
        data: {
          ac: 'specop',
          btnSubmit: '',
          code: '',
          opname: 'setglobalatomicsync',
          p1: '',
          p2: '',
          specialopserver: '0'
        }
      }).success(function () {
        $j(window).ajaxStop(function () {
          wizardComplete();
        });
      });
    } else {
      nonAtomicDRDeletion(tableNumber);
    }
  });
}

/**
 * Turn sync to non-atomic, remove the records, then return sync to atomic mode
 * @param {string} tableNumber The 3 digit table number of the records to be removed
 */
function nonAtomicDrDelete(tableNumber) {
  loadingDialog();
  $j.ajax({
    url: '/admin/tech/home.html',
    data: {
      ac: 'specop',
      btnSubmit: '',
      code: '',
      opname: 'setglobalnonatomicsync',
      p1: '',
      p2: '',
      specialopserver: '0'
    }
  }).success(function () {
    atomicModeSet = 1;
    nonAtomicDRDeletion(tableNumber);
  });
}

/**
 * Select the table to of the records to be changed
 * @callback callback
 * @param {number} tableNumber The number of the table you are changing the records for.
 * @param {number} fieldNumber The number of the field you are searching for to delete
 * @param {callback} callback The function to execute once completed
 */
function ddaSelectTableDelete(tableNumber, fieldNumber, callback) {
  $j.ajax({
    url: '/admin/tech/usm/home.html',
    data: {
      filenum: tableNumber
    },
    async: false
  }).success(function () {
    ddaSelectDelete(fieldNumber, wizardData[currentRecord].badval, callback);
  });
}

/**
 * Select the table to of the records to be changed
 * @callback callback
 * @param {number} tableNumber The number of the table you are changing the records for.
 * @param {number} fieldNumber The number of the field you are changing
 * @param {callback} callback The function to execute once completed
 */
function ddaSelectTableModify(tableNumber, fieldNumber, callback) {
  $j.ajax({
    url: '/admin/tech/usm/home.html',
    data: {
      filenum: tableNumber
    },
    async: false
  }).success(function () {
    ddaSelectModify(fieldNumber, wizardData[currentRecord].badval, wizardData[currentRecord].goodval, callback);
  });
}

/**
 * Change the case of a field in the selected table
 * @param {number} fieldNumber The number of the field to be changed in the selected table
 */
function ddaChangeCase(fieldNumber) {
  $j.ajax({
    url: '/admin/tech/usm/home.html',
    data: {
      ac: 'usm',
      comparator1: '=',
      fieldnum_1: '1',
      search: 'Search all',
      value: wizardData[currentRecord].id
    }
  }).success(function () {
    $j.ajax({
      url: '/admin/tech/usm/home.html',
      data: {
        modify: 'Modify Selected Records',
        fieldnum: fieldNumber,
        modifytext: '_' + wizardData[currentRecord].badval
      }
    }).success(function () {
      $j.ajax({
        url: '/admin/tech/usm/home.html',
        data: {
          modify: 'Modify Selected Records',
          fieldnum: fieldNumber,
          modifytext: wizardData[currentRecord].goodval
        }
      }).success(function () {
        currentRecord++;
        if (currentRecord === wizardData.length) {
          $j.ajax({
            url: '/admin/tech/home.html',
            data: {
              ac: 'specop',
              btnSubmit: '',
              code: '',
              opname: 'setglobalatomicsync',
              p1: '',
              p2: '',
              specialopserver: '0'
            }
          }).success(function () {
            wizardComplete();
          });
        } else {
          ddaChangeCase(fieldNumber);
        }
      });
    });
  });
}

/**
 * Set Sync to non-atomic and select the table to of the records to be changed
 * @param {number} tableNumber The number of the table you are changing the records for.
 * @param {number} fieldNumber The number of the field you are changing
 */
function ddaSelectTableChangeCase(tableNumber, fieldNumber) {
  $j.ajax({
    url: '/admin/tech/home.html',
    data: {
      ac: 'specop',
      btnSubmit: '',
      code: '',
      opname: 'setglobalnonatomicsync',
      p1: '',
      p2: '',
      specialopserver: '0'
    }
  }).success(function () {
    $j.ajax({
      url: '/admin/tech/usm/home.html',
      data: {
        filenum: tableNumber
      },
      async: false
    }).success(function () {
      ddaChangeCase(fieldNumber);
    });
  });
}

var ptWizardData = {
  test: function () {
    pageOptions = {
      title: 'Blank Stored Grades Wizard'
    };
  },
  BlankStoredGradesWizard: function () {
    pageOptions = {
      title: 'Blank Stored Grades Wizard',
      name: 'Blank Stored Grade',
      header: 'Removing blank stored grades in ' + wizardOptions.schoolName,
      info: 'Use this wizard to remove blank stored grades. This wizard will remove all stored grades where the ' +
        'letter grade is blank, the percent is zero, and the comment is blank.',
      jsonURL: 'json/BlankStoredGradesWizard.json',
      buttonText: 'Remove Blank Stored Grades',
      action: function () {
        currentRecord = 0;
        drDelete('031');
      }
    };
  },
  DupAttendanceCodeWizard: function () {
    function correctAttendanceCodeEntity() {
      currentRecord = 0;
      ddaSelectTableDelete(163, 2, removeAttendanceCodes);
    }

    function removeAttendanceCodes() {
      currentRecord = 0;
      ddaSelectTableDelete(156, 1, wizardComplete);
    }

    pageOptions = {
      title: 'Duplicate Attendance Code Wizard',
      name: 'Duplicate Attendance Code',
      header: 'Repairing duplicate attendance code records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair duplicate attendance codes. This process will repair all attendance records, ' +
        'remove all attendance code categories from the duplicate attendance codes, then remove the duplicate ' +
        'attendance codes.',
      jsonURL: 'json/DupAttendanceCodeWizard.json',
      buttonText: 'Repair Duplicate Attendance Codes',
      action: function () {
        currentRecord = 0;
        ddaSelectTableModify(157, 2, correctAttendanceCodeEntity);
      }
    };
  },
  DupAttendanceConversionWizard: function () {
    function removeAttendanceConversionItems() {
      currentRecord = 0;
      ddaSelectTableDelete(132, 2, removeAttendanceCodes);
    }

    function removeAttendanceCodes() {
      currentRecord = 0;
      ddaSelectTableDelete(131, 1, wizardComplete);
    }

    pageOptions = {
      title: 'Duplicate Attendance Conversion Wizard',
      name: 'Duplicate Attendance Conversion',
      header: 'Repairing duplicate Attendance Conversions in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair duplicate Attendance Conversions. This process will correct the attendance ' +
        'conversion on the bell schedules, remove the attendance conversion items record for the duplicated ' +
        'attendance conversion, then delete the duplicated attendance conversion.',
      jsonURL: 'json/DupAttendanceConversionWizard.json',
      buttonText: 'Remove Duplicate Attendance Conversions',
      action: function () {
        currentRecord = 0;
        ddaSelectTableModify(133, 4, removeAttendanceConversionItems);
      }
    };
  },
  DupBellScheduleWizard: function () {
    function removeBellScheduleItems() {
      currentRecord = 0;
      ddaSelectTableDelete(134, 2, removeBellSchedules);
    }

    function removeBellSchedules() {
      currentRecord = 0;
      ddaSelectTableDelete(133, 1, wizardComplete);
    }

    pageOptions = {
      title: 'Duplicate Bell Schedules Wizard',
      name: 'Duplicate Bell Schedule',
      header: 'Repairing duplicate bell schedules in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair duplicate bell schedules. This process will repair all calendar records, then ' +
        'remove the duplicate bell schedules and bell schedule items.',
      jsonURL: 'json/DupBellScheduleWizard.json',
      buttonText: 'Remove Duplicate Bell Schedules',
      action: function () {
        currentRecord = 0;
        ddaSelectTableModify(51, 16, removeBellScheduleItems);
      }
    };
  },
  DupCalendarDayWizard: function () {
    pageOptions = {
      title: 'Duplicate Calendar Days Wizard',
      name: 'Duplicate Calendar Day',
      header: 'Repairing duplicate calendar day records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair duplicate calendar day records. This wizard will remove all duplicate ' +
        'calendar_day records.',
      jsonURL: 'json/DupCalendarDayWizard.json',
      buttonText: 'Remove Duplicate Calendar Days',
      action: function () {
        currentRecord = 0;
        drDelete('051');
      }
    };
  },
  DupDaysWizard: function () {
    function removeCycleDays() {
      currentRecord = 0;
      ddaSelectTableDelete(135, 1, wizardComplete);
    }

    pageOptions = {
      title: 'Duplicate Cycle Days Wizard',
      name: 'Duplicate Cycle Day',
      header: 'Repairing duplicate cycle day records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair duplicate cycle days. This process will repair all calendar day records, then ' +
        'remove the duplicate cycle days.',
      jsonURL: 'json/DupDaysWizard.json',
      buttonText: 'Remove Duplicate Cycle Days',
      action: function () {
        currentRecord = 0;
        ddaSelectTableModify(51, 15, removeCycleDays);
      }
    };

  },
  DupEntryCodesWizard: function () {
    pageOptions = {
      title: 'Duplicate Entry Codes Wizard',
      name: 'Duplicate Entry Code',
      header: 'Repairing duplicate entry code records in All Schools',
      info: 'Use this wizard to repair duplicate Entry Codes. This process will remove the duplicate Entry Codes.',
      jsonURL: 'json/DupEntryCodesWizard.json',
      buttonText: 'Remove Duplicate Entry Codes',
      action: function () {
        currentRecord = 0;
        drDelete('006');
      }
    };
  },
  DupExitCodesWizard: function () {
    pageOptions = {
      title: 'Duplicate Exit Codes Wizard',
      name: 'Duplicate Exit Code',
      header: 'Repairing duplicate entry code records in All Schools',
      info: 'Use this wizard to repair duplicate Exit Codes. This process will remove the duplicate Exit Codes.',
      jsonURL: 'json/DupExitCodesWizard.json',
      buttonText: 'Remove Duplicate Exit Codes',
      action: function () {
        currentRecord = 0;
        drDelete('006');
      }
    };
  },
  DupFTEWizard: function () {
    function correctReenrollments() {
      currentRecord = 0;
      ddaSelectTableModify(18, 21, correctFTEGrade);
    }

    function correctFTEGrade() {
      currentRecord = 0;
      ddaSelectTableModify(160, 2, correctAttendanceConversion);
    }

    function correctAttendanceConversion() {
      currentRecord = 0;
      ddaSelectTableModify(132, 7, removeFTE);
    }

    function removeFTE() {
      currentRecord = 0;
      drDelete('159');
    }

    pageOptions = {
      title: 'Duplicate FTE Wizard',
      name: 'Duplicate FTE',
      header: 'Repairing duplicate FTEs in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair duplicate FTEs. This process will correct the FTEs in the Students, ' +
        'Reenrollments, FTEGrade and Attendance Conversion tables, then remove the duplicate FTE.',
      jsonURL: 'json/DupFTEWizard.json',
      buttonText: 'Remove Duplicate FTEs',
      action: function () {
        currentRecord = 0;
        ddaSelectTableModify(1, 129, correctReenrollments);
      }
    };
  },
  DupGenWizard: function () {
    pageOptions = {
      title: 'Duplicate Gen Records Wizard',
      name: 'Duplicate Gen Records',
      header: 'Repairing duplicate gen records in All Schools',
      info: 'Use this wizard to repair duplicate gen records. This process will remove the duplicate gen records.',
      jsonURL: 'json/DupGenWizard.json',
      buttonText: 'Remove Duplicate Gen Records',
      action: function () {
        currentRecord = 0;
        drDelete('006');
      }
    };
  },
  DupPeriodNumberWizard: function () {
    function correctAttendanceQueue() {
      currentRecord = 0;
      ddaSelectTableModify(48, 18, correctAttendanceTaken);
    }

    function correctAttendanceTaken() {
      currentRecord = 0;
      ddaSelectTableModify(172, 4, correctBellSchedules);
    }

    function correctBellSchedules() {
      currentRecord = 0;
      ddaSelectTableModify(134, 3, removePeriods);
    }

    function removePeriods() {
      currentRecord = 0;
      ddaSelectTableDelete(138, 1, wizardComplete);
    }

    pageOptions = {
      title: 'Duplicate Periods Wizard',
      name: 'Duplicate Period',
      header: 'Repairing duplicate periods in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair duplicate periods. This process will repair all attendance, attendancequeue, ' +
        'attendance_taken, and bell schedule records, then remove the duplicate Periods.',
      jsonURL: 'json/DupPeriodNumberWizard.json',
      buttonText: 'Remove Duplicate Periods',
      action: function () {
        currentRecord = 0;
        ddaSelectTableModify(157, 8, correctAttendanceQueue);
      }
    };
  },
  DupPrefsWizard: function () {
    pageOptions = {
      title: 'Duplicate Preferences Wizard',
      name: 'Duplicate Preference',
      header: 'Repairing duplicate preference records in All Schools',
      info: 'Use this wizard to repair duplicate Preferences. This process will remove the duplicate Preferences.',
      jsonURL: 'json/DupPrefsWizard.json',
      buttonText: 'Remove Duplicate Preferences',
      action: function () {
        currentRecord = 0;
        drDelete('009');
      }
    };
  },
  DupServerConfigWizard: function () {
    pageOptions = {
      title: 'Duplicate Server Configuration Wizard',
      name: 'Duplicate Server Configuration',
      header: 'Repairing duplicate server configuration records',
      info: 'Use this wizard to repair duplicate server configuration records. This wizard will delete the ' +
        'duplicate records.',
      jsonURL: 'json/DupServerConfigWizard.json',
      buttonText: 'Remove Duplicate Server Config Records',
      action: function () {
        currentRecord = 0;
        drDelete('175');
      }
    };
  },
  DupServerInstanceWizard: function () {
    pageOptions = {
      title: 'Duplicate Server Instance Wizard',
      header: 'Repairing duplicate server instance records',
      info: 'Use this wizard to repair duplicate server instance records. This process will remove the duplicate ' +
        'server instance records.',
      jsonURL: 'json/DupServerInstanceWizard.json',
      buttonText: 'Remove Duplicate Server Instance Records',
      action: function () {
        currentRecord = 0;
        drDelete('177');
      }
    };
  },
  DupTermBinsWizard: function () {
    pageOptions = {
      title: 'Duplicate Final Grade Setups Wizard',
      name: 'Duplicate Final Grade Setup',
      header: 'Repairing duplicate final grade setups in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair duplicate final grade setups. This process will remove the duplicate Final ' +
        'Grade Setup items.',
      jsonURL: 'json/DupTermBinsWizard.json',
      buttonText: 'Remove Duplicate Final Grade Setups',
      action: function () {
        currentRecord = 0;
        drDelete('033');
      }
    };
  },
  DupTermsWizard: function () {
    pageOptions = {
      title: 'Duplicate Terms Wizard',
      name: 'Duplicate Term',
      header: 'Repairing duplicate terms records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair duplicate terms records. This process will turn the global sync to non-atomic,' +
        ' remove the duplicate term records, then turn the global sync back to atomic.',
      jsonURL: 'json/DupTermsWizard.json',
      buttonText: 'Remove Duplicate Terms',
      action: function () {
        currentRecord = 0;
        nonAtomicDrDelete('013');
      }
    };
  },
  InvCourseNumberCCWizard: function () {
    pageOptions = {
      title: 'CC Records with Incorrect Course Number Wizard',
      name: 'CC Records with Incorrect Course Number',
      header: 'Repairing CC Records with Incorrect Course Number records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair CC Records with incorrect case sensitivity. This process will change sync to ' +
        'non-atomic mode, correct the case sensitivity of the course number in the CC record, then change the sync ' +
        'back to atomic mode.',
      jsonURL: 'json/InvCourseCCWizard.json',
      buttonText: 'Repair Course Numbers',
      action: function () {
        currentRecord = 0;
        ddaSelectTableChangeCase(4, 17);
      }
    };
  },
  InvCourseNumberSectionsWizard: function () {
    pageOptions = {
      title: 'Section Records with Incorrect Course Number Wizard',
      name: 'Section Records with Incorrect Course Number',
      header: 'Repairing Section Records with Incorrect Section Number records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to repair Section Records with incorrect case sensitivity. This process will change ' +
        'sync to non-atomic mode, correct the case sensitivity of the Section number, then change the sync back to ' +
        'atomic mode.',
      jsonURL: 'json/InvCourseNumberSectionsWizard.json',
      buttonText: 'Repair Course Numbers',
      action: function () {
        currentRecord = 0;
        ddaSelectTableChangeCase(3, 3);
      }
    };
  },
  NonInSessionAttendanceWizard: function () {
    pageOptions = {
      title: 'Non-Session Attendance Wizard',
      name: 'Non-Session Attendance',
      header: 'Repairing attendance on non-session days in ' + wizardOptions.schoolName,
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
      jsonURL: 'json/NonInSessionAttendanceWizard.json',
      buttonText: 'Remove Non-Session Attendance',
      action: function () {
        currentRecord = 0;
        drDelete('157');
      }
    };
  },
  OrphanedAttendanceTimeWizard: function () {
    pageOptions = {
      title: 'Orphaned Attendance_Time Wizard',
      name: 'Orphaned Attendance_Time',
      header: 'Removing orphaned attendance_time records in All Schools',
      info: 'Use this wizard to remove orphaned attendance_time records. This process will delete all ' +
        'attendance_time records where the attendance record does not exist.',
      jsonURL: 'json/OrphanedAttendanceTimeWizard.json',
      buttonText: 'Remove Orphaned Attendance_Time Records',
      action: function () {
        currentRecord = 0;
        drDelete('158');
      }
    };
  },
  OrphanedCCWizard: function () {
    var schoolOption;
    if (dataOptions.schoolid === 0) {
      schoolOption = 'school, ';
    } else {
      schoolOption = '';
    }

    pageOptions = {
      title: 'Orphaned CC Record Wizard',
      name: 'Orphaned CC',
      header: 'Removing orphaned CC records in ' + wizardOptions.schoolName,
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
      jsonURL: 'json/OrphanedCCWizard.json',
      buttonText: 'Remove Orphaned CC Records',
      action: function () {
        currentRecord = 0;
        drDelete('004');
      }
    };
  },
  OrphanedFeeTransactionWizard: function () {
    var schoolOption;
    if (dataOptions.schoolid === 0) {
      schoolOption = ', school,';
    } else {
      schoolOption = '';
    }

    pageOptions = {
      title: 'Orphaned Fee Transaction Wizard',
      name: 'Orphaned Fee Transaction',
      header: 'Removing orphaned fee transaction records in ' + wizardOptions.schoolName,
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
      jsonURL: 'json/OrphanedFeeTransactionWizard.json',
      buttonText: 'Remove Orphaned Fee Transactions',
      action: function () {
        currentRecord = 0;
        drDelete('147');
      }
    };
  },
  OrphanedHonorRollWizard: function () {
    var schoolOption;
    if (dataOptions.schoolid === 0) {
      schoolOption = 'or school ';
    } else {
      schoolOption = '';
    }

    pageOptions = {
      title: 'Orphaned Honor Roll Wizard',
      name: 'Orphaned Honor Roll',
      header: 'Removing orphaned honor roll records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to remove orphaned honor roll records. This process will delete all honor roll records ' +
        'where the student ' + schoolOption + 'does not exist.',
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
      jsonURL: 'json/OrphanedHonorRollWizard.json',
      buttonText: 'Remove Orphaned Honor Roll Records',
      action: function () {
        currentRecord = 0;
        drDelete('034');
      }
    };
  },
  OrphanedPGFinalGradesWizard: function () {
    pageOptions = {
      title: 'Orphaned PGFinalGrade Wizard',
      name: 'Orphaned PGFinalGrade',
      header: 'Removing orphaned PGFinalGrade records in ' + wizardOptions.schoolName,
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
      jsonURL: 'json/OrphanedPGFinalGradesWizard.json',
      buttonText: 'Remove Orphaned PGFinalGrade Records',
      action: function () {
        currentRecord = 0;
        drDelete('095');
      }
    };
  },
  OrphanedReenrollmentsWizard: function () {
    var schoolOption;
    if (dataOptions.schoolid === 0) {
      schoolOption = 'or school ';
    } else {
      schoolOption = '';
    }

    pageOptions = {
      title: 'Orphaned Reenrollments Wizard',
      name: 'Orphaned Reenrollment',
      header: 'Removing orphaned Reenrollment records in ' + wizardOptions.schoolName,
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
      jsonURL: 'json/OrphanedReenrollmentsWizard.json',
      buttonText: 'Remove Orphaned Reenrollments',
      action: function () {
        currentRecord = 0;
        drDelete('018');
      }
    };
  },
  OrphanedSectionWizard: function () {
    var schoolOption;
    if (dataOptions.schoolid === 0) {
      schoolOption = 'school, ';
    } else {
      schoolOption = '';
    }

    pageOptions = {
      title: 'Orphaned Section Wizard',
      name: 'Orphaned Section',
      header: 'Removing orphaned Sections records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to remove orphaned Sections Records. This process will turn sync to non-atomic, ' +
        'delete all Sections records where the course, teacher, ' + schoolOption +
        'or term does not exist, based off the options ' +
        'selected, then turn sync back to atomic mode.',
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
          'assign these sections to another teacher.'
      },
      jsonURL: 'json/OrphanedSectionWizard.json',
      buttonText: 'Remove Orphaned Sections',
      action: function () {
        currentRecord = 0;
        nonAtomicDrDelete('003');
      }
    };
  },
  OrphanedSpEnrollmentsWizard: function () {
    var schoolOption;
    if (dataOptions.schoolid === 0) {
      schoolOption = 'school, ';
    } else {
      schoolOption = '';
    }

    pageOptions = {
      title: 'Orphaned Special Programs Wizard',
      name: 'Orphaned Special Program',
      header: 'Removing orphaned Special Programs records in ' + wizardOptions.schoolName,
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
      jsonURL: 'json/OrphanedSpEnrollmentsWizard.json',
      buttonText: 'Remove Orphaned Special Program Records',
      action: function () {
        currentRecord = 0;
        drDelete('041');
      }
    };
  },
  OrphanedStandardsGradesWizard: function () {
    var schoolOption;
    if (dataOptions.schoolid === 0) {
      schoolOption = ', school, ';
    } else {
      schoolOption = '';
    }

    pageOptions = {
      title: 'Orphaned Standards Grades Wizard',
      name: 'Orphaned Standards Grade',
      header: 'Removing orphaned Standards Grades records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to remove orphaned Standards Grades. This process will delete all Standard Grade ' +
        'records where the student' + schoolOption + 'or standard does not exist, based off the options selected.',
      options: {
        checkboxes: [
          {
            id: 'NoStudent',
            text: 'Student does not exist'
          },
          {
            id: 'NoStandard',
            text: 'Standard does not exist'
          },
          {
            id: 'NoSchool',
            text: 'School does not exist'
          }
        ]
      },
      jsonURL: 'json/OrphanedStandardsGradesWizard.json',
      buttonText: 'Remove Orphaned Standards Grades',
      action: function () {
        currentRecord = 0;
        drDelete('099');
      }
    };
  },
  OrphanedStoredGradesWizard: function () {
    pageOptions = {
      title: 'Orphaned Stored Grades Wizard',
      name: 'Orphaned Stored Grade',
      header: 'Removing orphaned Stored Grades records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to remove orphaned Stored Grades. This process will delete all Stored Grades records ' +
        'where the student does not exist. If you wish to manually correct any records, please do so prior to ' +
        'running this wizard.',
      jsonURL: 'json/OrphanedStoredGradesWizard.json',
      buttonText: 'Remove Orphaned Stored grades',
      action: function () {
        currentRecord = 0;
        drDelete('031');
      }
    };
  },
  OrphanedStudentRaceWizard: function () {
    pageOptions = {
      title: 'Orphaned Student Race Wizard',
      name: 'Orphaned Student Race',
      header: 'Removing orphaned Student race records in ' + wizardOptions.schoolName,
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
      jsonURL: 'json/OrphanedStudentRaceWizard.json',
      buttonText: 'Remove Orphaned Student Race Records',
      action: function () {
        currentRecord = 0;
        drDelete('201');
      }
    };
  },
  OrphanedStudentTestScoreWizard: function () {
    var schoolOption;
    if (dataOptions.schoolid === 0) {
      schoolOption = ', school, ';
    } else {
      schoolOption = '';
    }

    pageOptions = {
      title: 'Orphaned Student Test Scores Wizard',
      name: 'Orphaned Student Test Score',
      header: 'Removing orphaned Student Test Scores records in ' + wizardOptions.schoolName,
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
      jsonURL: 'json/OrphanedStudentTestScoreWizard.json',
      buttonText: 'Remove Orphaned Student Test Score Records',
      action: function () {
        currentRecord = 0;
        drDelete('089');
      }
    };
  },
  OrphanedTeacherRaceWizard: function () {
    pageOptions = {
      title: 'Orphaned Teacher Race Wizard',
      name: 'Orphaned Teacher Race',
      header: 'Removing orphaned teacher race records in ' + wizardOptions.schoolName,
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
      jsonURL: 'json/OrphanedTeacherRaceWizard.json',
      buttonText: 'Remove Orphaned Teacher Race Records',
      action: function () {
        currentRecord = 0;
        drDelete('202');
      }
    };
  },
  OrphanedTermBinsWizard: function () {
    var schoolOption;
    if (dataOptions.schoolid === 0) {
      schoolOption = 'or school ';
    } else {
      schoolOption = '';
    }

    pageOptions = {
      title: 'Orphaned Termbins Wizard',
      name: 'Orphaned Termbins',
      header: 'Removing orphaned termbins records in ' + wizardOptions.schoolName,
      info: 'Use this wizard to remove orphaned Final Grade Setup Records. This process will set sync to non-atomic, ' +
        'delete all Final Grade Setup records where the term ' + schoolOption +
        'does not exist, based off the options ' +
        'selected, then set sync back to atomic mode.',
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
      jsonURL: 'json/OrphanedTermBinsWizard.json',
      buttonText: 'Remove Orphaned Termbins',
      action: function () {
        currentRecord = 0;
        nonAtomicDrDelete('033');
      }
    };
  }
};