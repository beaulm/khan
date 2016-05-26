'use strict';
var esprima = require('esprima');

//Check if the current statement creates new block scope
function newBlock(statement) {
  if(statement.hasOwnProperty('body')) {
    return statement.body;
  }
  if(statement.hasOwnProperty('consequent') && statement.consequent.hasOwnProperty('type') && statement.consequent.type === 'BlockStatement' && statement.consequent.hasOwnProperty('body')) {
    return statement.consequent;
  }
  return false;
}

module.exports = {
  /**
  * @desc mustContain() Checks if a code tree contains all the functionality in a given array
  *
  * @param {string} [code] - Code you'd like to test against in ESTree AST format
  * @param {array} [functionality] - Array of builder objects you'd like to check the code for
  *
  * @return {bool} - True IFF the code contains ALL the listed functionality
  */
  mustContain: function(code, functionality) {
    if(typeof code !== 'string' || functionality.constructor !== Array) {
      return false;
    }

    //Try to parse the submitted code
    try {
      var codeTree = esprima.parse(code);
    } catch (e) {
      return false;
    }

    function searchForFunctionality(code) {
      //Go through each statement
      code.body.forEach(function(statement){
        //Go through the list of functionality that still needs to be found
        functionality = functionality.filter(function(specificFunctionality){
          //If the current statment matches the current functionality
          if(statement.type === specificFunctionality) {
            //Remove it from the list of functionality we still need to find
            return false;
          }
          return true;
        });

        //If the current functionality creates new block scope
        if(newBlock(statement) !== false) {
          searchForFunctionality(newBlock(statement));
        }
      });
    }

    searchForFunctionality(codeTree);

    //If the list of functionality still to find is zero
    if(functionality.length === 0) {
      //Return true (we found everything!)
      return true;
    }
    //Otherwise return false (we didn't find everything :( )
    return false;
  },

  /**
  * @desc cantContain() Checks if a code tree contains any of the functionality in a given array
  *
  * @param {string} [code] - Code you'd like to test against in ESTree AST format
  * @param {array} [functionality] - Array of builder objects you'd like to check the code for
  *
  * @return {bool} - True IFF the code contains NONE the listed functionality
  */
  cantContain: function(code, functionality) {
    if(typeof code !== 'string' || functionality.constructor !== Array) {
      return false;
    }

    //Try to parse the submitted code
    try {
      var codeTree = esprima.parse(code);
    } catch (e) {
      return false;
    }

    function searchForFunctionality(code) {
      //Go through each statement
      var numberOfStatements = code.body.length;
      for(var i=0; i<numberOfStatements; i++) {
        //Go through the list of banned functionality
        var sizeOfFunctionalityList = functionality.length;
        for(var j=0; j<sizeOfFunctionalityList; j++) {
          //If the current statment matches the current functionality
          if(code.body[i].type === functionality[j]) {
            //Stop looking, we've found something
            return false;
          }
        }

        //If the current functionality creates new block scope
        if(newBlock(code.body[i]) !== false) {
          if(!searchForFunctionality(newBlock(code.body[i]))) {
            return false;
          }
        }
      }

      return true;
    }

    return searchForFunctionality(codeTree);
  },

  /**
  * @desc matchesStructure() Checks if one block of code contains the same structure as another
  *
  * @param {string} [userCode] - Code which must contain a certain structure ESTree AST format
  * @param {string} [testCode] - Code used to match the structure of the other block of code ESTree AST format
  *
  * @return {bool} - True if userCode is a superset of testCode (extra statments in userCode don't matter)
  */
  matchesStructure: function(userCode, testCode) {
    if(typeof userCode !== 'string' || typeof testCode !== 'string') {
      return false;
    }

    //Try to parse the submitted code
    try {
      userCode = esprima.parse(userCode);
      testCode = esprima.parse(testCode);
    } catch (e) {
      return false;
    }

    //The indexes variable stores an array of which statment number we're current inspecting at each level of the tree
    var indexes = [0];
    //This normailizes the code to test against so traversing it doesn't have a weird edge condition at the beginning
    var newTestCode = {body: testCode};

    //Takes a portion of our index list and returns a portion of the code tree
    function getStatemntAt(indexList) {
      var statement = newTestCode.body.body;
      for(var a=0; a<indexList.length; a++) {
        if(statement.hasOwnProperty('consequent')) {
          statement = statement.consequent.body;
        }
        else if(statement.hasOwnProperty('body')) {
          statement = statement.body.body;
        }
        statement = statement[indexList[a]];
      }
      return statement;
    }

    //Takes a portion of our index list and returns an array of statements
    function getArrayAt(indexList) {
      var statement = newTestCode;
      for(var a=0; a<(indexList.length-1); a++) {
        if(statement.hasOwnProperty('consequent')) {
          statement = statement.consequent.body;
        }
        else if(statement.hasOwnProperty('body')) {
          statement = statement.body.body;
        }
        statement = statement[indexList[a]];
      }
      if(statement.hasOwnProperty('consequent')) {
        statement = statement.consequent;
      }
      else if(statement.hasOwnProperty('body')) {
        statement = statement.body;
      }
      return statement;
    }

    //Try advancing our internal index counters
    function rollUp() {
      //If we're at the root of the tree
      if(indexes.length === 1) {
        var parentArray = newTestCode;
      }
      else {
        var tmpArray = indexes.slice(0, -1);
        var parentArray = getArrayAt(tmpArray);
      }
      //If we can advance to the next sibling
      if(parentArray.body.length > (indexes[indexes.length-1]+1)) {
        indexes[indexes.length-1]++;
        return false;
      }
      //If we need to advance the parent instead
      else {
        indexes.pop();
        if(indexes.length === 0) {
          return true;
        }
        return rollUp();
      }
    }

    //Continue traversing the tree, either to the next child, sibling, or up to the parent (then down again later if applicable)
    function advanceCurrentStatement() {
      //Check if we can go further down the tree
      var currentStatement = getStatemntAt(indexes);
      if(currentStatement.hasOwnProperty('consequent') || currentStatement.hasOwnProperty('body')) {
        indexes.push(0);
        return false;
      }

      //Check if we can move on to the next sibling or up to the next parent
      return rollUp();
    }

    //Recursively go through each statement in the user code
    function searchForFunctionality(uCode) {
      var numberOfStatements = uCode.body.length;
      var currentStatement = getStatemntAt(indexes);
      for(var i=0; i<numberOfStatements; i++) {
        //If it matches whatever we're looking for in the test code
        if(uCode.body[i].type === currentStatement.type) {
          if(advanceCurrentStatement()) {
            return true;
          }
        }
        //If the current functionality creates new block scope
        if(newBlock(uCode.body[i]) !== false) {
          return searchForFunctionality(newBlock(uCode.body[i]));
        }
      }
      //If we reached this point we hit a dead end and have to backtrack :(
      indexes.pop();
      return false;
    }

    return searchForFunctionality(userCode);
  }
}
