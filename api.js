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
        if(statement.hasOwnProperty('body')) {
          //Check that for matching statements as well (recursion)
          searchForFunctionality(statement.body);
        }
        if(statement.hasOwnProperty('consequent') && statement.consequent.hasOwnProperty('type') && statement.consequent.type === 'BlockStatement' && statement.consequent.hasOwnProperty('body')) {
          //Check that for matching statements as well (recursion)
          searchForFunctionality(statement.consequent);
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
        if(code.body[i].hasOwnProperty('body')) {
          //Check that for matching statements as well (recursion)
          return searchForFunctionality(code.body[i].body);
        }
        if(code.body[i].hasOwnProperty('consequent') && code.body[i].consequent.hasOwnProperty('type') && code.body[i].consequent.type === 'BlockStatement' && code.body[i].consequent.hasOwnProperty('body')) {
          //Check that for matching statements as well (recursion)
          return searchForFunctionality(code.body[i].consequent);
        }
      }

      return true;
    }

    return searchForFunctionality(codeTree);
  },

  matchesStructure: function(userCode, testCode) {
    var testCodeIndex = 0;

    //Recursively go through each statement in the user code
    function searchForFunctionality(code) {
      var numberOfStatements = code.body.length;
      for(var i=0; i<numberOfStatements; i++) {
        //If it matches whatever we're looking for in the test code
        if(code.body[i].type === testCode.body[testCodeIndex].type) {
          //Move on to the next thing in the test code
          testCodeIndex++;

          if(testCodeIndex === testCode.body.length) {
            return true;
          }
        }

        // If the current functionality creates new block scope
        if(code.body[i].hasOwnProperty('body')) {
          //Check that for matching statements as well (recursion)
          return searchForFunctionality(code.body[i].body);
        }
        if(code.body[i].hasOwnProperty('consequent') && code.body[i].consequent.hasOwnProperty('type') && code.body[i].consequent.type === 'BlockStatement' && code.body[i].consequent.hasOwnProperty('body')) {
          //Check that for matching statements as well (recursion)
          return searchForFunctionality(code.body[i].consequent);
        }
      }
      return false;
    }

    return searchForFunctionality(userCode);
  }
}
