var assert = require('chai').assert;
var esprima = require('esprima');
var api = require('../api');

describe('Api', function() {

  describe('#mustContain()', function () {
    it('should return true if the supplied code contains everything in the array', function () {
      assert.equal(true, api.mustContain(esprima.parse('var a=1;'), ['VariableDeclaration']));
      assert.equal(true, api.mustContain(esprima.parse('if(1==1){var a=1;}'), ['VariableDeclaration']));
      assert.equal(true, api.mustContain(esprima.parse('for(var i=0; i<10; i++){var a=1;}'), ['VariableDeclaration']));
    });
    it('should return false if the supplied code doesn\'t contain something in the array', function () {
      assert.equal(false, api.mustContain(esprima.parse('var a=1;'), ['IfStatement']));
    });
  });

  describe('#cantContain()', function () {
    it('should return true if the supplied code doesn\'t contain everything in the array', function () {
      assert.equal(true, api.cantContain(esprima.parse('var a=1;'), ['IfStatement']));
      assert.equal(true, api.cantContain(esprima.parse('if(1==1){var a=1;}'), ['ForStatement']));
    });
    it('should return false if the supplied code contains something in the array', function () {
      assert.equal(false, api.cantContain(esprima.parse('var a=1;'), ['VariableDeclaration']));
      assert.equal(false, api.cantContain(esprima.parse('for(var i=0; i<10; i++){if(1==1){var a=1;}}'), ['VariableDeclaration', 'IfStatement']));
    });
  });

  describe('#matchesStructure()', function () {
    it('should return true if the supplied code matches the structure of the test code', function () {
      assert.equal(true, api.matchesStructure(esprima.parse('var a=1;'), esprima.parse('var a=1;')));
      assert.equal(true, api.matchesStructure(esprima.parse('if(1==1){var a=1;}'), esprima.parse('if(1==1){var a=1;}')));
      assert.equal(true, api.matchesStructure(esprima.parse('for(var i=0;i<10;i++){var a=0}'), esprima.parse('for(var i=0;i<10;i++){var a=0}')));
    });
    it('should return false if the supplied code doesn\'t match the structure of the test code', function () {
      assert.equal(false, api.matchesStructure(esprima.parse('var a=1;'), esprima.parse('if(1==1){}')));
      assert.equal(false, api.matchesStructure(esprima.parse('var a=1;if(1==1){}'), esprima.parse('if(1==1){}var a=1;')));
      assert.equal(false, api.matchesStructure(esprima.parse('if(1==1){var a=1;}'), esprima.parse('var a=1;if(1==1){}')));
    });
  });

});
