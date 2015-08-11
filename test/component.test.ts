/**
 * Created by y.evtushenko on 11.08.15.
 */

import {Component} from '../src/lib/Component';
import Q = require('q');

import chai = require('chai');
var expect = chai.expect;

describe('component', () => {
    it('All component parameters', (done) => {
        var component = new Component({
            id: 'fruit',
            func: function fruitFactory(type, size) {
                this._type = type;
                this._size = size;

                this.getType = () => {
                    return this._type;
                };

                this.getColor = () => {
                    return this._color;
                };

                this.getSize = () => {
                    return this._size;
                }
            },
            dependencies: ['type', 'color'],
            inject: {
                intoConstructor: ['type'],
                intoInstance: {
                    _color: 'color'
                }
            },
            args: [null, 'big'],
            singleton: true
        });

        Q.all([
            component.getService(['apple', 'red']),
            component.getService(['apple', 'red'])
        ]).spread((fruitService1, fruitService2) => {
            expect(fruitService1.getType()).to.equal('apple');
            expect(fruitService1.getColor()).to.equal('red');
            expect(fruitService1.getSize()).to.equal('big');
            expect(fruitService1).to.equal(fruitService2);
            done();
        }).done();
    });
});