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
        ]).spread((appleService1, appleService2) => {
            expect(appleService1.getType()).to.equal('apple');
            expect(appleService1.getColor()).to.equal('red');
            expect(appleService1.getSize()).to.equal('big');
            expect(appleService1).to.equal(appleService2);
            done();
        }).done();
    });
});