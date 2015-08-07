/**
 * Created by y.evtushenko on 06.08.15.
 */
/// <reference path="./references.d.ts" />
import Q = require('q');

class Component implements IComponent {
    _options:ComponentOptions;

    constructor(options:ComponentOptions) {
        this._options = options;
    }

    getService(dependantServices) {
        var factory = this._options.func;
        var result;

        if (dependantServices == null) {
            result = Q.resolve(factory());
        } else {
            result = Q.resolve(factory(...dependantServices));
        }
        return result;
    }

    getOptions() {
        return this._options;
    }
}

export = Component