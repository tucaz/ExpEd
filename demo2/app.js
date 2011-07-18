$(document).ready( function () {
    var editor = new expEd.Editor({
        expressionContainer: $('#expression'),
        operators: ['+','-','/','%','*']
    });

    editor.onError( function(msg) {
        alert(msg)
    });

    $('#add-token').click( function(e) {
        $('#values option:selected').each( function() {
            editor.addToken($(this).val());
        });

    });

    $('#add-op').click( function(e) {
        $('#op option:selected').each( function() {
            editor.addToken($(this).val());
        });

    });
    
    $('#show').click( function(e) {
        alert(editor.toString());
    });

    $('#group').click( function(e) {
        editor.groupSelected();
    });
    
    $('#remove').click( function(e) {
        editor.removeSelected();
    });

});