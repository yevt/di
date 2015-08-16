/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import {Component} from './Component';
import {Options} from './Options';
import * as Q from 'q';
import {clone} from './utils';

function parseContextOptions(options) {
    var options = clone(options);

    if (options == undefined) {
        //no actions
    } else if (typeof options == 'object') {
        if (typeof options.components == 'string') {
            options.components = [options.components];
        } else if (Array.isArray(options.components)) {
            //nothing to do
        } else if (typeof options.components == 'object') {
            options.components = Object.keys(options.components).map((componentId) => {
                var component = options.components[componentId];
                component.id = componentId;
                return component;
            });
        } else if (options.components == undefined) {
            //nothing to do
        } else {
            throw 'Unknown components format';
        }
    }

    return options;
}

export class Context implements IContext {

    _options:IOptions;
    _components: {[key: string]:IComponent};
    _validationCache: {[key: string]:IValidationResult};
    _visited: boolean[];

    constructor(opts?:IContextOptions) {
        var options = this._options = new Options(parseContextOptions(opts));
        var componentList = options.get('components');

        this._components = {};
        this._validationCache = {};

        if (componentList) {
            this._registerComponents(componentList);
        }
    }

    destroy() {
        var destroyPromises;
        var parentContext = this._getOptions().get('parentContext');

        destroyPromises = Object.keys(this._components).map((id) => {
            var component = this._components[id];

            try {
                return Q.resolve(component.destroy());
            } catch(ex) {
                return Q.reject(ex);
            }
        });

        if (parentContext) {
            destroyPromises.push(parentContext.destroy());
        }

        return Q.all(destroyPromises);
    }

    register(options:IComponentOptions, overwrite?:boolean) {
        var newComponent = new Component(options);
        var id = newComponent.getOptions().get('id');
        var oldComponent:IComponent = this._getOwnComponent(id);
        var error;

        if ((oldComponent == undefined) || overwrite) {
            delete this._validationCache[id];

            if (oldComponent != undefined) {
                oldComponent.destroy();
            }

            this._setComponent(id, newComponent);
        } else {
            error = new Error(`Duplicated component '${id}'`);
            error.name = 'DUPLICATED_COMPONENT_ID';
            throw error;
        }
    }

    /**
     * Create service with dependencies and return promise of the service.
     * @param id - Component id.
     * @returns {Promise<IService>}
     */
    get(id:IComponentId):Q.Promise<IService> {
        try {
            this._validateDependencies(id);
            return this._resolveDependency(id);
        } catch(ex) {
            return Q.reject(ex);
        }
    }

    _getComponent(id:IComponentId):IComponent {
        var component = this._components[id];
        var parentContext = this._getOptions().get('parentContext');

        if (!component && parentContext) {
            component = parentContext._getComponent(id);
        }

        return component;
    }

    _hasComponent(id:IComponentId):boolean {
        return this._getComponent(id) != null;
    }

    _getOwnComponent(id):IComponent {
        return this._components[id];
    }

    _getOptions():IOptions {
        return this._options;
    }

    _setComponent(id:IComponentId, component:IComponent) {
        this._components[id] = component;
    }

    _resolveDependencies(ids:IComponentId[]):Q.Promise<Component>[] {
        return ids.map((id) => {
            return this._resolveDependency(id);
        });
    }

    _resolveDependency(id):Q.Promise<IService> {
        var component = this._getComponent(id);
        var dependencyList:string[];
        var servicePromiseList:Q.Promise<Component>[];
        var result:Q.Promise<IService>;

        if (component) {
            dependencyList = component.getOptions().get('dependencies');
            if (dependencyList) {
                servicePromiseList = this._resolveDependencies(dependencyList);
                result = Q.all(servicePromiseList).then((args) => {
                    return component.getService(args);
                });
            } else {
                result = component.getService();
            }
        }

        return result;
    }

    _registerComponents(componentOptionsList:IComponentOptions[]) {
        componentOptionsList.forEach((componentOptions) => {
            this.register(componentOptions, false);
        });
    }

    _validateDependencies(targetId) {
        this._visited = [];
        return this._validate(targetId);
    }

    _validate(id) {
        var dependencies;
        var result:IValidationResult = this._validationCache[id];
        var error;

        if (this._visited[id]) {
            error = new Error(`Circular dependency: '${id}'`);
            error.name = 'CIRCULAR_DEPENDENCY';
            throw error;
        }

        this._visited[id] = true;

        if (result == undefined) {
            var component = this._getComponent(id);
            if (component) {
                dependencies = this._getComponent(id).getOptions().get('dependencies');
                if (dependencies) {
                    dependencies.forEach((id) => {
                        this._validate(id);
                    });
                } else {
                    result = {
                        status: true
                    };
                }
            } else {
                error = new Error(`Unknown dependency: ${id}`);
                error.name = 'UNRESOLVED_DEPENDENCY';
                throw error;
            }

            this._validationCache[id] = result;
        } else if (result.status == true) {
            return result;
        } else if (result.status == false) {
            throw result;
        } else {
            throw `Unknown validation result: ${JSON.stringify(result, null, 4)}`;
        }
    }
}