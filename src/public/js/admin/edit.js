let socket = io();

socket.on('connect', () => {
	console.log('Conectado');
});

document.querySelector('.btn-add').addEventListener('click', () => {
    const type = document.querySelector('.js_global_container').dataset.type;
    let numInputElements;
    let fieldsArray = [];

    switch (type) {
        case 'departments': {
            numInputElements = 1;
        break
        }

        case 'professors': {
            numInputElements = 4;
            //Leer departamento
            fieldsArray.push(parseInt($('.input100-select').find(':selected').data('dep_id')));
            //Leer si es admin
            if(document.querySelector('.btn-group-toggle').children[1].classList.contains('active')) {
                fieldsArray.push(1);
            } else {
                fieldsArray.push(0);
            }
        break;
        }

        case 'courses': {
            numInputElements = 2;
        }
        break;

        case 'periods': {
            numInputElements = 2;
        }
        break;

        case 'timeblocks': {
            numInputElements = 0;
            let [field1, field2] = [document.getElementById(`field1`), document.getElementById(`field2`)];
            fieldsArray.push(getBlockMins(field1.value));
            fieldsArray.push(getDaysAWeekBooleans(field2.value));
            fieldsArray.push(`${field1.value} ${getDaysAWeek(...getDaysAWeekBooleans(field2.value))}`);

        }
        break;
        
        case 'classrooms': {
            numInputElements = 3;
            if(document.querySelector('.btn-group-toggle').children[1].classList.contains('active')) {
                fieldsArray.push(1);
            } else {
                fieldsArray.push(0);
            }
       break;
        }

        case 'schedules': {
            numInputElements = 0;
            //Leer selects
            fieldsArray.push(parseInt($('.insert-modal .s1').find(':selected').data('pro_id')));
            fieldsArray.push(parseInt($('.insert-modal .s2').find(':selected').data('cou_id')));
            fieldsArray.push(parseInt($('.insert-modal .s3').find(':selected').data('per_id')));
            fieldsArray.push(parseInt($('.insert-modal .s4').find(':selected').data('tim_id')));
            fieldsArray.push(parseInt($('.insert-modal .s5').find(':selected').data('cla_id')));
        break;
        }

        default: return console.log('Error at processing container type.');
        break;
    }

    for(let i = 0; i < numInputElements; i++) {
        fieldsArray.push(document.getElementById(`field${i+1}`).value);
    }

    console.log(fieldsArray);
    socket.emit('insertRow', {
        type,
        fieldsArray
    }, (msg) => {
        location.reload();
        $('#addModal').modal('hide');
    });
});

document.querySelector('.btn-edit').addEventListener('click', () => {
    const type = document.querySelector('.js_global_container').dataset.type;
    
    let numInputElements;
    let fieldsArray = [];

    switch (type) {
        case 'departments': {
            numInputElements = 1;
            break;
        }

        case 'professors': {
            numInputElements = 4;
            //Leer departamento
            fieldsArray.push(parseInt($('.input100-select-edit').find(':selected').data('dep_id')));
            //Leer si es admin
            if(document.querySelector('.edit-modal .btn-group-toggle').children[1].classList.contains('active')) {
                fieldsArray.push(1);
            } else {
                fieldsArray.push(0);
            }
            break;
        }

        case 'courses': {
            numInputElements = 2;
            break;
        }

        case 'periods': {
            numInputElements = 2;
            break;
        }

        case 'timeblocks': {
            numInputElements = 0;
            let [field1, field2] = [document.getElementById(`efield1`), document.getElementById(`efield2`)];
            fieldsArray.push(getBlockMins(field1.value));
            fieldsArray.push(getDaysAWeekBooleans(field2.value));
            fieldsArray.push(`${field1.value} ${getDaysAWeek(...getDaysAWeekBooleans(field2.value))}`);
            break;
        }

        case 'classrooms': {
            numInputElements = 3;

            if(document.querySelector('.edit-modal .btn-group-toggle').children[1].classList.contains('active')) {
                fieldsArray.push(1);
            } else {
                fieldsArray.push(0);
            }
            break;
        }

        case 'schedules': {
            numInputElements = 0;
            //Leer selects
            fieldsArray.push(parseInt($('.edit-modal .s1').find(':selected').data('pro_id')));
            fieldsArray.push(parseInt($('.edit-modal .s2').find(':selected').data('cou_id')));
            fieldsArray.push(parseInt($('.edit-modal .s3').find(':selected').data('per_id')));
            fieldsArray.push(parseInt($('.edit-modal .s4').find(':selected').data('tim_id')));
            fieldsArray.push(parseInt($('.edit-modal .s5').find(':selected').data('cla_id')));
            break;
        }

        default: return console.log('Error at processing container type.');
        break;
    }

    for(let i = 0; i < numInputElements; i++) {
        fieldsArray.push(document.getElementById(`efield${i+1}`).value);
    }

    console.log(fieldsArray);
    socket.emit('updateRow', {
        type,
        fieldsArray,
        id: document.querySelector('.edit-modal').dataset.js_edit_id
    }, (msg) => {
        location.reload();
        $('#editModal').modal('hide');
    });
});

