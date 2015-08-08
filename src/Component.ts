/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import Q = require('q');
import Options = require('./Options');
import utils = require('./utils');

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
            factoryArgs = utils.inject(dependencyList, dependantServices, constructorInjectionMap);
        } else {
            factoryArgs = dependantServices;
        }

        return Q.resolve(utils.applyFactory(factory, factoryArgs));
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
        var defaultWrapper = (factory) => {return factory};
        var wrapper = this.getOptions().get('factoryWrapper');

        if (!wrapper) {
            wrapper = defaultWrapper;
        } else if (wrapper == 'singleton') {
            wrapper = utils.factoryWrappers.singleton;
        }

        if (!factory) {
            factory = this.getOptions().get('func');
            factory = wrapper(factory);
            this._factory = factory;
        }

        return factory;
    }

    _getDependencyList() {
        return this.getOptions().get('dependencies');
    }
}

export = Component