# di
Depencency injection module. Supports async factories.

# Quick start
```typescript
var di = require('di');

var Car = function(engine) {
    this._engine = engine; 
}

Car.prototype.go = function() {
    this._engine.start();
}

var Engine = function() {};

Engine.prototype.start = function() {
    console.log('engine started');
}

//Create context
var context = di.create({
    components: {
        engine: {func: Engine},
        car: {func: Car, dependencies: ['engine']}
    }
});

//Get service
context.get('car').then((car) => {
    car.go() // => engine started
}).done();
```
