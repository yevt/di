/**
 * Created by y.evtushenko on 08.08.15.
 */
/// <reference path="./references.d.ts" />

export class Options implements IOptions {
    _opts: {[key:string]: any};

    constructor(opts) {
        this._opts = Object(opts);
    }

    destroy() {
        this._opts = null;
    }

    get(path:string):any {
        var steps = path.split('.');
        var object = this._opts;
        var totalSteps = steps.length;
        var stepCount;
        var step:string;

        for (stepCount = 0; stepCount < totalSteps; stepCount++) {
            step = steps[stepCount];
            if (typeof object == 'object') {
                object = object[step];
            } else {
                return;
            }
        }

        return object;
    }
}