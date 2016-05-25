var debounce = require('lodash.debounce');
var esprima = require('esprima');
var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');
var api = require('./api');

//Setup the fancy editor
var editor = ace.edit('editor');
editor.getSession().setMode('ace/mode/javascript');
editor.setTheme('ace/theme/monokai');

//Run all the tests against the current code
function checkCode(){
  try {
    var checks = {
      mustContain: function(){return api.mustContain(esprima.parse(editor.getValue()), document.getElementById('mustContain').value.split())},
      cantContain: function(){return api.cantContain(esprima.parse(editor.getValue()), document.getElementById('cantContain').value.split())},
      matchesStructure: function(){return api.matchesStructure(esprima.parse(editor.getValue()), esprima.parse(document.getElementById('matchesStructure').value))}
    };
    for(var key in checks) {
      //Reset the status indicator
      document.getElementById(key+'Status').className = 'resultIndicator';
      //Only run the tests for this constraint if it's not empty
      if(checks.hasOwnProperty(key) && document.getElementById(key).value !== '') {
        //If the code passed for this constraint
        if(checks[key]()) {
          document.getElementById(key+'Status').className += ' passing';
        }
        else {
          document.getElementById(key+'Status').className += ' failing';
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}

//After the user has started typing in the editor and then stopped for 811 milliseconds, check the code
editor.getSession().on('change', debounce(checkCode, 811));

//After the user has started typing in a form field and then stopped for 811 milliseconds, check the code
[].forEach.call(document.getElementsByClassName('inputElement'), function(element){
  element.addEventListener('input', debounce(checkCode, 811));
});
