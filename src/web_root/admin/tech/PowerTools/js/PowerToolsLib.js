'use strict';

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
  }
};

$j(function () {
  $j('#top_container,#bottom_container').bind('DOMNodeInserted DOMSubtreeModified DOMNodeRemoved', function () {
    selectOptions();
  });
}).ajaxStart(function () {
  loadingDialog();
});
