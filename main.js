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
    console.log(api.mustContain(esprima.parse(editor.getValue()), ['VariableDeclaration']));
  } catch (e) {}
}, 811));
