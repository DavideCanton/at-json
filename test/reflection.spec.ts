import { defineMetadata, getMetadata } from '../lib/reflection';

describe('Reflection tests', () => {
    it('should set metadata correctly on class', () => {
        class C {}

        expect(getMetadata('foo', C)).toBeUndefined();
        expect(getMetadata('foo', C, 'bar')).toBeUndefined();

        defineMetadata('foo', 42, C);
        defineMetadata('foo', 68, C, 'bar');

        expect(getMetadata('foo', C)).toBe(42);
        expect(getMetadata('foo', C, 'bar')).toBe(68);

        class D extends C {}

        expect(getMetadata('foo', D)).toBe(42);
        expect(getMetadata('foo', D, 'bar')).toBe(68);

        defineMetadata('foo', 55, D);
        defineMetadata('foo', 99, D, 'bar');
        defineMetadata('baz', 123, D);
        defineMetadata('quux', 321, D, 'zzz');

        expect(getMetadata('foo', D)).toBe(55);
        expect(getMetadata('foo', D, 'bar')).toBe(99);
        expect(getMetadata('baz', D)).toBe(123);
        expect(getMetadata('quux', D, 'zzz')).toBe(321);

        expect(getMetadata('baz', C)).toBeUndefined();
        expect(getMetadata('quux', C, 'zzz')).toBeUndefined();

        const s = Symbol('new');
        defineMetadata(s, 0x123, C);
        expect(getMetadata(s, C)).toBe(0x123);
        expect(getMetadata(s, D)).toBe(0x123);
    });
});
