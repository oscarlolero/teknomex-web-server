// let socket = io();
//EXPORT TO EXCEL
var wb = XLSX.utils.table_to_book(document.querySelector('table'), {sheet:"Sheet JS"});
var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});
function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}
document.querySelector('.export-excel').addEventListener('click', e => {
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'University Schedules.xlsx');
});

document.querySelector('.copy-clipboard').addEventListener('click', e => {
    selectElementContents(document.querySelector('table'));
});

document.querySelector('.print').addEventListener('click', e => {
    printData(document.querySelector('table'));
});

const selectElementContents = (el) => {
    var body = document.body, range, sel;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
        try {
            range.selectNodeContents(el);
            sel.addRange(range);
        } catch (e) {
            range.selectNode(el);
            sel.addRange(range);
        }
        document.execCommand('copy');
    } else if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(el);
        range.select();
        document.execCommand('copy');
    }
}

const printData = (el) => {
   var divToPrint= el;
   newWin= window.open("");
   newWin.document.write(divToPrint.outerHTML);
   newWin.print();
   newWin.close();
}
//TABLE
(function ($) {
	"use strict";
	$('.column100').on('mouseover',function(){
		var table1 = $(this).parent().parent().parent();
		var table2 = $(this).parent().parent();
		var verTable = $(table1).data('vertable')+"";
		var column = $(this).data('column') + ""; 

		$(table2).find("."+column).addClass('hov-column-'+ verTable);
		$(table1).find(".row100.head ."+column).addClass('hov-column-head-'+ verTable);
	});

	$('.column100').on('mouseout',function(){
		var table1 = $(this).parent().parent().parent();
		var table2 = $(this).parent().parent();
		var verTable = $(table1).data('vertable')+"";
		var column = $(this).data('column') + ""; 

		$(table2).find("."+column).removeClass('hov-column-'+ verTable);
		$(table1).find(".row100.head ."+column).removeClass('hov-column-head-'+ verTable);
	});
    

})(jQuery);