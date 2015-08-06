/// <reference path="../typings/tsd.d.ts" />
import Context = require('./Context');
import q = require('q');

export function createContext():q.Promise<Context> {
    return q.resolve(new Context);
}