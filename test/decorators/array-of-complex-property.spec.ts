import each from 'jest-each';
import { JsonArrayOfComplexProperty, JsonClass, JsonMapper, JsonProperty, mappingMetadataKey } from '../../lib';

@JsonClass()
class X {
    @JsonProperty()
    s: string;
}

describe('JsonArrayOfComplexProperty', () => {
    each([
        ['basic params', undefined],
        ['custom name', { name: 'bar' }],
    ]).it('should work [%s]', (_name, args) => {
        @JsonClass()
        class C {
            @JsonArrayOfComplexProperty(X, args)
            foo: X[];
        }

        const metadata = Reflect.getMetadata(mappingMetadataKey, C, 'foo');
        expect(metadata.name).toEqual(args?.name);

        // TODO add more tests
    });

    each([true, false]).it('should handle throwIfNotArray correctly [%s]', throwIfNotArray => {
        @JsonClass()
        class C {
            @JsonArrayOfComplexProperty(X, undefined, throwIfNotArray)
            foo: X[];
        }

        if (throwIfNotArray) {
            expect(() => JsonMapper.deserialize(C, { foo: 'bar' })).toThrowError('Expected array, got string');
        } else {
            const c = JsonMapper.deserialize(C, { foo: 'bar' });
            expect(c.foo).toBeNull();
        }

        const c2 = JsonMapper.deserialize(C, {});
        expect(c2.foo).toBeUndefined();
    });
});
