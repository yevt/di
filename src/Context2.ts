/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./interfaces/DependencyConfig.ts" />

import Dependency = require('./Dependency');
import Q = require('q');

class Context {

    _dependencies: {};

    constructor() {
        this._dependencies = {};
    }

    dispose() {

    }

    register(config:DependencyConfig):void {
        this.setDependency(config.id, new Dependency(config));
    }

    /**
     * Promise of dependency object
     * @param id
     * @returns {Q.Promise<Dependency>[]}
     */
    get(id:string):Q.Promise<any> {
        debugger;
        return this.resolveDependencies([id])[0].then((service) => {
            return service;
        });
    }

    getDependency(id:string):Dependency {
        return this._dependencies[id];
    }

    setDependency(id:string, dependency:Dependency) {
        this._dependencies[id] = dependency;
    }

    hasDependency(id:string):boolean {
        return this.getDependency(id) != null;
    }

    resolveDependencies(ids:string[]):Q.Promise<Dependency>[] {
        return ids.map((id) => {
            return this.resolveDependency(id);
        });
    }

    resolveDependency(id):Q.Promise<any> {
        var result;
        var target = this.getDependency(id);
        var dependenciesConfig = target.getConfig().dependencies;
        var dependenciesPromises:Q.Promise<Dependency>[];

        if (dependenciesConfig) {
            dependenciesPromises = this.resolveDependencies(dependenciesConfig);
            result = Q.all(dependenciesPromises).then((args) => {
                return target.getService(args);
            });
        } else {
            result = target.getService([]);
        }

        return Q.resolve(result);
    }
}

export = Context
