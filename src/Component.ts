/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import Q = require('q');
import Options = require('./Options');
import helpers = require('./helpers');

class Component implements IComponent {
    _options:IOptions;
    _factory:Factory;

    constructor(opts:IComponentOptions) {
        this._options = new Options(opts);
    }

    getService(dependantServices?:Service[]):Q.Promise<Service> {
        var factory = this._getFactory();
        var dependencyList = this._getDependencyList();
        var constructorInjectionMap = this._getConstructorInjectionMap();
        var factoryArgs;

        if (constructorInjectionMap) {
            factoryArgs = helpers.inject(dependencyList, dependantServices, constructorInjectionMap);
        } else {
            factoryArgs = dependantServices;
        }

        return Q.resolve(Component._applyFactory(factory, factoryArgs));
    }

    getOptions():IOptions {
        return this._options;
    }

    _getConstructorInjectionMap() {
        var injectionMap = this.getOptions().get('inject.intoConstructor');
        if (injectionMap && !Array.isArray(injectionMap)) {
            injectionMap = [injectionMap];
        }
        return injectionMap;
    }

    _getFactory():Factory {
        var factory = this._factory;

        if (!factory) {
            this._factory = factory = this.getOptions().get('func');
        }

        return factory;
    }

    _getDependencyList() {
        return this.getOptions().get('dependencies');
    }

    static _applyFactory(factory:Factory, factoryArgs:any[]):Service {
        var blankService = Object.create(factory.prototype);
        var factoryProduct = factory.apply(blankService, factoryArgs);
        var result;

        if (factoryProduct) {
            result = factoryProduct;
        } else {
            result = blankService;
        }

        return result;
    }
}

export = Component