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
    //Recursively go through each statement in the user code
    function searchForFunctionality(uCode, tCode) {
      var codeIndex = 0;
      var numberOfStatements = uCode.body.length;
      for(var i=0; i<numberOfStatements; i++) {
        //If it matches whatever we're looking for in the test code
        if(uCode.body[i].type === tCode.body[codeIndex].type) {
          //Move on to the next thing in the test code
          codeIndex++;

          if(codeIndex === tCode.body.length) {
            return true;
          }

          if(newBlock(tCode.body[codeIndex]) === false) {
            return true;
          }
          tCode = newBlock(tCode.body[codeIndex]);
          codeIndex = 0;
        }

        //If the current functionality creates new block scope
        if(newBlock(uCode.body[i]) !== false) {
          return searchForFunctionality(newBlock(uCode.body[i]), tCode);
        }
      }
      return false;
    }

    return searchForFunctionality(userCode, testCode);
  }
}
