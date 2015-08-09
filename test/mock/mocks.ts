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

    export class Car implements ICar {
        _engine: IEngine;

        constructor(engine) {
            this._engine = engine;
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
