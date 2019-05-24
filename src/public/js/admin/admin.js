document.querySelectorAll('.columnAction span').forEach(e => e.addEventListener('click', e => {
    const dataProcess = e.target.closest('span').dataset.process;
    const process = dataProcess.split('-');
    const productId = dataProcess.slice(3);
    document.querySelector('.edit-modal').dataset.js_edit_id = process[1]; //anexar product id a editar/eliminar

    if(process[0] === 'del') {
        const item = document.querySelector(`[data-process="del${productId}"]`);
        if(item) document.querySelector('tbody').removeChild(item.parentElement.parentElement);
        axios.delete(`https://flutter-products-3e91e.firebaseio.com/products/${productId}.json`);
    } else if(process[0] === 'edt') {
        const cols = document.querySelector(`[data-process="edt${productId}"]`).parentElement.parentElement;
        const fields = document.querySelectorAll('.input100');
        let index = 1;
        fields.forEach(e => {
            e.value = cols.children[index].textContent;
            e.classList.add('has-val');
            index++;
        });

        // axios.get(`https://flutter-products-3e91e.firebaseio.com/products/${productId}.json`).then((res) => {
        //     cols.children[1]
        //
        // });
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
}));