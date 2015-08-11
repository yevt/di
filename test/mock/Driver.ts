/**
 * Created by y.evtushenko on 08.08.15.
 */
export class Driver {
    car: any;
    name: string;

    constructor(opts) {
        this.car = opts.car;
        this.name = opts.name;
    }

    drive() {
        this.car.start();
    }
}