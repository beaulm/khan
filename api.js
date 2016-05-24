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
  mustContain: function(codeTree, functionality) {
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

  cantContain: function(codeTree, functionality) {
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
          return searchForFunctionality(newBlock(code.body[i]));
        }
      }

      return true;
    }

    return searchForFunctionality(codeTree);
  },

  matchesStructure: function(userCode, testCode) {
    var indexes = [0];

    function getStatemntAt(indexList) {
      var statement = testCode.body;
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

    function getArrayAt(indexList) {
      var statement = testCode.body;
      for(var a=0; a<indexList.length; a++) {
        statement = statement[indexList[a]];
        if(statement.hasOwnProperty('consequent')) {
          statement = statement.consequent;
        }
        else if(statement.hasOwnProperty('body')) {
          statement = statement.body;
        }
      }
      return statement;
    }

    function rollUp() {
      if(indexes.length === 1) {
        var parentArray = testCode;
      }
      else {
        var tmpArray = indexes.slice(0, -1);
        var parentArray = getArrayAt(tmpArray);
      }
      if(parentArray.body.length > (indexes[indexes.length-1]+1)) {
        indexes[indexes.length-1]++;
        return false;
      }
      else {
        indexes.pop();
        if(indexes.length === 0) {
          return true;
        }
        return rollUp();
      }
    }

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
      indexes.pop();
      return false;
    }

    return searchForFunctionality(userCode);
  }
}
