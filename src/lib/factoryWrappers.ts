/**
 * Created by y.evtushenko on 10.08.15.
 */
import {applyFactory} from "./utils";

export function singleton(factory) {
    var cachedService;
    return (...args) => {
        if (!cachedService) {
            cachedService = applyFactory(factory, args);
        }
        return cachedService;
    }
}