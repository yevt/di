/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="../src/references.d.ts" />

import Context = require('../src/Context');

import q = require('q');
import chai = require('chai');

import Engine = require('./mock/Engine');
import Car = require('./mock/Car');
import Driver = require('./mock/Driver');

var expect = chai.expect;

var createEngine = () => {
    return new Engine;
};

var createCar = (engine) => {
    return new Car(engine);
};

describe('context', () => {

    it('Register dependency', () => {
        var context = new Context;

        context.registerComponent({
            id: 'engine',
            func: () => {
                return new Engine;
            }
        });

        expect(context.hasComponent('engine')).to.be.ok;
    });

    it('Get service without dependencies', (done) => {
        var context = new Context;

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
        var context = new Context;

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
        debugger;

        var context = new Context;

        context.get('car').catch((error) => {
            if (error.name = 'UNRESOLVED_DEPENDENCY') {
                done();
            }
        });
    });

    it('Component with constructor instead of factory', (done) => {
        var context = new Context({
            components: [
                {id: 'engine', func: Engine}
            ]
        });

        context.get('engine').then((engine) => {
            engine.start();
            done();
        });
    });

    it('Injection map', (done) => {
        var context = new Context({
            components: [
                {id: 'engine', func: createEngine},
                {id: 'car', func: createCar, dependencies: ['engine']},
                {
                    id: 'driver',
                    func: Driver,
                    dependencies: ['car'],
                    inject: {
                        intoConstructor: [{
                            car: 'car'
                        }]
                    }
                }
            ]
        });

        context.get('driver').then((driver) => {
            driver.drive();
            expect(driver).to.be.an.instanceOf(Driver);
            done();
        });
    });

    it('Create context with options', (done) => {
        var context = new Context({
            components: [
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
