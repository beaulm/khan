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
        var numberOfStatements = code.body.length-1;
        for(var i=numberOfStatements; i>=0; i--) {
          //Go through the list of banned functionality
          var sizeOfFunctionalityList = functionality.length-1;
          for(var j=sizeOfFunctionalityList; j>=0; j--) {
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
        }

        return true;
      }

      return searchForFunctionality(codeTree);
    }
}
