/**
 * Created by y.evtushenko on 06.08.15.
 */
class Engine {
    _brand: string;
    _isStarted: boolean;

    constructor(brand?) {
        this._brand = brand;
        this._isStarted = false;
    }

    start() {
        this._isStarted = true;
        return true;
    }

    stop() {
        this._isStarted = false;
    }
}

export = Engine;
