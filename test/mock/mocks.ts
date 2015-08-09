    interface IEngine {
        start():void;
        stop():void;
        isWorking():boolean;
    }

    interface ICar {
        start():void;
        stop():void;
        isWorking():boolean;
    }

    export module injectIntoInstance {
        export class Engine implements IEngine{
            _isStarted:boolean;

            constructor() {
                this._isStarted = false;
            }

            start() {
                this._isStarted = true;
            }

            stop() {
                this._isStarted = false;
            }

            isWorking() {
                return this._isStarted;
            }
        }

        export class Car implements ICar {
            _engine: IEngine;

            constructor() {
                this.start();
            }

            start() {
                this._engine.start();
            }

            stop() {
                this._engine.stop();
            }

            isWorking() {
                return this._engine.isWorking();
            }
        }
    }

    export module extendContext {
        class Engine {
            _brand: string;

            constructor(brand) {
                this._brand = brand;
            }

            getBrand() {
                return this._brand;
            }
        }

        export class FiatEngine extends Engine {
            constructor() {
                super('fiat');
            }
        }

        export class RenoEngine extends Engine {
            constructor() {
                super('reno');
            }
        }

        export class Car {
            _engine: Engine;

            constructor(engine) {
                this._engine = engine;
            }

            getEngine() {
                return this._engine;
            }
        }
    }
