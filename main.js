var debounce = require('lodash.debounce');
var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');
var api = require('./api');

//Setup the fancy editor
var editor = ace.edit('editor');
editor.getSession().setMode('ace/mode/javascript');
editor.setTheme('ace/theme/monokai');

//Make the matchesStructure input fancy too
var matchesStructureInput = ace.edit('matchesStructure');
matchesStructureInput.getSession().setMode('ace/mode/javascript');
matchesStructureInput.setTheme('ace/theme/monokai');

//Run all the tests against the current code
function checkCode(){
  try {
    var checks = {
      mustContain: function(){return api.mustContain(editor.getValue(), document.getElementById('mustContain').value.replace(/ /g, '').split(','))},
      cantContain: function(){return api.cantContain(editor.getValue(), document.getElementById('cantContain').value.replace(/ /g, '').split(','))},
      matchesStructure: function(){return api.matchesStructure(editor.getValue(), matchesStructureInput.getValue())}
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

//After the user has started typing in an editor and then stopped for 811 milliseconds, check the code
editor.getSession().on('change', debounce(checkCode, 811));
matchesStructureInput.getSession().on('change', debounce(checkCode, 811));

//After the user has started typing in a form field and then stopped for 811 milliseconds, check the code
[].forEach.call(document.getElementsByClassName('inputElement'), function(element){
  element.addEventListener('input', debounce(checkCode, 811));
});
