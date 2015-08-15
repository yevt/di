/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import {Component} from './Component';
import {Options} from './Options';
import * as Q from 'q';

export class Context implements IContext {

    _options:IOptions;
    _components: {[key: string]:IComponent};
    _validationCache: {[key: string]:IValidationResult};

    constructor(opts?:IContextOptions) {
        var options = this._options = new Options(opts);
        var componentList = options.get('components');

        this._components = {};
        this._validationCache = {};

        if (componentList) {
            this._registerComponents(componentList);
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
     * @returns {Promise<IService>}
     */
    get(id:IComponentId):Q.Promise<IService> {
        return Q.fcall(() => {
            this._validateDependencies(id);
            return this._resolveDependency(id);
        });
    }

    getComponent(id:IComponentId):IComponent {
        var component = this._components[id];
        var parentContext = this._getOptions().get('parentContext');

        if (!component && parentContext) {
            component = parentContext.getComponent(id);
        }

        return component;
    }

    hasComponent(id:IComponentId):boolean {
        return this.getComponent(id) != null;
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
        var component = this.getComponent(id);
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
            this.registerComponent(componentOptions);
        });
    }

    _validateDependencies(targetId) {
        var visited = [];

        var validate = (id) => {
            var dependencies;
            var result:IValidationResult = this._validationCache[id];
            var error;

            if (visited[id]) {
                error = new Error(`Circular dependency: '${id}'`);
                error.name = 'CIRCULAR_DEPENDENCY';
                throw error;
            }

            visited[id] = true;

            if (result == undefined) {
                var component = this.getComponent(id);
                if (component) {
                    dependencies = this.getComponent(id).getOptions().get('dependencies');
                    if (dependencies) {
                        dependencies.forEach(validate);
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
                throw `Unknown validation result: ${JSON.stringify(result, null, 2)}}`;
            }
        };

        return validate(targetId);
    }
}