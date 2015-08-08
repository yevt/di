/**
 * Created by y.evtushenko on 08.08.15.
 */
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

export function inject(dependencyList:string[], services:Service[], injectionMap:Object) {
    return mapObject(injectionMap, (it) => {
        var dependencyIndex = dependencyList.indexOf(it);
        if (dependencyIndex != -1) {
            return services[dependencyIndex];
        }
    });
}