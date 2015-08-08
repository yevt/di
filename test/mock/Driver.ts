/**
 * Created by y.evtushenko on 08.08.15.
 */
class Driver {
    car: any;

    constructor(opts) {
        this.car = opts.car;
    }

    drive() {
        this.car.start();
    }
}

export = Driver