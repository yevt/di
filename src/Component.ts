/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import Q = require('q');
import Options = require('./Options');
import helpers = require('./helpers');

class Component implements IComponent {
    _options:IOptions;

    constructor(opts:IComponentOptions) {
        this._options = new Options(opts);
    }

    getService(dependantServices?:Service[]):Q.Promise<Service> {
        var options = this.getOptions();
        var factory = options.get('func');
        var dependencyList = options.get('dependencies');
        var constructorInjectionMap = options.get('inject.intoConstructor');
        var factoryArgs;

        if (constructorInjectionMap) {
            factoryArgs = helpers.inject(dependencyList, dependantServices, constructorInjectionMap);
        } else {
            factoryArgs = dependantServices;
        }

        var blankService = Object.create(factory.prototype);
        var factoryProduct = factory.apply(blankService, factoryArgs);
        var result;

        if (factoryProduct) {
            result = Q.resolve(factoryProduct);
        } else {
            result = Q.resolve(blankService);
        }

        return result;
    }

    getOptions():IOptions {
        return this._options;
    }
}

export = Component