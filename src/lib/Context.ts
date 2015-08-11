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

    constructor(opts?:IContextOptions) {
        var options = this._options = new Options(opts);
        var componentList = options.get('components');

        this._components = {};

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
    get(id:ComponentId):Q.Promise<IService> {
        return this._resolveDependency(id);
    }

    getOptions():IOptions {
        return this._options;
    }

    hasComponent(id:ComponentId):boolean {
        return this.getComponent(id) != null;
    }

    getComponent(id:ComponentId):IComponent {
        var component = this._components[id];
        var parentContext = this.getOptions().get('parentContext');

        if (!component && parentContext) {
            component = parentContext.getComponent(id);
        }

        return component;
    }

    _setComponent(id:ComponentId, component:IComponent) {
        this._components[id] = component;
    }

    _resolveDependencies(ids:ComponentId[]):Q.Promise<Component>[] {
        return ids.map((id) => {
            return this._resolveDependency(id);
        });
    }

    _resolveDependency(id):Q.Promise<IService> {
        var component = this.getComponent(id);
        var dependencyList:string[];
        var servicePromiseList:Q.Promise<Component>[];
        var result:Q.Promise<IService>;
        var error:Error;

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
        } else {
            error = new Error(`Unresolved dependency: \`${id}\``);
            error.name = "UNKNOWN_DEPENDENCY";
            result = Q.reject(error);
        }

        return result;
    }

    _registerComponents(componentOptionsList:IComponentOptions[]) {
        componentOptionsList.forEach((componentOptions) => {
            this.registerComponent(componentOptions);
        });
    }
}