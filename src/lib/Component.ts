/**
 * Created by y.evtushenko on 06.08.15.
 */
import {Options} from './Options';
import {inject, wrapIntoArray, assign, clone} from './utils';
import * as Q from 'q';

export class Component implements IComponent {

    _options:IOptions;
    _factory:IFactory;
    _cachedServicePromise:Q.Promise<IService>;
    _instances:Q.Promise<IService>[];

    constructor(opts:IComponentOptions) {
        this._options = new Options(opts);
        this._instances = [];
    }

    destroy() {
        Q.all(this._instances)
            .then((services) => {
                services.forEach((service) => {
                    if (typeof service.destroy == 'function') {
                        service.destroy();
                    }
                });
            })
            .then(() => {
                this._instances = null;
                this._cachedServicePromise = null;
                this._factory = null;
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

    _createService(dependantServices?:IService[]):Q.Promise<IService> {
        var dependencyList =
            clone(this.getOptions().get('dependencies'));
        var constructorInjectionMap =
            clone(this.getOptions().get('inject.intoConstructor'));
        var argsFromOptions =
            clone(this.getOptions().get('args'));
        var instanceInjectionMap =
            clone(this.getOptions().get('inject.intoInstance'));
        var factory = this.getOptions().get('func');

        var blankInstance = Object.create(factory.prototype);
        var args = [];
        var constructorInjection;
        var instanceInjection;
        var factoryProduct;

        if (dependencyList) {
            if (!constructorInjectionMap) {
                constructorInjectionMap = dependencyList;
            }

            constructorInjectionMap = wrapIntoArray(constructorInjectionMap);
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

        return Q.fcall(() => {
            factoryProduct = factory.apply(blankInstance, args);
            return factoryProduct || blankInstance;
        });
    }

    getOptions():IOptions {
        return this._options;
    }
}