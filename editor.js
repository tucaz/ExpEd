var expEd = function() {

    return {

        Token: function(value, text) {
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

                getIsSelected: function() {
                    return $obj.hasClass('selected');
                },

                getIsToken: function() {
                    return v.constructor === String && this.getIsOperator() === false;
                },

                getIsGroup: function() {
                    return this.getIsOperator() === false && this.getIsToken() === false;
                },

                getIsOperator: function() {
                    return v === '|' || v === '&';
                },

                getText: function() {
                    return t;
                },

                getValue: function() {
                    return v;
                },

                Obj: function() {
                    var that = this;

                    //Had to unbind those events because they were being called N
                    // times
                    //where N is the number of times that "Obj()" is being called
                    //The good thing would be to bind these events only once, but
                    // somehow
                    //the "that" used in the click event does not work outside
                    // this closure
                    //that is returned as a result to "new Token()" call
                    $obj.text(t)
                    .addClass('selectable')
                    .addClass('token')
                    .unbind('mouseover')
                    .unbind('mouseout')
                    .unbind('click')
                    .mouseover( function(e) {
                        $(this).addClass('selectableHover')
                    })

                    .mouseout( function (e) {
                        $(this).removeClass('selectableHover')
                    })

                    .click( function(e) {
                        that.select()
                    });

                    return $obj;
                }

            }
        },

        Editor: function (expressionContainer, data, options) {
            var controls = null,
            expression = expressionContainer,
            built = new LinkedList(),
            f_onError = null,
            selected = [],
            allowOperatorSequence = (options && options.allowOperatorSequence != null) ? options.allowOperatorSequence : false,
            allowTokenSequence = (options && options.allowTokenSequence != null) ? options.allowTokenSequence : false;

            var createToken = function(tv, tt) {
                var token = new expEd.Token(tv, tt);

                token.onSelect( function(t) {
                    selected.push(t)
                });

                token.onDeselect( function(t) {
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

            var validateInsert = function(previousToken, newToken, nextToken) {
                var valid = false;

                if(newToken.getIsOperator()) {
                    valid = allowOperatorSequence ||
                    (previousToken != null &&
                        (previousToken.getIsGroup() || previousToken.getIsToken()) &&
                        (nextToken == null || nextToken.getIsGroup() || nextToken.getIsToken()));
                }
                else if(newToken.getIsToken() || newToken.getIsGroup()) {
                    valid = allowTokenSequence ||
                    ((previousToken == null || previousToken.getIsOperator()) &&
                        (nextToken == null || nextToken.getIsOperator()));
                }

                return valid;
            }

            return {

                createUI: function(controlsContainer) {
                    var that = this,
                    dataCount = data.length;

                    controls = controlsContainer;

                    for(var i = 0; i < dataCount; i++) {
                        var $label = $('<label>'),
                        $select = $('<select>'),
                        $addButton = $('<input type="button" value="Add">'),
                        $br = $('<br>'),
                        _data = data[i];

                        $label.text(data[i].name);

                        $addButton.click( function(s) {
                            return function() {
                                that.addToken(s.find('option:selected').val());
                            }

                        }($select));

                        var valuesCount = _data.values.length;

                        for(var y = 0; y < valuesCount; y++) {
                            var tokenValue = '',
                            tokenText = _data.values[y],
                            $option = null;

                            if(_data.prefix != null) {
                                tokenValue = _data.prefix;
                            }

                            tokenValue = tokenValue + tokenText;

                            if(_data.sufix != null) {
                                tokenValue = tokenValue + _data.sufix;
                            }

                            $option = $('<option value="' + tokenValue + '">' + tokenText + '</option>');

                            $select.append($option);
                        }

                        controls.append($label);
                        controls.append($select);
                        controls.append($addButton);
                        controls.append($br);
                    }
                },

                getLength: function() {
                    return built.getSize();
                },

                addToken: function(t) {
                    var selectedCount = selected.length,
                    newToken = createToken(t,t);

                    if(selectedCount === 0) {
                        var previousToken = built.getTail() != null ? built.getTail().getValue() : null,
                        nextToken = null;

                        if(validateInsert(previousToken, newToken, nextToken)) {
                            expression.append(newToken.Obj());
                            built.add(newToken);
                        }
                        else {
                            if(f_onError) {
                                f_onError('Tokens can only be added after operators and operators can only be added after tokens');
                                return;
                            }
                        }
                    }
                    else {
                        for(var i = selectedCount - 1; i >= 0; i--) {
                            var selectedToken = selected[i],
                            selectedNode = built.find(selectedToken),
                            nextToken = selectedNode.getNext() != null ? selectedNode.getNext().getValue() : null;

                            if(validateInsert(selectedToken, newToken, nextToken)) {
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
                    else if(selectedCount === 1 && !selected[0].getIsToken()) {
                        var selectedToken = selected[0],
                        selectedLL = selectedToken.getValue();

                        for(var currentNode = selectedLL.getHead(); currentNode; currentNode = currentNode.getNext()) {

                            if(currentNode.getPrevious() != null && currentNode.getNext() != null) {
                                var currentToken = currentNode.getValue();
                                built.insertBefore(selectedToken, currentToken);
                                selectedToken.Obj().before(currentToken.Obj());
                            }

                            if(currentNode.getNext() === null) {
                                selectedToken.select();
                                selectedToken.Obj().remove();
                                built.remove(selectedToken);
                            }
                        }

                    }
                    else if(selectedCount === 1 && selected[0].getIsToken()) {
                        if(f_onError) {
                            f_onError('More then one token should be selected to make a group');
                        }
                    }
                    else if(selectedCount >= 2) {
                        var mostLeftSelectedNode = null,
                        mostRightSelectedNode = null,
                        group = new LinkedList(),
                        groupToken = null,
                        groupText = '',
                        selectedToken = null;

                        var linkedListToString = function(ll) {
                            var t = '';

                            for(var currentNode = ll.getHead(); currentNode; currentNode = currentNode.getNext()) {
                                t += currentNode.getValue().getText();
                                t += ' ';
                            }

                            return t;
                        }

                        for(var currentNode = built.getHead(); currentNode; currentNode = currentNode.getNext()) {
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

                        do {
                            currentNode = currentNode.getNext();
                            currentToken = currentNode.getValue();

                            if(!currentToken.getIsSelected()) {
                                currentToken.select();
                            }

                            group.add(currentToken);
                        } while(currentNode != mostRightSelectedNode);
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
                    else {
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
                    else {
                        for(var i = selectedCount - 1; i >= 0; i--) {
                            selected[i].select();
                        }
                    }
                },

                clearAll: function() {
                    for(var currentNode = built.getHead(); currentNode; currentNode = currentNode.getNext()) {
                        currentNode.getValue().Obj().remove();
                        built.remove(currentNode.getValue());
                    }
                },

                toString: function() {
                    var t = '';

                    for(var currentNode = built.getHead(); currentNode; currentNode = currentNode.getNext()) {
                        t += currentNode.getValue().getText();
                        t += ' ';
                    }

                    return t;
                },

                onError: function(callback) {
                    f_onError = callback;
                },

                loadExpression: function(expression) {
                    var tokensToLookFor = [],
                    initialDelimiter = '{',
                    finalDelimiter = '}',
                    operators = ['|', '&'];

                    for(var i = 0; i < data.length; i++) {
                        tokensToLookFor = tokensToLookFor.concat(data[i].values);
                    }

                    var currentToken = '',
                    charIndex = 0,
                    initialIndex = -1,
                    finalIndex = -1,
                    charsToParse = expression.length - 1,
                    stringToParse = expression;

                    while(charsToParse > 0) {
                        for(charIndex = 0; charIndex < charsToParse; charIndex++) {
                            if(initialIndex === -1 && stringToParse[charIndex] === initialDelimiter) {
                                initialIndex = charIndex;
                                currentToken = currentToken + stringToParse[charIndex];
                                continue;
                            }

                            if(initialIndex > -1) {
                                if(stringToParse[charIndex] === finalDelimiter) {
                                    finalIndex = charIndex;
                                    currentToken = currentToken + stringToParse[charIndex];
                                    break;
                                }
                            }
                            
                            if(operators.indexOf(stringToParse[charIndex]) > -1){
                                currentToken = currentToken + stringToParse[charIndex];
                                break;
                            }

                            if(stringToParse[charIndex] != initialDelimiter && stringToParse[charIndex] != finalDelimiter) {
                                currentToken = currentToken + stringToParse[charIndex];
                            }
                        }

                        //TODO: Check if the tokens found are valid before adding
                        // in the tokensToLookFor array

                        if(currentToken != null && currentToken != '') {
                            this.addToken(currentToken);
                            currentToken = '';
                        }

                        initialIndex = -1;
                        finalIndex = -1;
                        stringToParse = stringToParse.substring(charIndex + 1);
                        charsToParse = stringToParse.length;
                    }
                }

            }

        }

    }
}( );