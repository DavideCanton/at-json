import * as common from '../../lib/decorators/common';
import each from 'jest-each';
import { JsonArray, JsonClass, JsonMapper, mappingMetadataKey } from '../../lib';
import { getMetadata } from '../../lib/reflection';

const f1 = (v: number) => v.toString();
const f2 = (v: string) => parseInt(v, 10);

describe('JsonArray', () => {
    each([
        ['basic params', undefined, [1, 2, 3], [1, 2, 3]],
        ['custom name', { name: 'bar' }, [1, 2, 3], [1, 2, 3]],
        ['custom all', { name: 'bar', serialize: f1, deserialize: f2 }, [1, 2, 3], ['1', '2', '3']],
    ]).it('should work [%s]', (_name, args, from, to) => {
        const spy = jest.spyOn(common, 'mapArray');

        @JsonClass()
        class C {
            @JsonArray(args)
            foo: number[];
        }

        const metadata = getMetadata(mappingMetadataKey, C, 'foo');
        expect(metadata.name).toEqual(args?.name);

        const res = metadata.serialize(from);
        expect(spy).toHaveBeenCalledWith(from, args?.serialize, undefined);
        expect(res).toEqual(to);

        const res2 = metadata.deserialize(to);
        expect(spy).toHaveBeenCalledWith(to, args?.deserialize, undefined);
        expect(res2).toEqual(from);
    });

    each([
        ['only serialize', { serialize: f1 }],
        ['only deserialize', { deserialize: f2 }],
    ]).it('should error if serialize and deserialize are not both specified [%s]', (_name, args) => {
        expect(() => {
            @JsonClass()
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            class C {
                @JsonArray(args)
                foo: number[];
            }
        }).toThrowError('serialize and deserialize must be defined together');
    });

    each([true, false]).it('should handle throwIfNotArray correctly [%s]', throwIfNotArray => {
        @JsonClass()
        class C {
            @JsonArray(undefined, throwIfNotArray)
            foo: number[];
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
