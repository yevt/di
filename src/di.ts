/// <reference path="./references.d.ts" />
import Context = require('./Context');
import q = require('q');

export function createContext(options?:IContextOptions):q.Promise<Context> {
    var context = new Context(options);
    return q.resolve(context);
}