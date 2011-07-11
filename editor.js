var expEd = function() {	

	return	{
		
		data: [
					{
						name: 'Roles',
						prefix: 'r=',
						values: ['RoleA', 'RoleB', 'RoleC']
					},
					{
						name: 'Groups',
						prefix: 'g=',
						values: ['Group1', 'Group2', 'Group3', 'Group4']
					},
					{
						name: 'Attributes',
						prefix: 'a=',
						values: ['Attr1', 'Attr2']
					}
				],
				
		Token: function(value, text)
		{
			var v = value,
				t = text,
				f_onSelect = null,
				f_onDeselect = null,
				$obj = $('<div>');			
				
			return {
				onSelect: function(callback) {
					f_onSelect = callback;
				},
				
				onDeselect: function(callback) {
					f_onDeselect = callback;
				},
				
				select: function() {					
					if(this.getIsSelected()) {
						f_onDeselect(this);
						$obj.removeClass('selected');
					}
					else {
						f_onSelect(this);
						$obj.addClass('selected');
					}					
				},
				
				getIsSelected: function()
				{
					return $obj.hasClass('selected');
				},
				
				getIsToken: function()
				{
					return v.constructor === String && this.getIsOperator() === false;
				},
				
				getIsGroup: function() {
					return this.getIsOperator() === false && this.getIsToken() === false;
				},
				
				getIsOperator: function() {
					return v === 'OR' || v === 'AND';
				},
				
				getText: function(){
					return t;
				},
				
				getValue: function(){
					return v;
				},

				Obj: function()
				{
					var that = this;
					
					//Had to unbind those events because they were being called N times
					//where N is the number of times that "Obj()" is being called
					//The good thing would be to bind these events only once, but somehow
					//the "that" used in the click event does not work outside this closure
					//that is returned as a result to "new Token()" call
					$obj.text(t)
						.addClass('selectable')
						.unbind('mouseover')
						.unbind('mouseout')
						.unbind('click')
						.mouseover(function(e) { 
							$(this).addClass('selectableHover') 
						})
						.mouseout(function (e) { 
							$(this).removeClass('selectableHover') 
						})
						.click(function(e) { 
							that.select() 
						});
					
					return $obj;
				}
			}
		},
				
		Editor: function (controlsContainer, expressionContainer, data, options) {
			var controls = controlsContainer, 
				expression = expressionContainer,
				built = new LinkedList(),
				f_onError = null,
				selected = [],
				blockOperatorSequence = (options && options.blockOperatorSequence != null) ? options.blockOperatorSequence : true,
				blockTokenSequence = (options && options.blockTokenSequence != null) ? options.blockTokenSequence : true;				
		
			var createToken = function(tv, tt) {			
				var token = new expEd.Token(tv, tt);
				
				token.onSelect(function(t) { 
					selected.push(t) 
				});
					
				token.onDeselect(function(t) { 
					var selectedCount = selected.length;
					
					for(var i = 0; i < selectedCount; i++) {
						if(selected[i] === t) {							
							selected.splice(i, 1);
							return;
						}
					}
				});
				
				return token;
			};
			
			var validateInsert = function(previousToken, newToken) {
				var valid = false;
				
				if(newToken.getIsOperator()) {
					valid = previousToken != null && (previousToken.getIsGroup() || previousToken.getIsToken());
				}
				else if(newToken.getIsToken() || newToken.getIsGroup()) {
					valid = previousToken == null || previousToken.getIsOperator();
				}
				
				return valid;
			}
			
			return {				
		
				createUI: function()
				{
					var that = this,
						dataCount = data.length;
					
					for(var i = 0; i < dataCount; i++)
					{
						var $label = $('<label>'),
							$select = $('<select>'),
							$addButton = $('<input type="button" value="Add">'),
							$br = $('<br>'),
							_data = data[i];						
										
						$label.text(data[i].name);					
						
						$addButton.click(function(s){							
							return function() { 
								that.addToken(s.find('option:selected').val());
							}
						}($select));
						
						var valuesCount = _data.values.length;
						
						for(var y = 0; y < valuesCount; y++)
						{
							var $option = $('<option value="'+ _data.prefix + _data.values[y] + '">' + _data.values[y] + '</option>');
							$select.append($option);
						}
						
						controls.append($label);
						controls.append($select);
						controls.append($addButton);
						controls.append($br);		
					}
				},				
				
				addToken: function(t) {										
					var selectedCount = selected.length,
						newToken = createToken(t,t);					
				
					if(selectedCount === 0) {						
						var previousToken = built.tail != null ? built.tail.getValue() : null;
						
						if(validateInsert(previousToken, newToken)) {
							expression.append(newToken.Obj());
							built.add(newToken);
						}
						else {
							if(f_onError) {
								f_onError('Tokens can only be added after operators and operators can only be added after tokens');
							}
						}
					}
					else {
						for(var i = selectedCount - 1; i >= 0; i--) {							
							var selectedToken = selected[i];
							
							if(validateInsert(selectedToken, newToken)) {								
								selectedToken.select();
								selectedToken.Obj().after(newToken.Obj());
								built.insertAfter(selectedToken, newToken);						
							
								selected.splice(i, 1);
							}
							else {
								if(f_onError) {
									f_onError('Tokens can only be added after operators and operators can only be added after tokens');
								}
							}
						}
					}					
				},				
				
				groupSelected: function() {
					var selectedCount = selected.length;
					
					if(selectedCount === 0) {
						return;
					}
					else if(selectedCount === 1 && !selected[0].getIsToken())
					{
						var selectedToken = selected[0],
							selectedLL = selectedToken.getValue();
							
						for(var currentNode = selectedLL.head; currentNode; currentNode = currentNode.getNext()) {
							
							if(currentNode.getPrevious() != null && currentNode.getNext() != null) {
								var currentToken = currentNode.getValue();						
								built.insertBefore(selectedToken, currentToken);
								selectedToken.Obj().before(currentToken.Obj());
							}
						
							if(currentNode.getNext() === null)
							{
								selectedToken.select();
								selectedToken.Obj().remove();
								built.remove(selectedToken);
							}
						}	
						
					}
					else if(selectedCount >= 2)
					{					
						var mostLeftSelectedNode = null,
							mostRightSelectedNode = null,
							group = new LinkedList(),
							groupToken = null,
							groupText = '',
							selectedToken = null;
							
						var linkedListToString = function(ll) {
							var t = '';
						
							for(var currentNode = ll.head; currentNode; currentNode = currentNode.getNext()) {
								t += currentNode.getValue().getText();
								t += ' ';
							}	
							
							return t;
						}
						
						for(var currentNode = built.head; currentNode; currentNode = currentNode.getNext()) {
							var index = selected.indexOf(currentNode.getValue());
							if(index > -1) {
								mostLeftSelectedNode = currentNode;
								break;
							}
						}
						
						for(var currentNode = mostLeftSelectedNode; currentNode; currentNode = currentNode.getNext()) {
							var index = selected.indexOf(currentNode.getValue());
							if(index > -1) {
								mostRightSelectedNode = currentNode;
							}
						}	
						
						var mostLeftSelectedToken = mostLeftSelectedNode.getValue(),
							mostRightSelectedToken = mostRightSelectedNode.getValue();
						
						if( (mostLeftSelectedToken.getIsToken() === false && mostLeftSelectedToken.getIsGroup() === false) || 
							(mostRightSelectedToken.getIsToken() === false && mostRightSelectedToken.getIsGroup() === false) ) {
							f_onError('Left and right parts of a group cannot be operators');
							return;
						}
						
						var currentNode = mostLeftSelectedNode,
							currentToken = null,
							leftParenthesis = createToken('(', '('),
							rightParenthesis = createToken(')', ')');
							
						group.add(leftParenthesis);
						group.add(currentNode.getValue());					
						
						do
						{						
							currentNode = currentNode.getNext();
							currentToken = currentNode.getValue();
							
							if(!currentToken.getIsSelected()) {
								currentToken.select();
							}
							
							group.add(currentToken);
						}
						while(currentNode != mostRightSelectedNode);
						group.add(rightParenthesis);					
					
						groupText = linkedListToString(group);
						groupToken = createToken(group, groupText);						
						
						selectedCount = selected.length;
						
						for(var i = selectedCount - 1; i >= 0; i--) {							
							selectedToken = selected[i];							
							selectedToken.select();
							
							if(i === 0) {
								selectedToken.Obj().before(groupToken.Obj());
								built.insertBefore(selectedToken, groupToken);
							}							
							
							selectedToken.Obj().remove();
							built.remove(selectedToken);
							
							selected.splice(i, 1);
						}
					}
				},
				
				removeSelected: function() {
					var selectedCount = selected.length;
					
					if(selectedCount === 0) {
						return;
					}
					else					
					{
						var selectedToken = null;
						
						for(var i = selectedCount - 1; i >= 0; i--) {							
							selectedToken = selected[i];							
							selectedToken.select();							
						
							selectedToken.Obj().remove();
							built.remove(selectedToken);
							
							selected.splice(i, 1);
						}
					}
				},				
				
				unselectAll: function() {
					var selectedCount = selected.length;
					
					if(selectedCount === 0) {
						return;
					}
					else					
					{
						for(var i = selectedCount - 1; i >= 0; i--) {							
							selected[i].select();
						}
					}
				},			

				clearAll: function() {
					for(var currentNode = built.head; currentNode; currentNode = currentNode.getNext()) {
						currentNode.getValue().Obj().remove();
						built.remove(currentNode.getValue());
					}
				},
				
				toString: function(container)
				{
					var t = '';
					
					for(var currentNode = built.head; currentNode; currentNode = currentNode.getNext()) {
						t += currentNode.getValue().getText();
						t += ' ';
					}			

					container.text(t);
				},
				
				onError: function(callback) {
					f_onError = callback;
				},
				
				loadExpression: function(expression) {
					var tokensToLookFor = [],
						operators = ['OR', 'AND'];
					
					for(var i = 0; i < data.length; i++) { 
						tokensToLookFor = tokensToLookFor.concat(data[i].values);
					}
					
					var a = '';
				}
			}	
		}
	}
}( );

$(document).ready(function () {	
	var $controlsContainer = $('#controls'),
		$expressionContainer = $('#expression'),
		editor = new expEd.Editor($controlsContainer, $expressionContainer, expEd.data);
	
	editor.createUI();
	editor.onError(function(msg) { alert(msg) });
	editor.loadExpression('r=RoleA AND r=RoleB');
	
	$('#add-or').click(function(e) { editor.addToken('OR') });
	$('#add-and').click(function(e) { editor.addToken('AND') });
	$('#group').click(function(e) { editor.groupSelected() });
	$('#show').click(function(e) { editor.toString($('#text')) });
	$('#unselect').click(function(e) { editor.unselectAll(); });
	$('#remove').click(function(e) { editor.removeSelected(); });
	$('#clear-all').click(function(e) { editor.clearAll(); });
});