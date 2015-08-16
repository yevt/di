/// <reference path="../typings/tsd.d.ts" />

import * as di from '../src/lib/di';

import chai = require('chai');
import {Engine} from './mock/Engine';
import {Car} from './mock/Car';

var expect = chai.expect;

describe('di', () => {
    it('Create empty context', () => {
        var context = di.create();
        expect(context).to.be.ok;
    });

    it('Create context with components', () => {
        var context = di.create({
            components: [
                {id: 'engine', func: Engine},
                {id: 'car', func: Car, dependencies: ['engine']}
            ]
        });
        expect(context).to.be.ok;
    });

    it('Create context with options', (done) => {
        var context = di.create({
            components: [
                {id: 'engine', func: Engine},
                {id: 'car', func: Car, dependencies: ['engine']}
            ]
        });

        context.get('car').then((car) => {
            car.start();
            expect(car).to.be.an.instanceOf(Car);
            done();
        });
    });

    it('Components as object', (done) => {
        var context = di.create({
            components: {
                engine: {func: Engine},
                car: {func: Car, dependencies: ['engine']}
            }
        });

        context.get('car').then((car) => {
            expect(car).to.be.instanceOf(Car);
            done();
        }).done();
    });

    it('Wrap dependencies into array. Component with 1 dependency', (done) => {
        var context = di.create({
            components: {
                engine: {func: Engine},
                car: {func: Car, dependencies: 'engine'}
            }
        });

        context.get('car').then((car) => {
            expect(car).to.be.instanceOf(Car);
            done();
        }).done();
    });
});