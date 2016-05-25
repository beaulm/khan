#Building a Challenge Framework

### Installation
* Clone repository
* `npm install`
* `npm run build`
* Open index.html an enjoy!

### Limitations
* Match structure is by no means perfect yet. It's a proof of concept which is mostly tested against `VariableDeclarations`, `IfStatements`, `ForStatements` and `WhileStatements`. It may work with other builder objects/node types, but it likely doesn't work with all of them yet (such as `SwitchStatements`, `FunctionExpressions`, or `ExpressionStatements`).

### Improvements
* UI
  * Make the input boxes to be multi-select lists instead
  * Make textarea rich text as well
* Efficiency
  * Major gains could likely be made in the api, including using a more efficient search method than recursion
* Functionality
  * Instead of a flat list of ESTree AST node types, it would be cool to accept a full javascript object for Must Contain and Can't Contain which allowed for all the logical operators (code should contain `this` and `this` or `that` and not `other`).
  * The API could return response objects instead of just booleans, explaining why a test passed or failed.
