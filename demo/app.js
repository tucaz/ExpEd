$(document).ready( function () {
    var editor = new expEd.Editor({
        expressionContainer:$('#expression'),
        tokens: [{
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
        operators: ['AND','OR']
    });

    editor.createUI($('#controls'));

    editor.onError( function(e) {
        alert(e.message)
    });

    $('#show').click( function(e) {
        $('#text').text(editor.toString());
    });
});