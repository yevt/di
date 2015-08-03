/// <reference path="../typings/tsd.d.ts" />

import chai = require('chai');
import SomeModule = require('../src/SomeModule');

describe('SomeClass', () => {
    var o;

    before(() => {
        o = new SomeModule.SomeClass();
    });

    it('.someMethod() returns "some value"', () => {
        chai.assert(o.someMethod(), 'some value');
    });
});
