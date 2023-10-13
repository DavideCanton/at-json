import 'jest-extended';

import { JsonClass, JsonProperty, JsonComplexProperty, JsonArray, JsonArrayOfComplexProperty } from '../lib/decorators';
import { CustomSerialize, AfterDeserialize } from '../lib/interfaces';
import { JsonMapper } from '../lib/mapper';
import each from 'jest-each';

describe('JsonMapper', () => {
    each([null, undefined]).it('should handle %s value when serializing', val => {
        expect(new JsonMapper().serialize(val)).toStrictEqual(val);
    });

    each(['default', 'custom']).it('should deserialize strings with parser [%s]', parser => {
        const mapper = new JsonMapper();
        const obj = JSON.stringify({
            line1: 'foo',
            line2: 'bar',
        });

        let addr: Address;
        if (parser === 'default') {
            addr = mapper.deserialize(Address, obj);
        } else {
            const parserFn = jest.spyOn(JSON, 'parse') as any;
            addr = mapper.deserialize(Address, obj, parserFn);
            expect(parserFn).toHaveBeenCalledWith(obj);
        }
        expect(addr).toBeInstanceOf(Address);
        expect(addr.line1).toBe('foo');
        expect(addr.line2).toBe('bar');
    });

    it('should deserialize value', () => {
        @JsonClass()
        class C {
            @JsonProperty()
            name: string;
            @JsonProperty('years')
            age: number;
        }

        const des = new JsonMapper().deserialize(C, { name: 'foo', years: 42 });
        expect(des).toBeInstanceOf(C);
        expect(des.name).toBe('foo');
        expect(des.age).toBe(42);
    });

    it('should deserialize arrays', () => {
        @JsonClass()
        class C {
            @JsonProperty()
            name: string;
            @JsonProperty()
            age: number;
        }

        const array = new JsonMapper().deserializeArray(C, [
            { name: 'foo', age: 42 },
            { name: 'bar', age: 30 },
        ]);
        expect(array.every(x => x instanceof C)).toBeTrue();

        expect(array[0].name).toBe('foo');
        expect(array[0].age).toBe(42);

        expect(array[1].name).toBe('bar');
        expect(array[1].age).toBe(30);
    });

    it('should deserialize with custom', () => {
        @JsonClass()
        class Inner implements CustomSerialize {
            @JsonProperty() n: number;
            @JsonProperty() ns: string;
            @JsonComplexProperty(Address) na: Address;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            customSerialize(_mapper: JsonMapper): object {
                return { n: 'foo' };
            }
        }

        @JsonClass()
        class Outer {
            @JsonComplexProperty(Inner) inner: Inner;
        }

        const outer = new Outer();
        outer.inner = new Inner();

        const mapper = new JsonMapper();
        const v = { n: 'foo' };
        expect(mapper.serialize(outer)).toEqual({ inner: v });
        expect(mapper.serialize(outer.inner)).toStrictEqual(v);
    });

    it('should deserialize as null if array property is not an array', () => {
        @JsonClass()
        class Y {
            @JsonProperty()
            s: string;
        }

        @JsonClass()
        class X {
            @JsonArray() x: number[];
            @JsonArrayOfComplexProperty(Y) y: Y[];
        }

        const des = new JsonMapper().deserialize(X, {
            x: 1,
            y: '',
        });
        expect(des.x).toBeNull();
        expect(des.y).toBeNull();
    });

    it('should not map undefined fields in input object', () => {
        const obj = {
            line1: 'foo',
        };

        const addr = new JsonMapper().deserialize(AddressExtended, obj);

        expect(addr instanceof AddressExtended).toBeTrue();
        expect(addr.line1).toEqual(obj.line1);
        expect(addr.line2).toBeUndefined();
        expect(addr.line3).toBeUndefined();
    });

    it('should not serialize missing fields in input object if ignoreUndecoratedProperties = true', () => {
        const addr = new Address();

        addr.line1 = 'a';
        addr.line2 = 'b';
        (addr as any).line3 = 'c';

        const s = new JsonMapper().serialize(addr);

        expect(s.line1).toEqual(addr.line1);
        expect(s.line2).toEqual(addr.line2);
        expect(s.line3).toBeUndefined();
    });

    each([true, false, null]).it(
        'should handle missing fields in input object in serialize if ignoreUndecoratedProperties = %s',
        value => {
            let dec: ClassDecorator;
            if (value === null) {
                dec = JsonClass();
            } else {
                dec = JsonClass({ ignoreUndecoratedProperties: value });
            }

            @dec
            class C {
                @JsonProperty()
                line1: string;
                line2: string;
            }
            const addr = new C();
            addr.line1 = 'a';
            addr.line2 = 'b';

            const s = new JsonMapper().serialize(addr);

            expect(s.line1).toEqual(addr.line1);
            if (value !== false) {
                expect(s.line2).toBeUndefined();
            } else {
                expect(s.line2).toEqual(addr.line2);
            }
        }
    );

    it('should call afterDeserialize if implemented', () => {
        const obj = { line1: 'foo', line2: 'bar', line3: 'baz' };
        const ret = new JsonMapper().deserialize(AddressExtended, obj);
        expect(ret.line1).toBe('foo');
        expect(ret.line2).toBe('bar');
        expect(ret.line3).toBe('BAZ');
    });

    it('should serialize correctly with not initialized properties', () => {
        @JsonClass()
        class X {
            @JsonProperty('n') name: string;
            @JsonProperty('s') surname: string;
        }

        const obj = { n: 'foo', s: 'bar' };

        const des = new JsonMapper().deserialize(X, obj);
        expect(des.surname).toEqual('bar');
        expect(des.name).toEqual('foo');
    });

    it('should not throw and not map fields not of array type but decorated with array', () => {
        @JsonClass()
        class X {
            @JsonArray()
            x: number;
            @JsonArrayOfComplexProperty(X)
            xs: X;
        }

        const x = new X();
        x.x = 10;
        x.xs = new X();
        const s = new JsonMapper().serialize(x);
        expect(s.x).toBeNull();
        expect(s.xs).toBeNull();
    });

    it('should throw if throwing enabled for map fields not of array type but decorated with array', () => {
        const mapper = new JsonMapper();

        @JsonClass()
        class X {
            @JsonArray(undefined, true)
            x: number;
        }

        const x = new X();
        x.x = 10;
        expect(() => mapper.serialize(x)).toThrow('Expected array, got number');

        @JsonClass()
        class Y {
            @JsonArrayOfComplexProperty(X, undefined, true)
            Y: X;
        }

        const y = new Y();
        y.Y = new X();
        expect(() => mapper.serialize(y)).toThrow('Expected array, got object');
    });

    it('should not map fields with no metadata associated', () => {
        @JsonClass()
        class X {
            @JsonProperty() x: number;
            y: number;
        }

        const mapper = new JsonMapper();
        const x = { x: 10, y: 20 };
        const xd = mapper.deserialize(X, x);
        expect(xd.x).toBe(10);
        expect(xd.y).toBeUndefined();
        xd.y = 20;
        const xs = mapper.serialize(xd);
        expect(xs.x).toBe(10);
        expect(xs.y).toBeUndefined();
    });

    it('should serialize and deserialize correctly with inheritance', () => {
        @JsonClass()
        class X implements AfterDeserialize {
            @JsonProperty() x: number;

            afterDeserialize(): void {
                this.x = this.x + 1;
            }
        }

        @JsonClass()
        class Y extends X {
            @JsonProperty('otherY') y: number;
        }

        @JsonClass()
        class Z extends X implements AfterDeserialize {
            @JsonProperty() z: number;

            override afterDeserialize(): void {
                super.afterDeserialize();
                this.z = this.z * 2;
            }
        }

        const mapper = new JsonMapper();
        const x = new X();

        x.x = 10;
        const xs = mapper.serialize(x);
        expect(xs.x).toBe(10);
        const xx = mapper.deserialize(X, xs);
        expect(xx.x).toBe(11);
        expect(xx['otherY']).toBeUndefined();
        expect(xx).toBeInstanceOf(X);
        expect(xx).not.toBeInstanceOf(Y);
        expect(xx).not.toBeInstanceOf(Z);

        const y = new Y();

        y.x = 10;
        y.y = 20;
        const ys = mapper.serialize(y);
        expect(ys.x).toBe(10);
        expect(ys.otherY).toBe(20);
        expect(ys.y).toBeUndefined();

        const yy = mapper.deserialize(Y, ys);
        expect(yy.x).toBe(11);
        expect(yy.y).toBe(20);
        expect(yy).toBeInstanceOf(X);
        expect(yy).toBeInstanceOf(Y);

        const z = new Z();

        z.x = 10;
        z.z = 20;
        const zs = mapper.serialize(z);
        expect(zs.x).toBe(10);
        expect(zs.z).toBe(20);

        const zz = mapper.deserialize(Z, zs);
        expect(zz.x).toBe(11);
        expect(zz.z).toBe(40);
        expect(zz).toBeInstanceOf(X);
        expect(zz).toBeInstanceOf(Z);
    });

    it('should deserialize when there are no decorators', () => {
        @JsonClass({ ignoreUndecoratedProperties: false })
        class X {
            x: number;
        }

        const x = { x: 10 };
        const xd = new JsonMapper().deserialize(X, x);
        expect(xd.x).toBe(10);
    });

    it('should error if class is undecorated', () => {
        class X {
            x: number;
        }

        const mapper = new JsonMapper();
        const x = { x: 10 };
        expect(() => mapper.deserialize(X, x)).toThrow('Class X is not decorated with @JsonClass');

        const xc = new X();
        xc.x = 10;
        expect(() => mapper.serialize(xc)).toThrow('Class X is not decorated with @JsonClass');
    });

    it('should error if class of field is undecorated', () => {
        class Y {}

        @JsonClass()
        class X {
            @JsonComplexProperty(Y) y: Y;
        }

        const mapper = new JsonMapper();
        const x = { x: 10, y: {} };
        expect(() => mapper.deserialize(X, x)).toThrow('Class Y is not decorated with @JsonClass');

        const xc = new X();
        xc.y = new Y();
        expect(() => mapper.serialize(xc)).toThrow('Class Y is not decorated with @JsonClass');
    });
});

@JsonClass({ ignoreUndecoratedProperties: true })
export class Address {
    @JsonProperty() line1: string;

    @JsonProperty() line2: string;
}

@JsonClass({ ignoreUndecoratedProperties: false })
export class AddressExtended extends Address implements AfterDeserialize {
    line3: string;

    afterDeserialize(): void {
        if (this.line3) {
            this.line3 = this.line3.toUpperCase();
        }
    }
}
