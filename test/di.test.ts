/// <reference path="../typings/tsd.d.ts" />

import di = require('../src/di');

import q = require('q');
import chai = require('chai');
var expect = chai.expect;

describe('di', () => {

    it('Create context', (done) => {
        di.createContext().then((context) => {
            expect(context).to.be.ok;
            done();
        })
        .done();
    });

    it('Destroy context', (done) => {
        di.createContext().then((context) => {
            context.destroy();
            done();
        })
        .done();
    });
});
