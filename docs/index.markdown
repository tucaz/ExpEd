---
layout: default
title: ExpEd Documentation @ GitHub
---

##Purpose

The purpose of this small library is to allow business users or any other laypeople to write complex expressions in an easy way. Example: boolean expressions, math expressions, etc.

##Dependencies

* [jQuery 1.3.2 or higher](http://docs.jquery.com/Downloading_jQuery)
* [LinkedList](https://github.com/tucaz/LinkedList)

##Simplest usage

The simplest way to start using ExpEd is simply add a reference to it, create the editor object and pass the data and operators that you want to allow in the expression 

    App.js

    $(function(){
        var editor = new expEd.Editor({
                expressionContainer: $('#expression'), 
                tokens: [{
                    name: 'Values',
                    values: ['1', '2', '3','4', '5', '6','7', '8', '9','0']
                }], 
                operators: ['+','-','/','*']
            });
    
        editor.createUI($('#controls'));
    })

With this HTML

    editor.html

    <!DOCTYPE html>
    <html>
    <head>
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
        <script type="text/javascript" src="lib/LinkedList.js"></script>
        <script type="text/javascript"src="lib/editor.js"></script>
        <script type="text/javascript"src="app.js"></script>
        <link rel="stylesheet" type="text/css" href="editor.css" />        
    </head>
    <body>
        <div id="controls">
        </div>
        <div id="expression">
        </div>
    </body>
    </html>

##Custom Mode

If you want to use it without the default token/operator/buttons selection (which sucks actually - help wanted!) you can customize every option and call editor's method with you own buttons

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

HTML

    <div id="controls">
        <select id="values">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
        </select>
        <input type="button" id="add-token" value="Add Selected Number" />
        <br>
        <select id="op">
            <option value="+">+</option>
            <option value="/">/</option>
            <option value="-">-</option>
            <option value="*">*</option>
            <option value="%">%</option>
        </select>
        <input type="button" id="add-op" value="Add Selected Operator" />
    </div>        
    <div id="expression">            
    </div>
    <div id="buttons">                        
        <input type="button" id="group" value="Group/Ungroup selected" />
        <input type="button" id="remove" value="Remove selected" />
        <input type="button" id="show" value="Alert Expression" />
    </div>        

##API Documentation

Below is a complete description of every option, event and method avaiable. Drop me a message if you need any help to understand it. 

###Options

Option | Description |
:------------|:------------|
tokens | Array of tokens that ExpEd should use when you tell it to build the UI for you |
operators | Array of strings the ExpEd should treat as operator tokens |
expressionContainer | A div that will be used by ExpEd to create and show the expression being desined |
allowOperatorSequence | Boolean value indicating wheter two operators or more can be used sequentially in an expression. Default value is **false** |
allowTokenSequence | Boolean value indicating wheter two value tokens or more can be used sequentially in an expression. Default value is **false** |

###Events

Event | Description |
:------------|:------------|
onError | Event called when some unauthorized operation is executed in the Editor. The callback method should expect a parameter with the error message |

#### Unauthorized operations include: 

* Adding two operators in a sequence when allowOperatorSequence is set to false
* Start an expression with an operator when allowOperatorSequence is set to false
* Adding two value tokens in a sequence when allowTokenSequence is set to false
* Selecting just one token when creating a group
* Selecting operators as left or right parts of a group

###Methods

Method | Parameters | Description |
:-----------|:-----------|:------------|
getControlPrefix| |Returns the string that the Editor uses to prefix IDs when creating controls with createUI method|
createUI|**controlsContainer**: html container where controls will be placed in|Based on information received by the constructor, create all controls needed to perform UI operations with the Editor: add token/operator, remove selected, unselect all, clear all, group/ungroup selected|
getLength| |Returns an int with the length of the expression being built|
addToken|**t**: Value of the token or operator to be added|Adds a token to the expression. Should be used when adding value tokens or operators|
groupSelected| |Take all selected tokens and turn them into a group|
removeSelected| |Remove all selected tokens from the expression|
unselectAll| |Unselect all selected tokens|
clearAll| |Remove all exsting tokens from the expression being built|
toString| |Returns a string containing the built expression|
loadExpression|**expression**: string with the expression to be loaded **allowedOperators**: array with strings identifying each operator in the expression|Loads a given expression. This is the inverse path of building a new expression. Used to edit existing expressions. Currently works with all expression except the ones containing nested groups (already in TODO List)|