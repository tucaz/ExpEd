$(document).ready( function () {
	module("Editor", {
		setup: function() {
			var $expressionContainer = $('#expression'),
				that = this;

			this.data = [{
				name: 'Roles',
				prefix: 'r=',
				values: ['RoleA', 'RoleB', 'RoleC']
			},{
				name: 'Groups',
				prefix: 'g=',
				values: ['Group1', 'Group2', 'Group3', 'Group4']
			},{
				name: 'Attributes',
				prefix: 'a=',
				values: ['Attr1', 'Attr2']
			}];

			this.editor = new expEd.Editor($expressionContainer, this.data);

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
			equal('Tokens can only be added after operators and operators can only be added after tokens', e, 'error should be fired: ' + e)
		})
		this.editor.addToken('OR')
		equal(0, this.editor.getLength(),'token not added');
	});
	test('First token should be a value token', function () {
		expect(2);

		this.editor.onError( function(e) {
			ok(false, 'error should not be fired: ' + e)
		})
		this.editor.addToken(this.data[0].values[0]);
		ok(true, 'error should not be fired')
		equal(1, this.editor.getLength(),'token added');
	});
	test('First token should not be an operator token', function () {
		expect(2);

		this.editor.onError( function(e) {
			equal('Tokens can only be added after operators and operators can only be added after tokens', e, 'error should be fired: ' + e)
		})
		addAndOp();

		equal(0, this.editor.getLength(),'token not added');
	});
	test('An operator token can only be added after a value token', function () {
		expect(2);

		this.editor.onError( function(e) {
			ok(false, 'error should not be fired: ' + e)
		})
		this.editor.addToken(this.data[0].values[0]);

		addAndOp();

		ok(true, 'error should not be fired')
		equal(2, this.editor.getLength(), 'token added');

	});
	test('A value token can only be added after a operator token', function () {
		expect(2);

		this.editor.onError( function(e) {
			ok(false, 'error should not be fired: ' + e)
		})
		this.editor.addToken(this.data[0].values[0]);
		addAndOp();
		this.editor.addToken(this.data[0].values[0]);
		ok(true, 'error should not be fired')
		equal(3, this.editor.getLength(), 'token added');
	});
	test('A selected token should be highlited', function () {
		expect(1);

		this.editor.onError( function(e) {
			ok(false, 'error should not be fired: ' + e)
		})
		this.editor.addToken(this.data[0].values[0]);

		selectToken(1);

		ok($('.token').hasClass('selected'), 'token is highlited');
	});
	test('A group cannot be created with only one token selected', function () {
		expect(1);

		this.editor.onError( function(e) {
			equal('More then one token should be selected to make a group', e, 'error should be fired: ' + e)
		})
		this.editor.addToken(this.data[0].values[0]);

		selectToken(1);
		this.editor.groupSelected();
	});
	test('A group cannot be created if the most left selected token is an operator', function () {
		expect(1);

		this.editor.onError( function(e) {
			equal('Left and right parts of a group cannot be operators', e, 'error should be fired: ' + e)
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
			equal('Left and right parts of a group cannot be operators', e, 'error should be fired: ' + e)
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
		expect(3);

		this.editor.onError( function(e) {
			ok(false, 'error should not be fired: ' + e)
		})
		this.editor.addToken(this.data[0].values[0]);
		addAndOp();
		this.editor.addToken(this.data[0].values[0]);
		
		equal(3, $('.token').length, '3 tokens exist before group is created');

		selectToken(1);
		selectToken(3);
		
		this.editor.groupSelected();

		ok(true, 'group created')
		equal(1, $('.token').length, 'only 1 token after group is created');
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