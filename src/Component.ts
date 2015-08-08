/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import Q = require('q');
import Options = require('./Options');
import utils = require('./utils');
import _ = require('lodash');

class Component implements IComponent {
    _options:IOptions;
    _factory:Factory;

    constructor(opts:IComponentOptions) {
        this._options = new Options(opts);
    }

    getService(dependantServices?:Service[]):Q.Promise<Service> {
        var factory = this._getFactory();
        var dependencyList = this.getOptions().get('dependencies');
        var constructorInjectionMap = this._getConstructorInjectionMap();
        var factoryArgs = _.assign([], dependantServices);
        var argsFromOptions = this.getOptions().get('args');
        var injection;

        if (constructorInjectionMap) {
            injection = utils.inject(dependencyList, dependantServices, constructorInjectionMap);
            _.assign(factoryArgs, injection);
        }

        if (argsFromOptions) {
            _.assign(factoryArgs, argsFromOptions);
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
        var wrapper = this._getFactoryWrapper();

        if (!factory) {
            factory = this.getOptions().get('func');
            factory = wrapper(factory);
            this._factory = factory;
        }

        return factory;
    }

    _getFactoryWrapper() {
        var wrapper = this.getOptions().get('factoryWrapper');
        var defaultWrapper = (factory) => {return factory};

        if (!wrapper) {
            wrapper = defaultWrapper;
        } else if (wrapper == 'singleton') {
            wrapper = utils.factoryWrappers.singleton;
        }

        return wrapper;
    }
}

export = Component