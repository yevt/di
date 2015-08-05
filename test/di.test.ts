/// <reference path="../typings/tsd.d.ts" />

import di = require('../src/di');
import Context = require('../src/Context');

import q = require('q');
import chai = require('chai');
var expect = chai.expect;

describe('di', () => {
    var contextPromise:q.Promise<Context>;

    it('Create context', (done) => {
        contextPromise = di.createContext();
        contextPromise.then((context) => {
            expect(context).to.be.an.instanceOf(Context);
            done();
        })
        .done();
    });

    it('Destroy context', (done) => {
        contextPromise.then((context) => {
            context.dispose();
            done();
        })
        .done();
    });
});
