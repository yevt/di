/**
 * Created by y.evtushenko on 08.08.15.
 */
/// <reference path="./references.d.ts" />

class Options implements IOptions {
    _opts: any;

    constructor(opts) {
        this._opts = opts;
    }

    get(path) {
        return this._opts[path];
    }
}

export = Options