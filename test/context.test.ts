/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="../src/references.d.ts" />

import Context = require('../src/Context');

import Q = require('q');
import chai = require('chai');

import Engine = require('./mock/Engine');
import Car = require('./mock/Car');
import Driver = require('./mock/Driver');
import utils = require('../src/utils');

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

    it('Throw unresolved dependency', (done) => {
        var context = new Context;

        context.get('car').catch((error) => {
            if (error.name = 'UNRESOLVED_DEPENDENCY') {
                done();
            }
        }).done();
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
        }).done();
    });

    it('Inject into constructor', (done) => {
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
        }).done();
    });

    it('Inject into first argument of constructor', (done) => {
        var context = new Context({
            components: [
                {id: 'engine', func: createEngine},
                {id: 'car', func: createCar, dependencies: ['engine']},
                {
                    id: 'driver',
                    func: Driver,
                    dependencies: ['car'],
                    inject: {
                        intoConstructor: {  //no array!
                            car: 'car'
                        }
                    }
                }
            ]
        });

        context.get('driver').then((driver) => {
            driver.drive();
            expect(driver).to.be.an.instanceOf(Driver);
            done();
        }).done();
    });

    it('Custom factory wrapper', (done) => {
        var context = new Context({
            components: [
                {
                    id: 'engine',
                    func: Engine,
                    factoryWrapper: (factory) => {
                        var cachedService;

                        return (...args) => {
                            if (!cachedService) {
                                cachedService = utils.applyFactory(factory, args);
                            }

                            return cachedService
                        }
                    }
                },
                {id: 'car1', func: Car, dependencies:['engine']},
                {id: 'car2', func: Car, dependencies:['engine']}
            ]
        });

        Q.all([context.get('car1'), context.get('car2')]).then((cars) => {
            expect(cars[0]._engine).to.equal(cars[1]._engine);
            done();
        }).done();
    });

    it('Singleton factory wrapper', (done) => {
        var context = new Context({
            components: [
                {
                    id: 'engine',
                    func: Engine,
                    factoryWrapper: 'singleton'
                },
                {id: 'car1', func: Car, dependencies:['engine']},
                {id: 'car2', func: Car, dependencies:['engine']}
            ]
        });

        Q.all([context.get('car1'), context.get('car2')]).then((cars) => {
            expect(cars[0]._engine).to.equal(cars[1]._engine);
            done();
        }).done();
    });

    it('Factory arguments', (done) => {
        var context = new Context({
            components: [
                {id: 'engine', func: Engine, args: ['reno']}
            ]
        });

        context.get('engine').then((engine) => {
            engine.start();
            expect(engine._brand).to.equal('reno');
            done();
        }).done();
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
        }).done();
    });

});
