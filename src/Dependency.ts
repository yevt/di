/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="./DependencyConfig.ts" />

import Q = require('q');

class Dependency {
    _config:DependencyConfig;

    constructor(config) {
        this._config = config;
    }

    getService(dependantServices:any[]):Q.Promise<any> {
        var factory:any = this._config.func;
        var result:any;

        if (typeof factory == 'function') {
            result = factory(...dependantServices);
        }

        return Q.resolve(result);
    }

    getConfig():DependencyConfig {
        return this._config;
    }
}

export = Dependency