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
        debugger;

        var factory = this._options.get('func');
        var factoryArgs;
        var inject = this._options.get('inject');

        if (inject) {
            factoryArgs = this._parseServiceFactoryArguments(dependantServices, inject);
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

    _parseServiceFactoryArguments(dependencies:Service[], inject:IInjectionMap):any[] {
        var constructorInjectionMap = inject.intoConstructor;
        if (constructorInjectionMap) {
            return this._createConstructorInjection(dependencies, constructorInjectionMap);
        }
    }

    _createConstructorInjection(dependencies:Service[], injectionMap:any):any[] {
        return helpers.mapObject(injectionMap, (dependencyId:DependencyId) => {
            var getDependantService = () => {
                var dependencyList = this._options.get('dependencies');
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