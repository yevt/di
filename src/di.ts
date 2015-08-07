/// <reference path="./references.d.ts" />
import Context = require('./Context');
import q = require('q');

export function createContext(options?:ContextOptions):q.Promise<IContext> {
    var context = new Context(options);
    return q.resolve(context);
}