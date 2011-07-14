$(document).ready( function () {
    var $controlsContainer = $('#controls'),
    $expressionContainer = $('#expression'),
    data = [{
        name: 'Roles',
        prefix: '{r=',
        sufix: '}',
        values: ['RoleA', 'RoleB', 'RoleC']
    },{
        name: 'Groups',
        prefix: '{g=',
        sufix: '}',
        values: ['Group1', 'Group2', 'Group3', 'Group4']
    },{
        name: 'Attributes',
        prefix: '{a=',
        sufix: '}',
        values: ['Attr1', 'Attr2']
    }],
    editor = new expEd.Editor($expressionContainer, data);

    editor.createUI($controlsContainer);

    editor.onError( function(msg) {
        alert(msg)
    });

    $('#add-or').click( function(e) {
        editor.addToken('OR')
    });

    $('#add-and').click( function(e) {
        editor.addToken('AND')
    });

    $('#group').click( function(e) {
        editor.groupSelected()
    });

    $('#show').click( function(e) {
        $('#text').text(editor.toString());
    });

    $('#unselect').click( function(e) {
        editor.unselectAll();
    });

    $('#remove').click( function(e) {
        editor.removeSelected();
    });

    $('#clear-all').click( function(e) {
        editor.clearAll();
    });

});