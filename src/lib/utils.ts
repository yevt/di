/**
 * Created by y.evtushenko on 08.08.15.
 */
/// <reference path="./references.d.ts" />
export function mapObject(param:string|any[]|any, callback:Function) {
    var result;

    if (Array.isArray(param)) {
        result = param.map((it) => {
            return mapObject(it, callback);
        });
    } else if (typeof param == 'object') {
        result = {};
        for (var key in param) {
            if (param.hasOwnProperty(key)) {
                var subItem = param[key];
                result[key] = mapObject(subItem, callback);
            }
        }
    } else if (typeof param == 'string') {
        result = callback(param);
    }

    return result;
}

export function wrapIntoArray(object:any) {
    if (object && !Array.isArray(object)) {
        object = [object];
    }
    return object;
}

export function inject(dependencyList:string[], services:any[], injectionMap:{[key: string]: any}) {
    return mapObject(injectionMap, (it) => {
        var dependencyIndex = dependencyList.indexOf(it);
        if (dependencyIndex != -1) {
            return services[dependencyIndex];
        }
    });
}

export function assign(target, source) {
    target = target || {};
    for (var prop in source) {
        if (source.hasOwnProperty(prop) && source[prop] != null) {
            if (target.hasOwnProperty(prop)) {
                target[prop] = assign(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
    }
    return target;
}

export function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}