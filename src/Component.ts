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
        var constructorInjectionMap =
            utils.resolveArray(this.getOptions().get('inject.intoConstructor'));
        var instanceInjectionMap = this.getOptions().get('inject.intoInstance');
        var factoryArgs = _.assign([], dependantServices);
        var argsFromOptions = this.getOptions().get('args');
        var blankService;
        var factoryProduct;
        var constructorInjection;
        var instanceInjection;
        var result;

        blankService = Object.create(factory.prototype);

        if (instanceInjectionMap) {
            instanceInjection = utils.inject(dependencyList, dependantServices, instanceInjectionMap);
            _.assign(blankService, instanceInjection);
        }

        if (constructorInjectionMap) {
            constructorInjection = utils.inject(dependencyList, dependantServices, constructorInjectionMap);
            _.assign(factoryArgs, constructorInjection);
        }

        if (argsFromOptions) {
            _.assign(factoryArgs, argsFromOptions);
        }

        factoryProduct = factory.apply(blankService, factoryArgs);

        if (factoryProduct) {
            result = factoryProduct;
        } else {
            result = blankService;
        }

        return Q.resolve(result);
    }

    getOptions():IOptions {
        return this._options;
    }

    _getFactory():Factory {
        var factory = this._factory;
        var wrapper;

        if (!factory) {
            wrapper = this._getFactoryWrapper();
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