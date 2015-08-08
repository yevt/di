/**
 * Created by y.evtushenko on 06.08.15.
 */
class Engine {
    _brand: string;

    constructor(brand?) {
        this._brand = brand;
    }

    start() {
        return true;
    }
}

export = Engine;
