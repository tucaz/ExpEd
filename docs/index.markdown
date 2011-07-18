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

The simplest way to start using ExpEd is simply add a reference to it, create the editor object and pass the data and operators that you want to allow in the expression: 

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

With this HTML:

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