/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="../typings/tsd.d.ts" />

import Context = require('../src/Context');

import q = require('q');
import chai = require('chai');

import Engine = require('./mock/Engine');
import Car = require('./mock/Car');

var expect = chai.expect;

var createEngine = () => {
    return new Engine;
};

var createCar = (engine) => {
    return new Car(engine);
};

describe('context', () => {

    var context:Context;

    before(() => {
        context = new Context;
    });

    it('Register dependency', () => {
        context.registerComponent({
            id: 'engine',
            func: () => {
                return new Engine;
            }
        });

        expect(context.hasComponent('engine')).to.be.ok;
    });

    it('Get service without dependencies', (done) => {
        context.registerComponent({
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
        context.registerComponent({
            id: 'engine',
            func: () => {
                return new Engine();
            }
        });

        context.registerComponent({
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

    it('Get unresolved dependency', (done) => {
        var context = new Context;

        context.get('car').catch((error) => {
            if (error.name = 'UNRESOLVED_DEPENDENCY') {
                done();
            }
        });
    });


    it('Create context with options', (done) => {
        var context = new Context({
            dependencies: [
                {id: 'engine', func: createEngine},
                {id: 'car', func: createCar, dependencies: ['engine']}
            ]
        });

        context.get('car').then((car) => {
            car.start();
            expect(car).to.be.an.instanceOf(Car);
            done();
        });
    });
});
