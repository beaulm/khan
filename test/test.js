var assert = require('chai').assert;
var api = require('../api');

describe('Api', function() {

  describe('#mustContain()', function () {
    it('should return true if the supplied code contains everything in the array', function () {
      assert.equal(true, api.mustContain('var a=1;', ['VariableDeclaration']));
      assert.equal(true, api.mustContain('if(1==1){var a=1;}', ['VariableDeclaration']));
      assert.equal(true, api.mustContain('for(var i=0; i<10; i++){var a=1;}', ['VariableDeclaration']));
      assert.equal(true, api.mustContain('var a=function(){if(1==1){var b=2;}};', ['IfStatement']));
    });
    it('should return false if the supplied code doesn\'t contain something in the array', function () {
      assert.equal(false, api.mustContain('var a=1;', ['IfStatement']));
    });
    it('should return false if the input is bad', function () {
      assert.equal(false, api.mustContain([], ['IfStatement']));
      assert.equal(false, api.mustContain('var a=1;', 'tadf'));
    });
  });

  describe('#cantContain()', function () {
    it('should return true if the supplied code doesn\'t contain everything in the array', function () {
      assert.equal(true, api.cantContain('var a=1;', ['IfStatement']));
      assert.equal(true, api.cantContain('if(1==1){var a=1;}', ['ForStatement']));
    });
    it('should return false if the supplied code contains something in the array', function () {
      assert.equal(false, api.cantContain('var a=1;', ['VariableDeclaration']));
      assert.equal(false, api.cantContain('for(var i=0; i<10; i++){if(1==1){var a=1;}}', ['VariableDeclaration', 'IfStatement']));
    });
    it('should return false if the input is bad', function () {
      assert.equal(false, api.cantContain([], ['IfStatement']));
      assert.equal(false, api.cantContain('var a=1;', 'tadf'));
    });
  });

  describe('#matchesStructure()', function () {
    it('should return true if the supplied code matches the structure of the test code', function () {
      assert.equal(true, api.matchesStructure('var a=1;', 'var a=1;'));
      assert.equal(true, api.matchesStructure('if(1==1){var a=1;}', 'if(1==1){var a=1;}'));
      assert.equal(true, api.matchesStructure('if(1==1){if(2==2){var a=1;}}', 'if(1==1){if(2==2){var a=1;}}'));
      // assert.equal(true, api.matchesStructure('if(1==1){var a=1;}if(1==1){var b=1;}', 'if(1==1){var a=1;}if(1==1){var b=1;}'));
      assert.equal(true, api.matchesStructure('if(1==1){var b=2;if(2==2){var a=1;}}', 'if(1==1){if(2==2){var a=1;}}'));
      assert.equal(true, api.matchesStructure('if(1==1){if(2==2){var a=1;}var b=2;}', 'if(1==1){if(2==2){var a=1;}}'));
      assert.equal(true, api.matchesStructure('for(var i=0;i<10;i++){var a=0}', 'for(var i=0;i<10;i++){var a=0}'));
      assert.equal(true, api.matchesStructure('for(var i=0;i<10;i++){for(var j=0;j<10;j++){var a=0}}', 'for(var i=0;i<10;i++){for(var j=0;j<10;j++){var a=0}}'));
      assert.equal(true, api.matchesStructure('if(1==1){for(var j=0;j<10;j++){var a=0}}', 'if(1==1){for(var j=0;j<10;j++){var a=0}}'));
      assert.equal(true, api.matchesStructure('for(var i=0;i<10;i++){if(1==1){var a=0}}', 'for(var i=0;i<10;i++){if(1==1){var a=0}}'));
      assert.equal(true, api.matchesStructure('var a=function(){}', 'var a=function(){}'));
      assert.equal(true, api.matchesStructure('var a=1;var b=function(){var c=2;};', 'var a=1;var b=function(){var c=2;};'));
    });
    it('should return false if the supplied code doesn\'t match the structure of the test code', function () {
      assert.equal(false, api.matchesStructure('var a=1;', 'if(1==1){}'));
      assert.equal(false, api.matchesStructure('var a=1;if(1==1){}', 'if(1==1){}var a=1;'));
      assert.equal(false, api.matchesStructure('var a=1;if(1==1){}', 'if(1==1){var a=1;}'));
      assert.equal(false, api.matchesStructure('var a=1;if(1==1){var b=2;var c=3;}var d=4', 'if(1==1){if(2==2){var a=1;}}'));
      // assert.equal(false, api.matchesStructure('var a=1;var b=function(){};', 'var a=1;var b=function(){var c=2;};'));
    });
    it('should return false if the input is bad', function () {
      assert.equal(false, api.matchesStructure('var a=1;', []));
      assert.equal(false, api.matchesStructure([], 'var a=1;'));
    });
  });

});
