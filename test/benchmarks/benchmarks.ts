import * as Benchmark from 'benchmark';
import { map, range } from 'lodash';

import { JsonClass, JsonMapper, JsonProperty, SerializeFn } from '../../lib';


@JsonClass(true)
class Address {
    @JsonProperty()
    line1 = 'line1';

    @JsonProperty()
    line2 = 'line2';

    serialize: SerializeFn;
}

const data = { line1: 'line1', line2: 'line2' };

const suite = new Benchmark.Suite('Single', { 'async': true });
// add tests
suite
    .add('deserialize with lib', function () {
        const deserialized = JsonMapper.deserialize(Address, data);
    })
    .add('deserialize manually', function () {
        const deserialized = { ...data };
    })
    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run();


const suite2 = new Benchmark.Suite('Array', { 'async': true });

const data2 = map(range(10000), i => ({
    line1: `${i}`,
    line2: `${i}`,
}));

// add tests
suite2
    .add('deserialize array', function () {
        const deserialized = JsonMapper.deserializeArray(Address, data2);
    })
    .add('deserialize single item with lib', function () {
        const deserialized = map(data2, v => JsonMapper.deserialize(Address, v));
    })
    .add('deserialize manually', function () {
        const deserialized = map(data2, v => ({ ...v }));
    })
    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    // run async
    .run();
