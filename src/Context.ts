/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import Component = require('./Component');
import Q = require('q');

class Context implements IContext {

    _options:ContextOptions;
    components: {};

    constructor(opts?:ContextOptions) {
        this._options = opts;
        this.components = {};


    }

    destroy() {

    }

    register(options:ComponentOptions) {
        this._setComponent(options.id, new Component(options));
    }

    /**
     * Promise of dependency object
     * @param id
     * @returns {Q.Promise<Component>[]}
     */
    get(id:string):Q.Promise<any> {
        return this._resolveDependency(id).then((service) => {
            return service;
        });
    }

    hasDependency(id:string):boolean {
        return this._getComponent(id) != null;
    }

    _getComponent(id:string):Component {
        return this.components[id];
    }

    _setComponent(id:string, component:IComponent) {
        this.components[id] = component;
    }

    _resolveDependencies(ids:string[]):Q.Promise<Component>[] {
        return ids.map((id) => {
            return this._resolveDependency(id);
        });
    }

    _resolveDependency(id):Q.Promise<any> {
        var result;
        var targetComponent = this._getComponent(id);

        if (targetComponent != null) {
            var dependencyList = targetComponent.getOptions().dependencies;
            var dependenciesPromises:Q.Promise<Component>[];

            if (dependencyList) {
                dependenciesPromises = this._resolveDependencies(dependencyList);
                result = Q.all(dependenciesPromises).then((args) => {
                    return targetComponent.getService(args);
                });
            } else {
                result = targetComponent.getService([]);
            }
        } else {
            var error:Error = new Error("Unresolved dependency");
            error.name = 'UNRESOLVED_DEPENDENCY';
            result = Q.reject(error);
        }

        return result;
    }
}

export = Context;