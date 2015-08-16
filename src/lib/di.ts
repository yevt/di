/// <reference path="./references.d.ts" />
import {Context} from './Context';
import * as Q from 'q';
import {clone} from './utils';

export function create(options?:IContextOptions):IContext {
    var context = new Context(options);
    return context;
}

