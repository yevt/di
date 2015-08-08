/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import Component = require('./Component');
import Q = require('q');

class Context implements IContext {

    _options:IContextOptions;
    _components: {[key: string]: IComponent};

    constructor(options?:IContextOptions) {
        this._options = options;
        this._components = {};

        if (options) {
            this._parseComponents(options.components);
        }
    }

    destroy() {

    }

    registerComponent(options:IComponentOptions) {
        this._setComponent(options.id, new Component(options));
    }

    /**
     * Create service with dependencies and return promise of the service.
     * @param id - Component id.
     * @returns {Promise<Service>}
     */
    get(id:ComponentId):Q.Promise<Service> {
        return this._resolveDependency(id);
    }

    hasComponent(id:ComponentId):boolean {
        return this._getComponent(id) != null;
    }

    _getComponent(id:ComponentId):IComponent {
        return this._components[id];
    }

    _setComponent(id:ComponentId, component:IComponent) {
        this._components[id] = component;
    }

    _resolveDependencies(ids:ComponentId[]):Q.Promise<Component>[] {
        return ids.map((id) => {
            return this._resolveDependency(id);
        });
    }

    _resolveDependency(id):Q.Promise<Service> {
        var result;
        var targetComponent = this._getComponent(id);

        if (targetComponent) {
            var dependencyList = targetComponent.getOptions().dependencies;
            var dependenciesPromises:Q.Promise<Component>[];

            if (dependencyList) {
                dependenciesPromises = this._resolveDependencies(dependencyList);
                result = Q.all(dependenciesPromises).then((args) => {
                    return targetComponent.getService(args);
                });
            } else {
                result = targetComponent.getService();
            }
        } else {
            var error:Error = new Error("Unresolved dependency");
            error.name = 'UNRESOLVED_DEPENDENCY';
            result = Q.reject(error);
        }

        return result;
    }

    _parseComponents(componentOptionsList:IComponentOptions[]) {
        componentOptionsList.forEach((componentOptions) => {
            this.registerComponent(componentOptions);
        });
    }
}

export = Context