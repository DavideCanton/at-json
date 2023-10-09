import { JsonClass, JsonComplexProperty, JsonMapper, JsonProperty } from '../../lib';

describe('JsonComplexProperty', () => {
    it('should deserialize', () => {
        const obj = {
            inner: {
                name: 'foo',
                age: 42,
                inner: {
                    line: 'bar',
                },
            },
            other: {
                name: 'baz',
                age: 56,
                inner: {
                    line: 'quux',
                },
            },
        };

        const des = new JsonMapper().deserialize(Outer, obj);

        expect(des).toBeInstanceOf(Outer);
        expect(des.inner).toBeInstanceOf(Inner);
        expect(des.inner.name).toBe('foo');
        expect(des.inner.age).toBe(42);
        expect(des.inner.moarInner).toBeInstanceOf(MoarInner);
        expect(des.inner.moarInner.line).toBe('bar');

        expect(des.otherInner).toBeInstanceOf(Inner);
        expect(des.otherInner.name).toBe('baz');
        expect(des.otherInner.age).toBe(56);
        expect(des.otherInner.moarInner).toBeInstanceOf(MoarInner);
        expect(des.otherInner.moarInner.line).toBe('quux');
    });

    it('should serialize', () => {
        const obj = new Outer();
        const in1 = new Inner();
        in1.name = 'foo';
        in1.age = 42;
        const mi1 = new MoarInner();
        mi1.line = 'bar';
        in1.moarInner = mi1;
        obj.inner = in1;

        const in2 = new Inner();
        in2.name = 'baz';
        in2.age = 56;
        const mi2 = new MoarInner();
        mi2.line = 'quux';
        in2.moarInner = mi2;
        obj.otherInner = in2;

        const ser = new JsonMapper().serialize(obj);
        expect(ser).toStrictEqual({
            inner: {
                name: 'foo',
                age: 42,
                inner: {
                    line: 'bar',
                },
            },
            other: {
                name: 'baz',
                age: 56,
                inner: {
                    line: 'quux',
                },
            },
        });
    });
});

@JsonClass()
class MoarInner {
    @JsonProperty()
    line: string;
}

@JsonClass()
class Inner {
    @JsonProperty()
    name: string;
    @JsonProperty()
    age: number;
    @JsonComplexProperty(MoarInner, { name: 'inner' })
    moarInner: MoarInner;
}

@JsonClass()
class Outer {
    @JsonComplexProperty(Inner)
    inner: Inner;
    @JsonComplexProperty(Inner, 'other')
    otherInner: Inner;
}
