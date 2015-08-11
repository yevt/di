/**
 * Created by y.evtushenko on 11.08.15.
 */

import {Component} from '../src/lib/Component';

import chai = require('chai');
var expect = chai.expect;

describe('component', () => {
    it('All component parameters', (done) => {
        var component = new Component({
            id: 'fruit',
            func: function fruitFactory(type: string) {
                this._type = type;
                this.getType = () => {
                    return this._type;
                };

                this.getColor = () => {
                    return this._color;
                };
            },
            dependencies: ['type', 'color'],
            inject: {
                intoConstructor: ['type'],
                intoInstance: {
                    _color: 'color'
                }
            }
        });

        component.getService(['apple', 'red']).then((appleService) => {
            expect(appleService.getType()).to.equal('apple');
            expect(appleService.getColor()).to.equal('red');
            done();
        }).done();
    });
});