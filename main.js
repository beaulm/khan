var debounce = require('lodash.debounce');
var esprima = require('esprima');
var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');
var api = require('./api');

var editor = ace.edit('editor');
editor.getSession().setMode('ace/mode/javascript');
editor.setTheme('ace/theme/monokai');

function checkCode(){
  document.getElementsByClassName('resultIndicator').className = 'resultIndicator';
  var checks = {
    mustContain: function(){return api.mustContain(esprima.parse(editor.getValue()), document.getElementById('mustContain').value.split())},
    cantContain: function(){return api.cantContain(esprima.parse(editor.getValue()), document.getElementById('cantContain').value.split())},
    matchesStructure: function(){return api.matchesStructure(esprima.parse(editor.getValue()), esprima.parse(document.getElementById('matchesStructure').value))}
  };
  for(var key in checks) {
    if(checks.hasOwnProperty(key) && document.getElementById(key).value !== '') {
      if(checks[key]()) {
        document.getElementById(key+'Status').className += ' passing';
      }
      else {
        document.getElementById(key+'Status').className += ' failing';
      }
    }
  }
}

editor.getSession().on('change', debounce(function(){
  try {
    checkCode();
  } catch (e) {
    console.log(e);
  }
}, 811));

[].forEach.call(document.getElementsByClassName('inputElement'), function(element){
  element.addEventListener('input', debounce(function(){
    try {
      checkCode();
    } catch (e) {
      console.log(e);
    }
  }, 811));
});
