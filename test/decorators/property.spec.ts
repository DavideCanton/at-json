import each from 'jest-each';
import { JsonClass, JsonProperty, mappingMetadataKey } from '../../lib';
import { _IDENTITY_FUNCTION } from '../../lib/decorators/property';

const f1 = (v: number) => v.toString();
const f2 = (v: string) => parseInt(v, 10);
const _id = _IDENTITY_FUNCTION;

describe('JsonProperty', () => {
    each([
        ['basic params', undefined, { serialize: _id, deserialize: _id }],
        ['custom name', { name: 'bar' }, { name: 'bar', serialize: _id, deserialize: _id }],
        ['custom serialize', { serialize: f1 }, { serialize: f1, deserialize: _id }],
        ['custom deserialize', { deserialize: f2 }, { deserialize: f2, serialize: _id }],
        [
            'custom all',
            { name: 'bar', serialize: f1, deserialize: f2 },
            { name: 'bar', serialize: f1, deserialize: f2 },
        ],
    ]).it('should work [%s]', (_name, args, expected) => {
        @JsonClass()
        class C {
            @JsonProperty(args)
            foo: string;
        }

        const metadata = Reflect.getMetadata(mappingMetadataKey, C, 'foo');
        expect(metadata).toEqual(expected);
    });
});
