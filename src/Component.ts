/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import * as Q from 'q';
import Options from './Options';
import * as factoryWrappers from './factoryWrappers';
import {inject, resolveArray} from './utils';
import * as _  from 'lodash';

export default class Component implements IComponent {

    _options:IOptions;
    _factory:IFactory;

    constructor(opts:IComponentOptions) {
        this._options = new Options(opts);
    }

    getService(dependantServices?:Service[]):Q.Promise<Service> {
        var factory = this._getFactory();
        var dependencyList = this.getOptions().get('dependencies');
        var constructorInjectionMap = resolveArray(this.getOptions().get('inject.intoConstructor'));
        var instanceInjectionMap = this.getOptions().get('inject.intoInstance');
        var factoryArgs = _.assign([], dependantServices);
        var argsFromOptions = this.getOptions().get('args');
        var blankService;
        var factoryProduct;
        var constructorInjection;
        var instanceInjection;

        return Q.fcall(() => {
            blankService = Object.create(factory.prototype);

            if (instanceInjectionMap) {
                instanceInjection = inject(dependencyList, dependantServices, instanceInjectionMap);
                _.assign(blankService, instanceInjection);
            }

            if (constructorInjectionMap) {
                constructorInjection = inject(dependencyList, dependantServices, constructorInjectionMap);
                _.assign(factoryArgs, constructorInjection);
            }

            if (argsFromOptions) {
                _.assign(factoryArgs, argsFromOptions);
            }

            factoryProduct = factory.apply(blankService, factoryArgs);

            if (factoryProduct) {
                return factoryProduct;
            } else {
                return blankService;
            }
        });
    }

    getOptions():IOptions {
        return this._options;
    }

    _getFactory():IFactory {
        var factory = this._factory;
        var wrapper;

        if (!factory) {
            wrapper = this._selectFactoryWrapper();
            factory = this.getOptions().get('func');
            factory = wrapper(factory);
            this._factory = factory;
        }

        return factory;
    }

    _selectFactoryWrapper():IFactoryWrapper {
        var wrapper = this.getOptions().get('factoryWrapper');
        var error:Error;

        if (typeof wrapper == 'string') {
            wrapper = factoryWrappers[wrapper];
            if (!wrapper) {
                error = new Error(`Unknow factory wrapper '${wrapper}'`);
                error.name = 'Unknown factory wrapper';
                throw error;
            }
        }

        if (!wrapper) {
            wrapper = (factory) => {return factory};
        }

        return wrapper;
    }
}