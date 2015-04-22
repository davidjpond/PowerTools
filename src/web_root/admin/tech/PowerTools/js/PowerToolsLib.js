'use strict';

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

function selectOptions


$j(function () {
  $j('#top_container,#bottom_container').bind('DOMNodeInserted DOMSubtreeModified DOMNodeRemoved', function () {
    selectOptions();
  });
}).ajaxStart(function () {
  loadingDialog();
});
