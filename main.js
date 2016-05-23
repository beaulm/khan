var debounce = require('lodash.debounce');
var esprima = require('esprima');
var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');
var api = require('./api');

var editor = ace.edit('editor');
editor.getSession().setMode('ace/mode/javascript');
editor.setTheme('ace/theme/monokai');
editor.getSession().on('change', debounce(function(){
  try {
    console.log(api.matchesStructure(esprima.parse(editor.getValue()), esprima.parse('if(1==1){var a=1;}')));
  } catch (e) {}
}, 811));
