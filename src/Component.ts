/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import Q = require('q');
import helpers = require('./helpers');

class Component implements IComponent {
    _options:IComponentOptions;

    constructor(options:IComponentOptions) {
        this._options = options;
    }

    getService(dependantServices?:Service[]):Q.Promise<Service> {
        var factory = this._options.func;
        var factoryArgs = this._parseServiceFactoryArguments(dependantServices, this._options.inject);

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

    getOptions():IComponentOptions {
        return this._options;
    }

    _parseServiceFactoryArguments(dependencies:Service[], injectionMap:IInjectionMap = {}):any[] {
        var constructorInjectionMap = injectionMap.intoConstructor;
        var result;

        if (constructorInjectionMap) {
            result = this._createConstructorInjection(dependencies, constructorInjectionMap);
        } else {
            result = dependencies;
        }

        return result;
    }

    _createConstructorInjection(dependencies:Service[], injectionMap:any):any[] {
        return helpers.mapObject(injectionMap, (dependencyId:DependencyId) => {
            var getDependantService = () => {
                var dependencyList = this.getOptions().dependencies;
                var dependencyIndex = dependencyList.indexOf(dependencyId);
                var service;

                if (dependencyIndex != -1) {
                    service = dependencies[dependencyIndex];
                }

                return service;
            };

            var service = getDependantService();

            if (service) {
                return service;
            }
        });
    }
}

export = Component