document.querySelectorAll('.columnAction span').forEach(e => e.addEventListener('click', e => {
	
    const process = e.target.closest('span').dataset.process.split('-');
    document.querySelector('.edit-modal').dataset.js_edit_id = process[1];

	if(process[0] === 'delete') {
		const type = document.querySelector('.js_global_container').dataset.type;
		const item = document.querySelector(`[data-process="delete-${process[1]}"]`);
		if(item) document.querySelector('tbody').removeChild(item.parentElement.parentElement);
		
		socket.emit('deleteRow', {
			type,
			id: process[1]
		}, () => {
			// console.log('Deleted');
		});
	} else if(process[0] === 'edit') {

        const cols = document.querySelector(`[data-process="edit-${process[1]}"]`).parentElement.parentElement;
        const type = document.querySelector('.js_global_container').dataset.type;
    
        switch (type) {
            case 'departments': {
                const selector = document.getElementById('efield1');
                selector.value = cols.children[0].textContent.trim();
                selector.classList.add('has-val');
            break;
            }
    
            case 'professors': {
                //Get list of departments and select the actual department
                const selectSelector = document.querySelector('.input100-select-edit');
                socket.emit('getDepartments', {
                }, (departments) => {
                    while (selectSelector.firstChild) {
                        selectSelector.removeChild(selectSelector.firstChild);
                    } 
                    let markup = '';
                    departments.forEach((e, index) => {
                        markup = markup.concat(`<option value="${index}" data-dep_id="${e.department_id}">${e.descr}</option>`);
                    });
                    selectSelector.insertAdjacentHTML('beforeend', markup);

                    for(let i = 0; i <= selectSelector.childElementCount - 1; i++) {
                        if(cols.children[1].textContent == selectSelector.children[i].textContent) {
                            selectSelector.value = i;
                        }
                    }
                });

                //Get inputs
                //Get first and last name   
                socket.emit('getProfessorName', {
                    professor_id: document.querySelector('.edit-modal').dataset.js_edit_id
                }, (professorRow) => {
                    const [fistNameField, lastNameField] = [document.getElementById('efield1'), document.getElementById('efield2')];
                    fistNameField.value = professorRow[0].first_name;
                    lastNameField.value = professorRow[0].last_name;
                    fistNameField.classList.add('has-val');
                    lastNameField.classList.add('has-val');
                });

                //Get username and password
                const [usernameField, passwordField] = [document.getElementById('efield3'), document.getElementById('efield4')];
                usernameField.value = cols.children[2].textContent.trim();
                passwordField.value = cols.children[3].textContent.trim();
                usernameField.classList.add('has-val');
                passwordField.classList.add('has-val');

                //Select if is admin or not
                const isAdminSelector = document.querySelector('.edit-modal .btn-group-toggle');
                if(cols.children[4].textContent.trim() === 'Yes') {
                    isAdminSelector.children[0].classList.remove('active');
                    isAdminSelector.children[1].classList.add('active');
                } else {
                    isAdminSelector.children[0].classList.add('active');
                    isAdminSelector.children[1].classList.remove('active');            
                }
            break;
            }
    
            case 'courses': {
                const [codeSelector, courseSelector] = [document.getElementById('efield1'), document.getElementById('efield2')];
                codeSelector.value = cols.children[0].textContent.trim();
                courseSelector.value = cols.children[1].textContent.trim();
                codeSelector.classList.add('has-val');
                courseSelector.classList.add('has-val');
            break;
            }

            case 'periods': {
                const [periodSelector, dateSelector] = [document.getElementById('efield1'), document.getElementById('efield2')];
                periodSelector.value = cols.children[0].textContent.trim();
                periodSelector.classList.add('has-val');

                dateSelector.value = `${cols.children[1].textContent.trim()} to ${cols.children[2].textContent.trim()}`;
                dateSelector.classList.add('has-val');

            break;
            }

            case 'timeblocks': {
                const [timeblockSelector, daysAWeekSelector] = [document.getElementById('efield1'), document.getElementById('efield2')];
                timeblockSelector.value = cols.children[0].textContent.trim();
                daysAWeekSelector.value = cols.children[1].textContent.trim();
                timeblockSelector.classList.add('has-val');
                daysAWeekSelector.classList.add('has-val');
            break;
            }

            case 'classrooms': {
                const [classroomSelector, seatcountSelector, hasproyectorSelector, buildingSelector] = [
                    document.getElementById('efield1'), 
                    document.getElementById('efield2'), 
                    document.querySelector('.edit-modal .btn-group-toggle'),
                    document.getElementById('efield3')
                ];

                classroomSelector.value = cols.children[0].textContent.trim();
                seatcountSelector.value = cols.children[1].textContent.trim();
                hasproyectorSelector.value = cols.children[2].textContent.trim();
                buildingSelector.value = cols.children[3].textContent.trim();

                if(cols.children[2].textContent.trim() === 'Yes') {
                    hasproyectorSelector.children[0].classList.remove('active');
                    hasproyectorSelector.children[1].classList.add('active');
                } else {
                    hasproyectorSelector.children[0].classList.add('active');
                    hasproyectorSelector.children[1].classList.remove('active');            
                }

                classroomSelector.classList.add('has-val');
                seatcountSelector.classList.add('has-val');
                buildingSelector.classList.add('has-val');
            break;
            }

            case 'schedules': {
                let selector = document.querySelectorAll('.edit-modal .input100-select-edit');
                socket.emit('getScheduleData', {
                }, (data) => {
                    let markup;
                    Object.values(data).forEach((element, i) => {
                        while(selector[i].firstChild) {
                            selector[i].removeChild(selector[i].firstChild);
                        }
                    });
                    
                    //Rellenar y pre selecionnar selects 
                    markup = '<option value="0">Select professor...</option>';
                    Object.values(data.professorsData).forEach((e, i) => {
                        markup = markup.concat(`<option value="${i+1}" data-pro_id="${e.professor_id}">${e.professor_name}</option>`);
                    });
                    selector[0].insertAdjacentHTML('beforeend', markup);
                    for(let i = 0; i <= selector[0].childElementCount - 1; i++) {
                        if(cols.children[0].textContent.trim() == selector[0].children[i].textContent.trim()) {
                            selector[0].value = i;
                        }
                    }

                    markup = '<option value="0">Select course...</option>';
                    Object.values(data.coursesData).forEach((e, i) => {
                        markup = markup.concat(`<option value="${i+1}" data-cou_id="${e.course_id}">${e.course_name}</option>`);
                    });
                    selector[1].insertAdjacentHTML('beforeend', markup);
                    for(let i = 0; i <= selector[1].childElementCount - 1; i++) {
                        if(`${cols.children[1].textContent.trim()} ${cols.children[2].textContent.trim()}` == selector[1].children[i].textContent.trim()) {
                            selector[1].value = i;
                        }
                    }

                    markup = '<option value="0">Select period...</option>';
                    Object.values(data.periodsData).forEach((e, i) => {
                        markup = markup.concat(`<option value="${i+1}" data-per_id="${e.period_id}">${e.period_name}</option>`);
                    });
                    selector[2].insertAdjacentHTML('beforeend', markup);
                    for(let i = 0; i <= selector[2].childElementCount - 1; i++) {
                        if(cols.children[3].textContent.trim() == selector[2].children[i].textContent.trim()) {
                            selector[2].value = i;
                        }
                    }
        
                    markup = '<option value="0">Select time block...</option>';
                    Object.values(data.timeblocksData).forEach((e, i) => {
                        markup = markup.concat(`<option value="${i+1}" data-tim_id="${e.time_block_id}">${e.time_block_name}</option>`);
                    });
                    selector[3].insertAdjacentHTML('beforeend', markup);
                    for(let i = 0; i <= selector[3].childElementCount - 1; i++) {
                        if(cols.children[4].textContent.trim() == selector[3].children[i].textContent.trim()) {
                            selector[3].value = i;
                        }
                    }
        
                    markup = '<option value="0">Select classroom...</option>';
                    Object.values(data.classroomsData).forEach((e, i) => {
                        markup = markup.concat(`<option value="${i+1}" data-cla_id="${e.classroom_id}">${e.classroom_name}</option>`);
                    });
                    selector[4].insertAdjacentHTML('beforeend', markup);
                    for(let i = 0; i <= selector[4].childElementCount - 1; i++) {
                        if(`${cols.children[5].textContent.trim()} (${cols.children[6].textContent.trim()})` == selector[4].children[i].textContent.trim()) {
                            selector[4].value = i;
                        }
                    }

                });
  
            break;
            }

            default: return console.log('Error at processing container type.');
            break;
        }
	} else {
		console.log('Error processing click action.');
	}
}));

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

