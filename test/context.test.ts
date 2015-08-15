/**
 * Created by y.evtushenko on 06.08.15.
 */

import {Context} from '../src/lib/Context';

import Q = require('q');
import chai = require('chai');

import {Engine} from './mock/Engine';
import {Car} from './mock/Car';
import {Driver} from './mock/Driver';
import mocks = require('./mock/mocks');

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
            func: () => {}
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
                return new Engine;
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
            debugger;
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
        var Engine = function() {

        };

        var context = new Context({
            components: [
                {
                    id: 'engine',
                    func: Engine,
                    singleton: true
                },
                {id: 'car1', func: Car, dependencies:['engine']},
                {id: 'car2', func: Car, dependencies:['engine']}
            ]
        });

        Q.allSettled([context.get('car1'), context.get('car2')])
        .spread((car1, car2) => {
            expect(car1._engine).to.equal(car2._engine);
            done();
        })
        .done();
    });

    it('Singleton factory wrapper', (done) => {
        var context = new Context({
            components: [
                {
                    id: 'engine',
                    func: Engine,
                    singleton: true
                },
                {id: 'car1', func: Car, dependencies:['engine']},
                {id: 'car2', func: Car, dependencies:['engine']}
            ]
        });

        Q.allSettled([context.get('car1'), context.get('car2')]).spread((car1, car2) => {
            expect(car1._engine).to.equal(car2._engine);
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

    it('Inject into instance', (done) => {
        var context = new Context({
            components: [
                {id: 'engine', func: mocks.injectIntoInstance.Engine},
                {
                    id: 'car',
                    func: mocks.injectIntoInstance.Car,
                    dependencies: ['engine'],
                    inject: {
                        intoInstance: {
                            _engine: 'engine'
                        }
                    }
                }
            ]
        });

        context.get('car').then((car) => {
            expect(car.isWorking()).to.be.true;
            done();
        }).done();
    });

    it('Extend context', (done) => {
        var fiatContext = new Context({
            components: [
                {
                    id: 'engine',
                    func: mocks.extendContext.FiatEngine
                },
                {
                    id: 'car',
                    func: mocks.extendContext.Car,
                    dependencies:['engine']
                }
            ]
        });

        var renoContext = new Context({
            parentContext: fiatContext,
            components: [
                {
                    id: 'engine',
                    func: mocks.extendContext.RenoEngine
                }
            ]
        });

        renoContext.get('car').then((car) => {
            expect(car.getEngine().getBrand()).to.equal('reno');
            done();
        }).done();
    });

    it('Bad factory', (done) => {
        var factory = () => {
            throw new Error('Bad factory');
        };

        var context = new Context({
            components: [
                {
                    id: 'object', func: factory
                }
            ]
        });

        context.get('object').catch((error) => {
            expect(error.message).to.equal('Bad factory');
            done();
        });
    });

    it('Circular dependency', (done) => {
        var context = new Context({
           components: [
               {id: 'a', func: () => {return 'result-a'}, dependencies: ['b']},
               {id: 'b', func: () => {return 'result-b'}, dependencies: ['a']}
           ]
        });

        context.get('a').catch((e) => {
            expect(e.name).to.equal('CIRCULAR_DEPENDENCY');
            done();
        }).done();
    });

    it('')
});