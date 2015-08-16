/// <reference path="./references.d.ts" />
import {Context} from './Context';
import * as Q from 'q';
import {clone} from './utils';

function parseContextOptionsExternal(externalOptions?:IContextOptionsExternal):IContextOptions {
    var options = clone(externalOptions);

    if (options && options.components) {
        //format components
        if (typeof options.components == 'string') {
            options.components = [options.components];
        } else if (Array.isArray(options.components)) {
            //nothing to do
        } else if (typeof options.components == 'object') {
            options.components = Object.keys(options.components).map((componentId) => {
                var component = options.components[componentId];
                component.id = componentId;
                return component;
            });
        } else if (options.components == undefined) {
            //nothing to do
        } else {
            throw 'Unknown components format';
        }

        //format dependencies
        options.components = options.components.map((component) => {
            if (typeof component.dependencies == 'string') {
                component.dependencies = [component.dependencies];
            } else if (Array.isArray(component.dependencies)) {
                //nothing to do
            } else if (component.dependencies == undefined) {
                //nothing to do
            } else {
                throw 'Unknown dependencies format';
            }
            return component;
        });
    }

    return options;
}

export function create(options?:IContextOptionsExternal):IContext {
    var context = new Context(parseContextOptionsExternal(options));
    return context;
}

