/**
 * Created by y.evtushenko on 06.08.15.
 */
class Car {
    _engine: any;

    constructor(engine) {
        this._engine = engine;
    }

    start() {
        return this._engine.start();
    }
}

export = Car;