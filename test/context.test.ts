/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="../typings/tsd.d.ts" />

import Engine = require('./mock/Engine');
import Car = require('./mock/Car');

import Context = require('../src/Context');

import q = require('q');
import chai = require('chai');
var expect = chai.expect;

describe('context', () => {
    var context:Context;

    before(() => {
        context = new Context;
    });

    it('Register dependency', () => {
        var factory = () => {
            return new Engine;
        };

        context.register({
            id: 'engine',
            func: factory
        });

        expect(context.hasDependency('engine')).to.equal(true);
    });

    it('Get service without dependencies', (done) => {
        context.register({
            id: 'engine',
            func: () => {
                return new Engine();
            }
        });

        context.get('engine').then((engine) => {
            expect(engine).to.be.an.instanceOf(Engine);
            done();
        })
        .done();
    });

    it('Get service with trivial dependency', (done) => {
        context.register({
            id: 'engine',
            func: () => {
                return new Engine();
            }
        });

        context.register({
            id: 'car',
            func: (engine) => {
                return new Car(engine);
            },
            dependencies: ['engine']
        });

        context.get('car').then((car) => {
            if (car.start()) {
                done();
            }
        })
        .done();
    });
});
