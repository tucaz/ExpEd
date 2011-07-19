$(document).ready( function () {
    module("Editor UI")
    test('Can create the UI with all buttons and tokens available', function () {
        expect(6);

        var editor = new expEd.Editor({
            expressionContainer: $('#expression'),
            tokens: [{
                name: 'Values',
                values: ['1', '2', '3','4', '5', '6','7', '8', '9','0']
            }],
            operators: ['OR','AND']
        });

        editor.createUI($('#controls'));

        equal($('#' + editor.getControlPrefix() + '-add-op-0').length, 1, 'Add operator button found');
        equal($('#' + editor.getControlPrefix() + '-add-op-1').length, 1, 'Add operator button found');
        equal($('#' + editor.getControlPrefix() + '-group').length, 1, 'Group/Ungroup button found');
        equal($('#' + editor.getControlPrefix() + '-unselect-all').length, 1, 'Unselect all button found');
        equal($('#' + editor.getControlPrefix() + '-remove').length, 1, 'Remove selected button found');
        equal($('#' + editor.getControlPrefix() + '-clear-all').length, 1, 'Clear all selected button found');
    });

    //Test cases in this module to make sure Issue #1 is fixed
    module("Editor error handling")
    test('Should not throw exception without onError method set', function () {
        expect(1);

        var editor = new expEd.Editor({
            expressionContainer: $('#expression'),
            tokens: [{
                name: 'Values',
                values: ['1', '2', '3','4', '5', '6','7', '8', '9','0']
            }],
            operators: ['OR','AND']
        });

        editor.addToken('1');
        editor.addToken('OR');
        editor.addToken('OR');

        ok(true, 'Everything is fine');
    });

    test('Should call onError callback', function () {
        expect(1);

        var editor = new expEd.Editor({
            expressionContainer: $('#expression'),
            tokens: [{
                name: 'Values',
                values: ['1', '2', '3','4', '5', '6','7', '8', '9','0']
            }],
            operators: ['OR','AND']
        });

        editor.onError( function(e) {
            ok(e != null, 'method called')
        })

        editor.addToken('1');
        editor.addToken('OR');
        editor.addToken('OR');

    });

    module("Editor blocking operator and token sequences", {
        setup: function() {
            var that = this;

            this.data = [{
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
            }];

            this.editor = new expEd.Editor({
                expressionContainer: $('#expression'),
                tokens: this.data,
                operators: ['OR', 'AND']
            });

            $('#add-or').click( function(e) {
                that.editor.addToken('OR')
            });

            $('#add-and').click( function(e) {
                that.editor.addToken('AND')
            });

            $('#group').click( function(e) {
                that.editor.groupSelected()
            });

            $('#show').click( function(e) {
                $('#text').text(editor.toString());
            });

            $('#unselect').click( function(e) {
                that.editor.unselectAll();
            });

            $('#remove').click( function(e) {
                that.editor.removeSelected();
            });

            $('#clear-all').click( function(e) {
                that.editor.clearAll();
            });

        },

        tearDown: function() {
            this.data = null;
            this.editor = null;
        }

    });
    test('First token cannot be an operator', function () {
        expect(2);

        this.editor.onError( function(e) {
            equal(e.message, 'Tokens can only be added after operators and operators can only be added after tokens', 'error should be fired: ' + e.message);
        })

        addOrOp();
        equal(this.editor.getLength(), 0,'token not added');
    });

    test('First token should be a value token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);
        equal(this.editor.getLength(), 1,'token added');
    });

    test('First token should not be an operator token', function () {
        expect(2);

        this.editor.onError( function(e) {
            equal(e.message, 'Tokens can only be added after operators and operators can only be added after tokens', 'error should be fired: ' + e.message);
        })

        addAndOp();

        equal(this.editor.getLength(), 0,'token not added');
    });

    test('An operator token can only be added after a value token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);

        addAndOp();

        equal(this.editor.getLength(), 2, 'token added');
    });

    test('A value token can only be added after an operator token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);
        addAndOp();
        this.editor.addToken(this.data[0].values[0]);

        equal(this.editor.getLength(), 3, 'token added');
    });

    test('A value token cannot be inserted between operator token and value token', function () {
        expect(2);

        this.editor.onError( function(e) {
            equal('Tokens can only be added after operators and operators can only be added after tokens', e.message, 'error should be fired: ' + e);
        })

        this.editor.addToken(this.data[0].values[0]);
        addAndOp();
        this.editor.addToken(this.data[0].values[0]);

        selectToken(2);

        this.editor.addToken(this.data[0].values[0]);

        equal(this.editor.getLength(), 3,'token not added');
    });

    test('A selected token should be highlited', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e);
        })

        this.editor.addToken(this.data[0].values[0]);

        selectToken(1);

        ok($('.token').hasClass('selected'), 'token is highlited');
    });

    test('A group cannot be created with only one token selected', function () {
        expect(1);

        this.editor.onError( function(e) {
            equal(e.message, 'More then one token should be selected to make a group', 'error should be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);

        selectToken(1);
        this.editor.groupSelected();
    });

    test('A group cannot be created if the most left selected token is an operator', function () {
        expect(1);

        this.editor.onError( function(e) {
            equal(e.message, 'Left and right parts of a group cannot be operators', 'error should be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);
        addAndOp();
        this.editor.addToken(this.data[0].values[1]);
        addAndOp();
        this.editor.addToken(this.data[0].values[2]);

        selectToken(2);
        selectToken(3);
        this.editor.groupSelected();
    });

    test('A group cannot be created if the most right selected token is an operator', function () {
        expect(1);

        this.editor.onError( function(e) {
            equal(e.message, 'Left and right parts of a group cannot be operators', 'error should be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);
        addAndOp();
        this.editor.addToken(this.data[0].values[1]);
        addAndOp();
        this.editor.addToken(this.data[0].values[2]);

        selectToken(1);
        selectToken(4);
        this.editor.groupSelected();
    });

    test('A group token can be created', function () {
        expect(2);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);
        addAndOp();
        this.editor.addToken(this.data[0].values[0]);

        equal($('.token').length, 3, '3 tokens exist before group is created');

        selectToken(1);
        selectToken(3);

        this.editor.groupSelected();

        equal($('.token').length, 1, 'only 1 token after group is created');
    });

    test('A group token can be made of other group token', function () {
        expect(3);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);
        addAndOp();
        this.editor.addToken(this.data[0].values[0]);

        equal($('.token').length, 3, '3 tokens exist before group is created');

        selectToken(1);
        selectToken(3);

        this.editor.groupSelected();

        equal($('.token').length, 1, 'only 1 token after group is created');

        addAndOp();
        this.editor.addToken(this.data[0].values[0]);

        selectToken(1);
        selectToken(3);

        this.editor.groupSelected();

        equal($('.token').length, 1, 'only 1 token after group is created');
    });

    module("Editor allowing operator and token sequences", {
        setup: function() {
            var $expressionContainer = $('#expression'),
            that = this;

            this.data = [{
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
            }];

            this.editor = new expEd.Editor({
                expressionContainer: $('#expression'),
                tokens: this.data,
                operators: ['OR', 'AND'],
                allowOperatorSequence: true,
                allowTokenSequence: true
            });

            $('#add-or').click( function(e) {
                that.editor.addToken('|')
            });

            $('#add-and').click( function(e) {
                that.editor.addToken('&')
            });

            $('#group').click( function(e) {
                that.editor.groupSelected()
            });

            $('#show').click( function(e) {
                $('#text').text(editor.toString());
            });

            $('#unselect').click( function(e) {
                that.editor.unselectAll();
            });

            $('#remove').click( function(e) {
                that.editor.removeSelected();
            });

            $('#clear-all').click( function(e) {
                that.editor.clearAll();
            });

        },

        tearDown: function() {
            this.data = null;
            this.editor = null;
        }

    });

    test('First token can be a value token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);

        equal(this.editor.getLength(), 1,'token added');
    });

    test('First token can be an operator token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e.message);
        })

        addAndOp();

        equal(this.editor.getLength(), 1,'token added');
    });

    test('An operator token can be added after another operator token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);
        addAndOp();
        addAndOp();

        equal(this.editor.getLength(), 3, 'token added');
    });

    test('A value token can be added after another value token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);
        this.editor.addToken(this.data[0].values[0]);

        equal(this.editor.getLength(), 2, 'token added');
    });

    test('A value token can be inserted between operator token and value token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e.message);
        })

        this.editor.addToken(this.data[0].values[0]);
        addAndOp();
        this.editor.addToken(this.data[0].values[0]);

        selectToken(2);

        this.editor.addToken(this.data[0].values[0]);

        equal(this.editor.getLength(), 4,'token not added');
    });

    function selectToken(n) {
        $('.token:nth-child(' + n + ')"').trigger('click');
    }

    function addAndOp() {
        $('#add-and').trigger('click');
    }

    function addOrOp() {
        $('#add-or').trigger('click');
    }

    module("Editor loading expressions", {
        setup: function() {
            var $expressionContainer = $('#expression'),
            that = this;

            this.data = [{
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
            }];

            this.editor = new expEd.Editor({
                expressionContainer: $('#expression'),
                tokens: this.data,
                operators: ['OR', 'AND']
            });
        },

        tearDown: function() {
            this.data = null;
            this.editor = null;
        }

    });

    test('Can load a simple value token expression', function () {
        expect(1);

        this.editor.loadExpression('{r=RoleA}');

        equal($('.token').length, 1,'expression loaded');
    });

    test('Can load a simple boolean expression', function () {
        expect(1);

        this.editor.loadExpression('{r=RoleA}OR{r=Attr1}', ['OR']);

        equal($('.token').length, 3,'expression loaded');
    });

    test('Can load a big boolean expression', function () {
        expect(1);

        this.editor.loadExpression('{r=RoleA}OR{r=Attr1}AND{g=Group1}OR{r=RoleB}', ['OR','AND']);

        equal($('.token').length, 7,'expression loaded');
    });

    test('Can load a big boolean expression with multi-char operators', function () {
        expect(1);

        this.editor.loadExpression('{r=RoleA}OR{r=Attr1}AND{g=Group1}OR{r=RoleB}', ['AND','OR']);

        equal($('.token').length, 7,'expression loaded');
    });

    test('Can load a simple group expression that begins with the group', function () {
        expect(1);

        this.editor.loadExpression('({r=RoleA}OR{r=Attr1})', ['OR']);

        equal($('.token').length, 1,'expression loaded');
    });

    test('Can load a simple group and value expression that begins with the group', function () {
        expect(1);

        this.editor.loadExpression('({r=RoleA}OR{r=Attr1})AND{r=RoleB}', ['OR','AND']);

        equal($('.token').length, 3,'expression loaded');
    });

    test('Can load a simple group and value expression that begins with the value expression', function () {
        expect(1);

        this.editor.loadExpression('{r=RoleB}AND({r=RoleA}OR{r=Attr1})', ['OR','AND']);

        equal($('.token').length, 3,'expression loaded');
    });

    test('Can load a group expression with two groups not nested', function () {
        expect(1);

        this.editor.loadExpression('({r=RoleA}OR{r=Attr1})AND({r=RoleA}OR{r=Attr1})', ['OR','AND']);

        equal($('.token').length, 3,'expression loaded');
    });

    // test('Can load a group expression nested groups', function () {
    // expect(1);
    //
    // this.editor.onError(function(e){alert(e)});
    // this.editor.loadExpression('(({a=Attr1}OR{g=Group1})AND{a=Attr1})',
    // ['OR','AND']);
    //
    // equal($('.token').length, 3,'expression loaded');
    // });
});