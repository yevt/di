/**
 * Created by y.evtushenko on 06.08.15.
 */

import {Context} from '../src/lib/Context';

import Q = require('q');
import chai = require('chai');
import sinon = require("sinon");
import sinonChai = require("sinon-chai");

import {Engine} from './mock/Engine';
import {Car} from './mock/Car';
import {Driver} from './mock/Driver';
import mocks = require('./mock/mocks');

var expect = chai.expect;
chai.use(sinonChai);

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

        expect(context._hasComponent('engine')).to.be.ok;
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

    it('Dependency validation cache', (done) => {
        var context = new Context({
            components: [
                {id: 'engine', func: () => {}}
            ]
        });

        sinon.spy(context, '_validateDependencies');

        context.get('engine').then(() => {
            expect(context._validateDependencies).to.be.calledOnce;
            done();
        }).done();
    });

    it('Destroy context', (done) => {
        var service = {
            destroy: function() {}
        };

        sinon.spy(service, 'destroy');

        var factory = () => {
            return service;
        };

        var context = new Context({
            components: [
                {id: 'engine', func: factory}
            ]
        });

        context.get('engine').then((engine) => {
            return context.destroy().then(() => {
                expect(engine.destroy).to.be.calledOnce;
                done();
            });
        }).done();
    });

    it('Destroy child contexts', (done) => {
        var service = {
            destroy: function() {}
        };

        sinon.spy(service, 'destroy');

        var factory = () => {
            return service;
        };

        var context1 = new Context({
            components: [
                {id: 'engine', func: factory}
            ]
        });

        var context2 = new Context({
            parentContext: context1
        });

        context2.get('engine').then((engine) => {
            return context2.destroy().then(() => {
                expect(engine.destroy).to.be.calledOnce;
                done();
            });
        }).done();
    });

    it('Object dependency type', (done) => {
        var context = new Context({
            components: [
                {id: 'engine', instance: {power: 200}},
                {id: 'car', func: (engine) => {
                    expect(engine.power).to.equal(200);
                    done();
                }, dependencies: ['engine']}
            ]
        });

        context.get('car').done();
    });

    it('Register after initialization', (done) => {
        var context = new Context({
            components: [
                {id: 'engine', instance: {power: 200}}
            ]
        });

        var e1 = context.get('engine').then((engine) => {
            return engine;
        });

        context.registerComponent({
            id: 'engine', func: () => {return {
                power: 300
            }}
        }, true);

        var e2 = context.get('engine');

        Q.all([e1, e2]).spread((engine1, engine2) => {
            expect(engine1.power).to.equal(200);
            expect(engine2.power).to.equal(300);
            done();
        }).done();
    });

    it('Duplicated component id', () => {
        var createContext = () => {
            return new Context({
                components: [
                    {id: 'engine', instance: {power: 200}},
                    {id: 'engine', instance: {power: 300}}
                ]
            })
        };

        expect(createContext).to.throw(`Duplicated component 'engine'`);
    });
});