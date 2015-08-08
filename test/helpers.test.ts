/**
 * Created by y.evtushenko on 08.08.15.
 */
/// <reference path="../src/references.d.ts" />

import helpers = require('../src/helpers');

import q = require('q');
import chai = require('chai');
var expect = chai.expect;

describe('helpers', () => {
    describe('mapObject', () => {
        it('String parameter', () => {
            var str = 'a';

            var result = helpers.mapObject(str, (it) => {
                return it.toUpperCase();
            });

            expect(result).to.equal('A');
        });

        it('Array parameter', () => {
            var arr = ['a', 'b'];

            var result = helpers.mapObject(arr, (it) => {
                return it.toUpperCase();
            });

            expect(result).to.deep.equal(['A', 'B']);
        });

        it('Object parameter', () => {
            var obj = {a: 'a'};

            var result = helpers.mapObject(obj, (it) => {
                return it.toUpperCase();
            });

            expect(result).to.deep.equal({a: 'A'});
        });

        it('Mixed parameter', () => {
            var obj = [{a: 'a'}, ['b'], 'c'];

            var result = helpers.mapObject(obj, (it) => {
                return it.toUpperCase();
            });

            expect(result).to.deep.equal([{a: 'A'}, ['B'], 'C']);
        });
    });
});
