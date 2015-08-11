/**
 * Created by y.evtushenko on 06.08.15.
 */
export class Engine {
    _brand: string;
    _isStarted: boolean;

    constructor(brand?) {
        this._brand = brand || 'Default';
        this._isStarted = false;
    }

    start() {
        this._isStarted = true;
        return true;
    }
}