//Login page styling
(function ($) {
    "use strict";


    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })
  
  
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.btn-validate').on('click',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    
})(jQuery);

const getBlockMins = (timeblock) => {
    let separatedHours = [...timeblock.split(' - ')];
    let [beginTime, endTime] = [[...separatedHours[0].split(':')], [...separatedHours[1].split(':')]];
    let [beginMins, endMins] = [parseInt(beginTime[0]) * 60 + parseInt(beginTime[1]),  parseInt(endTime[0]) * 60 + parseInt(endTime[1])];

    return [beginMins, endMins];
};

const getDaysAWeekBooleans = (days) => {
    let separatedDays = days.split(',').map(e => e.trim().toLowerCase());
    
    return [
        separatedDays.indexOf('mon') != -1 ? 1 : 0,
        separatedDays.indexOf('tue') != -1 ? 1 : 0,
        separatedDays.indexOf('wed') != -1 ? 1 : 0,
        separatedDays.indexOf('thu') != -1 ? 1 : 0,
        separatedDays.indexOf('fri') != -1 ? 1 : 0,
        separatedDays.indexOf('sat') != -1 ? 1 : 0
    ];
};

const getDaysAWeek = (mon, tue, wed, thu, fri, sat) => {
    return [
        mon ? 'Mon' : '',
        tue ? 'Tue' : '',
        wed ? 'Wed' : '',
        thu ? 'Thu' : '',
        fri ? 'Fri' : '',
        sat ? 'Sat' : '',
    ].filter(el => el != '').join(', ');
};

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
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'Admin table.xlsx');
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