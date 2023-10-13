import { JsonClass, JsonMapper, makeCustomDecorator } from '../../lib';

describe('Common tests', () => {
    const dec = makeCustomDecorator<string, number>(() => ({
        serialize: (_mapper, val) => val.toString(),
        deserialize: (_mapper, val) => parseInt(val, 10),
    }));

    @JsonClass()
    class C {
        @dec()
        x: number;
        @dec({ name: 'foo' })
        y: number;
    }

    it('makeCustomDecorator should serialize', () => {
        const c = new C();
        c.x = 10;
        c.y = 20;

        const ser = new JsonMapper().serialize(c);
        expect(ser).toStrictEqual({
            x: '10',
            foo: '20',
        });
    });

    it('makeCustomDecorator should deserialize', () => {
        const obj = {
            x: '10',
            foo: '20',
        };

        const des = new JsonMapper().deserialize(C, obj);
        expect(des.x).toBe(10);
        expect(des.y).toBe(20);
    });
});
