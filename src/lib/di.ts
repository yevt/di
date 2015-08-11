/// <reference path="./references.d.ts" />
import {Context} from './Context';
import * as Q from 'q';

export function createContext(options?:IContextOptions):Q.Promise<Context> {
    return Q.resolve(new Context(options));
}