import { JsonArray, JsonClass, JsonMapper } from '../../lib';

describe('JsonArray', () => {
    it('should deserialize arrays correctly', () => {
        const obj = {
            foo: [1, 2, 3],
            x: ['a', 'b'],
            bat: ['-42', '-50'],
        };

        const d = new JsonMapper().deserialize(C, obj);

        expect(d.foo).toStrictEqual([1, 2, 3]);
        expect(d.bar).toStrictEqual(['a', 'b']);
        expect(d.baz).toStrictEqual([42, 50]);
    });

    it('should serialize arrays correctly', () => {
        const obj = new C();
        obj.foo = [1, 2, 3];
        obj.bar = ['a', 'b'];
        obj.baz = [42, 50];

        const s = new JsonMapper().serialize(obj);
        expect(s).toStrictEqual({
            foo: [1, 2, 3],
            x: ['a', 'b'],
            bat: ['-42', '-50'],
        });
    });
});

@JsonClass()
class C {
    @JsonArray()
    foo: number[];

    @JsonArray('x')
    bar: string[];

    @JsonArray({ name: 'bat', serialize: (_m, v) => (-v).toString(), deserialize: (_m, v) => -parseInt(v, 10) })
    baz: number[];
}
