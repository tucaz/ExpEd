var expEd = function() {
    
    return {
        Token: function(value, text) {
            var v = value,
            t = text,
            f_onSelect = null,
            f_onDeselect = null,
            $obj = jQuery('<div>'),
            that = this;

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
                    return that.operatorList ? that.operatorList.indexOf(v) > -1 : false;
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
                        jQuery(this).addClass('selectableHover')
                    })

                    .mouseout( function (e) {
                        jQuery(this).removeClass('selectableHover')
                    })

                    .click( function(e) {
                        that.select()
                    });

                    return $obj;
                }

            }
        },

        Editor: function (opts) {
            var controls = null,
            built = new LinkedList(),
            f_onError = null,
            selected = [],
            controlPrefix = 'expEd',
            data = (opts && opts.tokens != null) ? opts.tokens : [],
            operators = (opts && opts.operators != null) ? opts.operators : [],
            expression = (opts && opts.expressionContainer != null) ? opts.expressionContainer : null,
            allowOperatorSequence = (opts && opts.allowOperatorSequence != null) ? opts.allowOperatorSequence : false,
            allowTokenSequence = (opts && opts.allowTokenSequence != null) ? opts.allowTokenSequence : false;
            
            expEd.Token.prototype.operatorList = (opts && opts.operators != null) ? opts.operators : [];

            var linkedListToString = function(ll) {
                var t = '';

                for(var currentNode = ll.getHead(); currentNode; currentNode = currentNode.getNext()) {
                    t += currentNode.getValue().getText();
                    t += ' ';
                }

                return t;
            }

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
            };
            
            var raiseError = function(errorMessage){
                if(f_onError) {
                    var error = {
                        name: 'InvalidOperation',
                        message: errorMessage    
                    };
                    
                    f_onError(error);
                }
            };

            return {
                getControlPrefix: function() {
                    return controlPrefix;
                },

                createUI: function(controlsContainer) {
                    var that = this,
                    dataCount = data.length;

                    controls = controlsContainer;

                    for(var i = 0; i < dataCount; i++) {
                        var $label = jQuery('<label>'),
                        $select = jQuery('<select>'),
                        $addButton = jQuery('<input type="button" value="Add">'),
                        $br = jQuery('<br>'),
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

                            $option = jQuery('<option value="' + tokenValue + '">' + tokenText + '</option>');

                            $select.append($option);
                        }

                        controls.append($label);
                        controls.append($select);
                        controls.append($addButton);
                        controls.append($br);
                    }

                    //adding buttons to handle operators
                    var opCount = operators.length;

                    for(var i = 0; i < opCount; i++) {
                        var $addOp = jQuery('<input type="button">');

                        $addOp.attr('id', controlPrefix + '-add-op-' + i);
                        $addOp.val('Add ' + operators[i]);
                        $addOp.click( function(index) {
                            return function() {
                                that.addToken(operators[index]);
                            }

                        }(i));

                        controls.append($addOp);
                    }

                    //adding group selected button
                    var $group = jQuery('<input type="button">');
                    $group.attr('id', controlPrefix + '-group');
                    $group.val('Group/Ungroup selected');
                    $group.click( function(e) {
                        that.groupSelected();
                    });

                    controls.append($group);

                    //adding unselect all button
                    var $unselectAll = jQuery('<input type="button">');
                    $unselectAll.attr('id', controlPrefix + '-unselect-all');
                    $unselectAll.val('Unselect All');
                    $unselectAll.click( function(e) {
                        that.unselectAll();
                    });

                    controls.append($unselectAll);

                    //adding remove selected button
                    var $remove = jQuery('<input type="button">');
                    $remove.attr('id', controlPrefix + '-remove');
                    $remove.val('Remove Selected');
                    $remove.click( function(e) {
                        that.removeSelected();
                    });

                    controls.append($remove);

                    //adding clear selected selected button
                    var $clearAll = jQuery('<input type="button">');
                    $clearAll.attr('id', controlPrefix + '-clear-all');
                    $clearAll.val('Clear All');
                    $clearAll.click( function(e) {
                        that.clearAll();
                    });

                    controls.append($clearAll);
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
                            raiseError('Tokens can only be added after operators and operators can only be added after tokens');
                            return;
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
                                raiseError('Tokens can only be added after operators and operators can only be added after tokens');
                                return;
                            }
                        }
                    }

                    return newToken;
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
                        raiseError('More then one token should be selected to make a group');
                        return;
                    }
                    else if(selectedCount >= 2) {
                        var mostLeftSelectedNode = null,
                        mostRightSelectedNode = null,
                        group = new LinkedList(),
                        groupToken = null,
                        groupText = '',
                        selectedToken = null;

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
                            raiseError('Left and right parts of a group cannot be operators');
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

                loadExpression: function(expression, allowedOperators) {
                    var that = this,
                    initialDelimiter = '{',
                    finalDelimiter = '}',
                    groupInitialDelimiter = '(',
                    groupFinalDelimiter = ')',
                    operators = allowedOperators || [];

                    expression = expression.trim();

                    var parseValueExpression = function(s) {
                        var currentToken = '',
                        currentOp = '',
                        charIndex = 0,
                        initialIndex = -1,
                        finalIndex = -1,
                        charsToParse = s.length - 1,
                        stringToParse = s,
                        result = new LinkedList(),
                        parsedChars = 0,
                        groupFound = false;

                        while(charsToParse > 0 && !groupFound) {
                            for(charIndex = 0; charIndex <= charsToParse; charIndex++) {
                                if(stringToParse.charAt(charIndex) === groupInitialDelimiter) {
                                    groupFound = true;
                                    //Back to previous character so the outer
                                    // function won't miss it
                                    charIndex = charIndex - 2;
                                    break;
                                }

                                if(initialIndex === -1 && stringToParse.charAt(charIndex) === initialDelimiter) {
                                    initialIndex = charIndex;
                                    currentToken = currentToken + stringToParse.charAt(charIndex);
                                    continue;
                                }

                                if(initialIndex > -1 && finalIndex === -1) {
                                    if(stringToParse.charAt(charIndex) != initialDelimiter && stringToParse.charAt(charIndex) != finalDelimiter) {
                                        currentToken = currentToken + stringToParse.charAt(charIndex);
                                        continue;
                                    }

                                    if(stringToParse.charAt(charIndex) === finalDelimiter) {
                                        finalIndex = charIndex;
                                        currentToken = currentToken + stringToParse.charAt(charIndex);
                                        break;
                                    }
                                }

                                if(initialIndex === -1 && finalIndex === -1) {
                                    currentOp = currentOp + stringToParse.charAt(charIndex);
                                    continue;
                                }
                            }

                            //TODO: Check if the tokens found are valid before
                            // adding
                            // in the tokensToLookFor array
                            if(currentOp != null && currentOp != '') {
                                result.add(currentOp);
                                currentOp = '';
                            }

                            if(currentToken != null && currentToken != '') {
                                result.add(currentToken);
                                currentToken = '';
                            }

                            initialIndex = -1;
                            finalIndex = -1;
                            stringToParse = stringToParse.substring(charIndex + 1);
                            charsToParse = stringToParse.length;
                            parsedChars = parsedChars + (charIndex + 1);
                        }

                        return {
                            CharIndex: parsedChars,
                            Result: result
                        };
                    }

                    var parseGroupExpression = function(s) {

                        var charIndex = 0,
                        initialIndex = -1,
                        finalIndex = -1,
                        charsToParse = s.length - 1,
                        stringToParse = s;

                        while(charsToParse > 0) {
                            for(charIndex = 0; charIndex <= charsToParse; charIndex++) {
                                if(initialIndex === -1 && stringToParse.charAt(charIndex) === groupInitialDelimiter) {
                                    initialIndex = charIndex;
                                    continue;
                                }

                                if(initialIndex > -1 && finalIndex === -1 && stringToParse.charAt(charIndex) === groupFinalDelimiter) {
                                    finalIndex = charIndex;

                                    var valueExpressionToParse = stringToParse.substring(initialIndex + 1, finalIndex - initialIndex);
                                    var parsedValue = parseValueExpression(valueExpressionToParse).Result;
                                    var allTokenAdded = [];

                                    for(var currentNode = parsedValue.getHead(); currentNode; currentNode = currentNode.getNext()) {
                                        var tokenAdded = that.addToken(currentNode.getValue());
                                        allTokenAdded.push(tokenAdded);
                                    }

                                    return {
                                        CharIndex: charIndex,
                                        Result: allTokenAdded
                                    };
                                }
                            }

                            initialIndex = -1;
                            finalIndex = -1;
                            stringToParse = stringToParse.substring(charIndex + 1);
                            charsToParse = stringToParse.length;
                        }
                    }

                    var _charIndex = 0,
                    _charsToParse = expression.length - 1,
                    _stringToParse = expression,
                    result = new LinkedList();

                    while(_charsToParse > 0) {
                        for(_charIndex = 0; _charIndex <= _charsToParse; _charIndex++) {
                            if(_stringToParse.charAt(_charIndex) === groupInitialDelimiter) {
                                var r = parseGroupExpression(_stringToParse);
                                var groupTokens = r.Result;

                                for(var i = 0; i < groupTokens.length; i++) {
                                    groupTokens[i].select();
                                }

                                this.groupSelected();

                                _stringToParse = _stringToParse.substring(r.CharIndex + 1);

                                break;
                            }
                            else {
                                var r = parseValueExpression(_stringToParse);
                                var valueExpression = r.Result;

                                for(var currentNode = valueExpression.getHead(); currentNode; currentNode = currentNode.getNext()) {
                                    this.addToken(currentNode.getValue());
                                }

                                _stringToParse = _stringToParse.substring(r.CharIndex + 1);
                                break;
                            }
                        }

                        _charsToParse = _stringToParse.length;
                    }
                }

            }

        }

    }
}( );;