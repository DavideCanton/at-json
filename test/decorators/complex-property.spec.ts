import each from 'jest-each';
import { JsonClass, JsonComplexProperty, JsonMapper, JsonProperty, mappingMetadataKey } from '../../lib';

@JsonClass()
class X {
    @JsonProperty()
    s: string;
}

describe('JsonComplexProperty', () => {
    each([
        ['basic params', undefined],
        ['custom name', { name: 'bar' }],
    ]).it('should work [%s]', (_name, args) => {
        const spyD = jest.spyOn(JsonMapper, 'deserialize');
        const spyS = jest.spyOn(JsonMapper, 'serialize');

        @JsonClass()
        class C {
            @JsonComplexProperty(X, args)
            foo: X;
        }

        const metadata = Reflect.getMetadata(mappingMetadataKey, C, 'foo');
        expect(metadata.name).toEqual(args?.name);

        const x = new X();
        x.s = 'baz';
        const res = metadata.serialize(x);
        expect(spyS).toHaveBeenCalledWith(x);
        expect(res).toBeInstanceOf(Object);
        expect(res.s).toBe('baz');

        const v = { s: 'baz' };
        const res2 = metadata.deserialize(v);
        expect(spyD).toHaveBeenCalledWith(X, v);
        expect(res2).toBeInstanceOf(X);
        expect(res2.s).toBe('baz');
    });
});
