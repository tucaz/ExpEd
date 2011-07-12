$(document).ready( function () {
    module("Editor blocking operator and token sequences", {
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

            this.editor = new expEd.Editor($expressionContainer, this.data);

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
    test('First token cannot be an operator', function () {
        expect(2);

        this.editor.onError( function(e) {
            equal(e, 'Tokens can only be added after operators and operators can only be added after tokens', 'error should be fired: ' + e);
        })

        addOrOp();
        equal(this.editor.getLength(), 0,'token not added');
    });

    test('First token should be a value token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e);
        })

        this.editor.addToken(this.data[0].values[0]);
        equal(this.editor.getLength(), 1,'token added');
    });

    test('First token should not be an operator token', function () {
        expect(2);

        this.editor.onError( function(e) {
            equal(e, 'Tokens can only be added after operators and operators can only be added after tokens', 'error should be fired: ' + e);
        })

        addAndOp();

        equal(this.editor.getLength(), 0,'token not added');
    });

    test('An operator token can only be added after a value token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e);
        })

        this.editor.addToken(this.data[0].values[0]);

        addAndOp();

        equal(this.editor.getLength(), 2, 'token added');
    });

    test('A value token can only be added after an operator token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e);
        })

        this.editor.addToken(this.data[0].values[0]);
        addAndOp();
        this.editor.addToken(this.data[0].values[0]);

        equal(this.editor.getLength(), 3, 'token added');
    });

    test('A value token cannot be inserted between operator token and value token', function () {
        expect(2);

        this.editor.onError( function(e) {
            equal('Tokens can only be added after operators and operators can only be added after tokens', e, 'error should be fired: ' + e);
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
            equal(e, 'More then one token should be selected to make a group', 'error should be fired: ' + e);
        })

        this.editor.addToken(this.data[0].values[0]);

        selectToken(1);
        this.editor.groupSelected();
    });

    test('A group cannot be created if the most left selected token is an operator', function () {
        expect(1);

        this.editor.onError( function(e) {
            equal(e, 'Left and right parts of a group cannot be operators', 'error should be fired: ' + e);
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
            equal(e, 'Left and right parts of a group cannot be operators', 'error should be fired: ' + e);
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
            ok(false, 'error should not be fired: ' + e);
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

            this.editor = new expEd.Editor($expressionContainer, this.data, {
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
            ok(false, 'error should not be fired: ' + e);
        })

        this.editor.addToken(this.data[0].values[0]);

        equal(this.editor.getLength(), 1,'token added');
    });

    test('First token can be an operator token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e);
        })

        addAndOp();

        equal(this.editor.getLength(), 1,'token added');
    });

    test('An operator token can be added after another operator token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e);
        })

        this.editor.addToken(this.data[0].values[0]);
        addAndOp();
        addAndOp();

        equal(this.editor.getLength(), 3, 'token added');
    });

    test('A value token can be added after another value token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e);
        })

        this.editor.addToken(this.data[0].values[0]);
        this.editor.addToken(this.data[0].values[0]);

        equal(this.editor.getLength(), 2, 'token added');
    });

    test('A value token can be inserted between operator token and value token', function () {
        expect(1);

        this.editor.onError( function(e) {
            ok(false, 'error should not be fired: ' + e);
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

});