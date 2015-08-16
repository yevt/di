/**
 * Created by y.evtushenko on 06.08.15.
 */
import {Options} from './Options';
import {inject, assign} from './utils';
import * as Q from 'q';

export class Component implements IComponent {

    _options:IOptions;
    _factory:IFactory;
    _instances:Q.Promise<IService>[];

    constructor(opts:IComponentOptions) {
        this._options = new Options(opts);
        this._instances = [];
    }

    destroy() {
        return Q.all(this._instances)
            .then((services) => {
                var destroyPromises = services.map((service) => {
                    if (typeof service.destroy == 'function') {
                        try {
                            return Q.resolve(service.destroy());
                        } catch(ex) {
                            return Q.reject(ex);
                        }
                    }
                });

                return Q.all(destroyPromises);
            })
            .then(() => {
                this._instances = null;
                this._factory = null;
                this._options.destroy();
                this._options = null;
            })
    }

    getService(dependantServices?:IService[]):Q.Promise<IService> {
        var singleton = this.getOptions().get('singleton');
        var instance;
        var result;

        if (!singleton || (singleton && this._instances.length == 0)) {
            instance = this._createService(dependantServices);
            this._instances.push(instance);
        }

        if (singleton) {
            result = this._instances[0];
        } else {
            result = instance
        }

        return result;
    }

    getOptions():IOptions {
        return this._options;
    }

    _createService(dependantServices?:IService[]):Q.Promise<IService> {
        var factory = this.getOptions().get('func');
        var obj = this.getOptions().get('obj');

        if (factory != undefined && obj != undefined) {
            console.warn(`Both 'func' and 'obj' service sources defined, but only 'func' used`);
        }

        if (typeof factory == "function") {
            var dependencyList =
                this.getOptions().get('dependencies');
            var constructorInjectionMap =
                this.getOptions().get('inject.intoConstructor');
            var argsFromOptions =
                this.getOptions().get('args');
            var instanceInjectionMap =
                this.getOptions().get('inject.intoInstance');

            var blankInstance = Object.create(factory.prototype);
            var args = [];
            var constructorInjection;
            var instanceInjection;
            var factoryProduct;

            if (dependencyList) {
                if (!constructorInjectionMap) {
                    constructorInjectionMap = dependencyList;
                }

                constructorInjection = inject(dependencyList, dependantServices, constructorInjectionMap);
                assign(args, constructorInjection);
            }

            if (argsFromOptions) {
                assign(args, argsFromOptions);
            }

            if (instanceInjectionMap) {
                instanceInjection = inject(dependencyList, dependantServices, instanceInjectionMap);
                assign(blankInstance, instanceInjection);
            }

            try {
                factoryProduct = factory.apply(blankInstance, args);
                return Q.resolve(factoryProduct || blankInstance);
            } catch(ex) {
                error = new Error(ex.message);
                error.name = 'BAD_FACTORY';
                return Q.reject(error);
            }
        } else if (obj != undefined) {
            return Q.resolve(obj);
        } else {
            var error = new Error('No service source');
            error.name = 'NO_SERVICE_CODE';
            return Q.reject(error);
        }
    }
}