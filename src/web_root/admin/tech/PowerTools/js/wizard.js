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
  }
};