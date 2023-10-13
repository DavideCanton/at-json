import { JsonArrayOfComplexProperty, JsonClass, JsonMapper, JsonProperty } from '../../lib';
describe('JsonArrayOfComplexProperty', () => {
    it('should deserialize arrays correctly', () => {
        const obj = {
            foo: [_o('a', '10'), _o('b', '20')],
            x: [_o('c', '30'), _o('d', '40')],
            bat: [_o('e', '42'), _o('f', '60')],
        };

        const d = new JsonMapper().deserialize(C, obj);

        expect(d.foo).toStrictEqual([new D('a', 10), new D('b', 20)]);
        expect(d.bar).toStrictEqual([new D('c', 30), new D('d', 40)]);
        expect(d.baz).toStrictEqual([new D('e', 42), new D('f', 60)]);
    });

    it('should serialize arrays correctly', () => {
        const obj = new C();
        obj.foo = [new D('a', 10), new D('b', 20)];
        obj.bar = [new D('c', 30), new D('d', 40)];
        obj.baz = [new D('e', 42), new D('f', 60)];

        const s = new JsonMapper().serialize(obj);
        expect(s).toStrictEqual({
            foo: [_o('a', '10'), _o('b', '20')],
            x: [_o('c', '30'), _o('d', '40')],
            bat: [_o('e', '42'), _o('f', '60')],
        });
    });
});

@JsonClass()
class D {
    @JsonProperty()
    n: string;

    @JsonProperty({
        name: 'x',
        serialize: (_m, v) => v.toString(),
        deserialize: (_m, v) => parseInt(v, 10),
    })
    a: number;

    constructor(n: string, a: number) {
        this.n = n;
        this.a = a;
    }
}

@JsonClass()
class C {
    @JsonArrayOfComplexProperty(D)
    foo: D[];

    @JsonArrayOfComplexProperty(D, 'x')
    bar: D[];

    @JsonArrayOfComplexProperty(D, { name: 'bat' })
    baz: D[];
}

function _o(n: string, x: string): object {
    return { n, x };
}
