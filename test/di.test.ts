/// <reference path="../typings/tsd.d.ts" />

import di = require('../src/di');

import q = require('q');
import chai = require('chai');
import Engine = require('./mock/Engine');
import Car = require('./mock/Car');

var expect = chai.expect;

describe('di', () => {
    it('Create context', (done) => {
        di.createContext().then((context) => {
            expect(context).to.be.ok;
            done();
        })
        .done();
    });

    it('Create context with options', (done) => {
        di.createContext({
            components: [
                {id: 'engine', func: Engine},
                {id: 'car', func: Car, dependencies: ['engine']}
            ]
        }).then((context) => {
            context.get('car').then((car) => {
                car.start();
                expect(car).to.be.an.instanceOf(Car);
                done();
            });
        }).done();
    });
});
