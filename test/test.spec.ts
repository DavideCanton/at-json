import 'jest-extended';
import each from 'jest-each';

import * as D from '../lib/decorators';
import * as IF from '../lib/interfaces';
import * as M from '../lib/mapper';
import { dateEquals } from './test-utils';
import { Person, AddressExtended, Gender, Address } from './test.models';

describe('Mapper tests', () =>
{
    each([
        'string', 'object'
    ]).it('should deserialize when type is %s', type =>
    {
        const obj = {
            firstName: 'Piero',
            lastName: 'Gorgi',
            eta: 16,
            date: '2012',
            date22: '2014',
            gender: 1,
            numbers: [1, 2, 3],
            aa: {
                line1: 'a',
                line2: 'b',
                line3: 'c',
                line4: 'd'
            },
            address2: {
                line1: 'e',
                line2: 'f',
                line3: 'g',
                line4: 'h'
            },
            prevs: [
                {
                    line1: 'c',
                    line2: 'd',
                    line4: 'x'
                },
                {
                    line1: 'e',
                    line2: 'f'
                },
                null
            ]
        };

        const input = type === 'string' ? JSON.stringify(obj) : obj;

        const p = M.JsonMapper.deserialize(Person, input);

        expect(p).not.toBeNull();
        expect(p.address).not.toBeNull();

        expect(p).toBeInstanceOf(Person);
        expect(p.address).toBeInstanceOf(AddressExtended);
        expect(p.address.line4).toEqual('d');

        expect(p.address2).toBeInstanceOf(AddressExtended);
        expect(p.address2.line1).toEqual('e');
        expect(p.address2.line2).toEqual('f');
        expect(p.address2.line3).toEqual('g');
        expect(p.address2.line4).toEqual('h');

        expect(p.firstName).toEqual(obj.firstName);
        expect(p.lastName).toEqual(obj.lastName.toUpperCase());
        expect(p.age).toEqual(obj.eta);
        expect(p.gender).toEqual(Gender.F);
        expect(dateEquals(p.date, new Date(+obj.date, 2, 12))).toBeTrue();
        expect(dateEquals(p.date2, new Date(+obj.date22, 2, 12))).toBeTrue();

        expect(p.numbers).toEqual(obj.numbers);

        expect(p.address).toEqual(obj.aa);

        expect(p.prevAddresses).toEqual([
            { ...obj.prevs[0], line4: undefined },
            obj.prevs[1],
            null
        ]);
    });

    it('should deserialize with custom', () =>
    {
        @D.JsonClass()
        class C implements IF.CustomSerialize
        {
            @D.JsonProperty() n: number;
            @D.JsonProperty() ns: string;
            @D.JsonComplexProperty(Address) na: Address;

            customSerialize()
            {
                return 'ciao';
            }
        }

        @D.JsonClass()
        class C2
        {
            @D.JsonComplexProperty(C) c: C;
        }

        const dd = new C2();
        dd.c = new C();
        const spy = jest.spyOn(dd.c, 'customSerialize');

        expect(M.JsonMapper.serialize(dd)).toEqual({ c: 'ciao' });
        expect(M.JsonMapper.serialize(dd.c)).toBe('ciao');
        expect(spy).toHaveBeenCalledTimes(2);
    });

    it('should deserialize as null if array property is not an array', () =>
    {
        @D.JsonClass()
        class Y
        {
            @D.JsonProperty()
            s: string;
        }

        @D.JsonClass()
        class X
        {
            @D.JsonArray() x: number[];
            @D.JsonArrayOfComplexProperty(Y) y: Y[];
        }

        const des = M.JsonMapper.deserialize(X, {
            x: 1,
            y: ''
        });
        expect(des.x).toBeNull();
        expect(des.y).toBeNull();
    });

    it('should deserialize array', () =>
    {
        const objs = [{
            firstName: 'Piero',
            lastName: 'Gorgi',
            eta: 16,
            date: '2012',
            date22: '2014',
            gender: 1,
            numbers: [1, 2, 3],
            aa: {
                line1: 'a',
                line2: 'b',
                line3: 'c'
            },
            prevs: [
                {
                    line1: 'c',
                    line2: 'd'
                },
                {
                    line1: 'e',
                    line2: 'f'
                },
                null
            ]
        }, {
            firstName: 'aaa',
            lastName: 'bbb',
            eta: 21,
            date: '2015',
            date22: '2017',
            gender: 0,
            numbers: [3, 4, 5],
            aa: {
                line1: 'g',
                line2: 'j',
                line3: 'k'
            },
            prevs: [
                {
                    line1: 'f',
                    line2: 's'
                },
                {
                    line1: 'c',
                    line2: 'c'
                },
                null
            ]
        }];

        const ps = M.JsonMapper.deserializeArray(Person, objs);

        expect(ps.length).toEqual(objs.length);

        ps.forEach((p, i) =>
        {
            const obj = objs[i];

            expect(p).not.toBeNull();
            expect(p.address).not.toBeNull();

            expect(p instanceof Person).toBeTrue();
            expect(p.address instanceof AddressExtended).toBeTrue();

            expect(p.firstName).toEqual(obj.firstName);
            expect(p.lastName).toEqual(obj.lastName.toUpperCase());
            expect(p.age).toEqual(obj.eta);
            expect(p.gender).toEqual(obj.gender);
            expect(dateEquals(p.date, new Date(+obj.date, 2, 12))).toBeTrue();
            expect(dateEquals(p.date2, new Date(+obj.date22, 2, 12))).toBeTrue();

            expect(p.numbers).toEqual(obj.numbers);
            expect(p.address).toEqual(obj.aa);

            expect(p.prevAddresses).toEqual([
                { ...obj.prevs[0], line4: undefined },
                obj.prevs[1],
                null
            ]);
        });
    });

    it('should serialize', () =>
    {
        const obj = {
            firstName: 'Piero',
            lastName: 'Milo',
            eta: 16,
            gender: 1,
            date: '2012',
            numbers: [1, 2, 3],
            aa: {
                line1: 'a',
                line2: 'b',
                line3: 'c',
                line4: 'd'
            },
            prevs: [
                {
                    line1: 'c',
                    line2: 'd',
                    line3: 'e'
                },
                {
                    line1: 'e',
                    line2: 'f'
                },
                null
            ]
        };

        const p = M.JsonMapper.deserialize(Person, obj);
        p.numbers2 = null;

        const s = M.JsonMapper.serialize(p);

        const p2 = M.JsonMapper.deserialize(Person, s);

        expect(p2.firstName).toEqual(p.firstName);
        expect(p2.lastName).toEqual(p.lastName);
        expect(p2.age).toEqual(p.age);
        expect(dateEquals(p2.date, p.date)).toBeTrue();
        expect(p2.gender).toEqual(p.gender);
        expect(p2.numbers.length).toEqual(p.numbers.length);
        expect(p2.numbers).toEqual(p.numbers);
        expect(p2.numbers2).toBeNull();
        expect(p2.address).toEqual(p.address);
        expect(p2.prevAddresses).toEqual(p.prevAddresses);
    });

    it('should not map undefined fields in input object', () =>
    {
        const obj = {
            line1: 'ciao'
        };

        const addr = M.JsonMapper.deserialize(AddressExtended, obj);
        const addrDefault = new AddressExtended();

        expect(addr instanceof AddressExtended).toBeTrue();
        expect(addr.line1).toEqual(obj.line1);
        expect(addr.line2).toEqual(addrDefault.line2);
        expect(addr.line3).toEqual(addrDefault.line3);
    });

    it('should not serialize missing fields in input object if @JsonClass(true)', () =>
    {
        const addr = new Address();

        addr.line1 = 'a';
        addr.line2 = 'b';
        (addr as any).line3 = 'c';

        const s = M.JsonMapper.serialize(addr);

        expect(s.line1).toEqual(addr.line1);
        expect(s.line2).toEqual(addr.line2);
        expect(s.line3).toBeUndefined();
    });

    it('should deserialize arrays', () =>
    {
        const obj = {
            numbers: [1, 2, 3],
            numbers2: [1, 2, 3],
            prevs: [
                {
                    line1: 'c',
                    line2: 'd'
                }
            ],
            nextAddresses: [
                {
                    line1: 'e',
                    line2: 'f'
                }
            ]
        };
        const p = M.JsonMapper.deserialize(Person, obj);

        expect(p.numbers).toEqual(obj.numbers);
        expect(p.numbers2).toEqual(obj.numbers2);

        expect(p.prevAddresses).toEqual(obj.prevs);
    });

    it('should deserialize arrays correctly when null', () =>
    {
        const obj = {};
        const p = M.JsonMapper.deserialize(Person, obj);

        expect(p.numbers).toBeArrayOfSize(0);
        expect(p.numbers2).toBeUndefined();

        expect(p.prevAddresses).toBeArrayOfSize(0);
        expect(p.nextAddresses).toBeUndefined();
    });

    it('should call afterDeserialize if implemented', () =>
    {
        const spyFn = jest.spyOn(AddressExtended.prototype, 'afterDeserialize');
        const obj = { line1: 'ciao' };
        M.JsonMapper.deserialize(AddressExtended, obj);
        expect(spyFn).toHaveBeenCalled();
    });

    it('should serialize correctly with custom decorators', () =>
    {
        const dec = (ctor, params) => D.makeCustomDecorator<any>(() => (
            {
                serialize: x => [M.JsonMapper.serialize(x)],
                deserialize: x => M.JsonMapper.deserialize(ctor, x[0])
            })
        )(params);

        @D.JsonClass()
        class X
        {
            @D.JsonProperty('n') name: string;
            @D.JsonProperty({
                name: 's',
                serialize: (x: string) => x.toLowerCase(),
                deserialize: (x: string) => x.toUpperCase()
            }) surname: string;
        }

        @D.JsonClass()
        class Y
        {
            @dec(X, { name: 'xs' })
            x: X;
        }

        const obj = {
            xs: [
                { n: 'davide', s: 'canton' }
            ]
        };

        const des = M.JsonMapper.deserialize(Y, obj);
        expect(des.x).not.toBeNull();
        expect(des.x.surname).toEqual('CANTON');
        expect(des.x.name).toEqual('davide');

        const obj2 = M.JsonMapper.serialize(des);

        expect(obj).toEqual(obj2);
    });

    it('should serialize correctly with not initialized properties', () =>
    {
        @D.JsonClass()
        class X
        {
            @D.JsonProperty('n') name: string;
            @D.JsonProperty('s') surname: string;
        }

        const obj = { n: 'davide', s: 'canton' };

        const des = M.JsonMapper.deserialize(X, obj);
        expect(des.surname).toEqual('canton');
        expect(des.name).toEqual('davide');
    });

    it('should deserialize map with primitive values', () =>
    {
        @D.JsonClass()
        class X
        {
            @D.JsonMap()
            map: Map<string, string>;
        }

        const obj = { map: { n: 'davide', s: 'canton' } };

        const des = M.JsonMapper.deserialize(X, obj);
        expect(des.map.get('n')).toEqual('davide');
        expect(des.map.get('s')).toEqual('canton');
    });

    it('should serialize map with primitive values', () =>
    {
        @D.JsonClass()
        class X
        {
            @D.JsonMap()
            map = new Map<string, string>();
        }

        const x = new X();
        x.map.set('n', 'davide');
        x.map.set('s', 'canton');

        const s = M.JsonMapper.serialize(x);
        expect(s.map.n).toEqual('davide');
        expect(s.map.s).toEqual('canton');
    });

    it('should deserialize map with complex values', () =>
    {
        @D.JsonClass()
        class Y
        {
            @D.JsonProperty('n') name: string;
            @D.JsonProperty('s') surname: string;
        }

        @D.JsonClass()
        class X
        {
            @D.JsonMap({ complexType: Y })
            map: Map<string, Y>;
        }

        const obj = { map: { p1: { n: 'davide', s: 'canton' }, p2: { n: 'paolo', s: 'rossi' } } };

        const des = M.JsonMapper.deserialize(X, obj);

        const p1 = des.map.get('p1')!;
        expect(p1.name).toEqual('davide');
        expect(p1.surname).toEqual('canton');

        const p2 = des.map.get('p2')!;
        expect(p2.name).toEqual('paolo');
        expect(p2.surname).toEqual('rossi');
    });

    it('should serialize map with complex values', () =>
    {
        @D.JsonClass()
        class Y
        {
            @D.JsonProperty('n') name: string;
            @D.JsonProperty('s') surname: string;
        }

        @D.JsonClass()
        class X
        {
            @D.JsonMap({ complexType: Y })
            map = new Map<string, Y>();
        }

        const x = new X();
        x.map.set('p1', new Y());
        x.map.get('p1')!.name = 'davide';
        x.map.get('p1')!.surname = 'canton';
        x.map.set('p2', new Y());
        x.map.get('p2')!.name = 'paolo';
        x.map.get('p2')!.surname = 'rossi';

        const s = M.JsonMapper.serialize(x);
        expect(s.map.p1.n).toEqual('davide');
        expect(s.map.p1.s).toEqual('canton');

        expect(s.map.p2.n).toEqual('paolo');
        expect(s.map.p2.s).toEqual('rossi');
    });

    it('should not throw and not map fields not of array type but decorated with array', () =>
    {
        @D.JsonClass()
        class X
        {
            @D.JsonArray()
            x: number;
            @D.JsonArrayOfComplexProperty(X)
            xs: X;
        }

        const x = new X();
        x.x = 10;
        x.xs = new X();
        const s = M.JsonMapper.serialize(x);
        expect(s.x).toBeNull();
        expect(s.xs).toBeNull();
    });

    it('should throw if enabled throwing for map fields not of array type but decorated with array', () =>
    {
        @D.JsonClass()
        class X
        {
            @D.JsonArray(undefined, true)
            x: number;
        }

        const x = new X();
        x.x = 10;
        expect(() => M.JsonMapper.serialize(x)).toThrow('Expected array, got number');

        @D.JsonClass()
        class Y
        {
            @D.JsonArrayOfComplexProperty(X, undefined, true)
            Y: X;
        }

        const y = new Y();
        y.Y = new X();
        expect(() => M.JsonMapper.serialize(y)).toThrow('Expected array, got object');
    });

    it('should not map fields with no metadata associated', () =>
    {
        @D.JsonClass()
        class X
        {
            @D.JsonProperty() x: number;
            y: number;
        }

        const x = { x: 10, y: 20 };
        const xd = M.JsonMapper.deserialize(X, x);
        expect(xd.x).toBe(10);
        expect(xd.y).toBeUndefined();
        xd.y = 20;
        const xs = M.JsonMapper.serialize(xd);
        expect(xs.x).toBe(10);
        expect(xs.y).toBeUndefined();
    });

    it('should serialize and deserialize correctly with inheritance', () =>
    {
        @D.JsonClass()
        class X implements IF.AfterDeserialize
        {
            @D.JsonProperty() x: number;

            afterDeserialize()
            {
                this.x = this.x + 1;
            }
        }

        @D.JsonClass()
        class Y extends X
        {
            @D.JsonProperty('otherY') y: number;
        }

        @D.JsonClass()
        class Z extends X implements IF.AfterDeserialize
        {
            @D.JsonProperty() z: number;

            afterDeserialize()
            {
                super.afterDeserialize();
                this.z = this.z * 2;
            }
        }

        const x = new X();
        const spyX = jest.spyOn(X.prototype, 'afterDeserialize');

        x.x = 10;
        const xs = M.JsonMapper.serialize(x);
        expect(xs.x).toBe(10);
        const xx = M.JsonMapper.deserialize(X, xs);
        expect(spyX).toHaveBeenCalled();
        expect(xx.x).toBe(11);
        expect(xx['otherY']).toBeUndefined();
        expect(xx).toBeInstanceOf(X);
        expect(xx).not.toBeInstanceOf(Y);

        const y = new Y();
        const spyY = jest.spyOn(Y.prototype, 'afterDeserialize');

        y.x = 10;
        y.y = 20;
        const ys = M.JsonMapper.serialize(y);
        expect(ys.x).toBe(10);
        expect(ys.otherY).toBe(20);
        expect(ys.y).toBeUndefined();

        const yy = M.JsonMapper.deserialize(Y, ys);
        expect(spyY).toHaveBeenCalled();
        expect(yy.x).toBe(11);
        expect(yy.y).toBe(20);
        expect(yy).toBeInstanceOf(X);
        expect(yy).toBeInstanceOf(Y);

        const z = new Z();
        const spyZ = jest.spyOn(Z.prototype, 'afterDeserialize');

        z.x = 10;
        z.z = 20;
        const zs = M.JsonMapper.serialize(z);
        expect(zs.x).toBe(10);
        expect(zs.z).toBe(20);

        const zz = M.JsonMapper.deserialize(Z, zs);
        expect(spyZ).toHaveBeenCalled();
        expect(zz.x).toBe(11);
        expect(zz.z).toBe(40);
        expect(zz).toBeInstanceOf(X);
        expect(zz).toBeInstanceOf(Z);
    });

    it('should deserialize when there are no decorators', () =>
    {
        @D.JsonClass({ ignoreUndecoratedProperties: false })
        class X
        {
            x: number;
        }

        const x = { x: 10 };
        const xd = M.JsonMapper.deserialize(X, x);
        expect(xd.x).toBe(10);
    });

    it('should error if class is undecorated', () =>
    {
        class X
        {
            x: number;
        }

        const x = { x: 10 };
        expect(() => M.JsonMapper.deserialize(X, x)).toThrow('Class X is not decorated with @JsonClass');

        const xc = new X();
        xc.x = 10;
        expect(() => M.JsonMapper.serialize(xc)).toThrow('Class X is not decorated with @JsonClass');
    });

    it('should error if class of field is undecorated', () =>
    {
        class Y { }

        @D.JsonClass()
        class X
        {
            @D.JsonComplexProperty(Y) y: Y;
        }

        const x = { x: 10, y: {} };
        expect(() => M.JsonMapper.deserialize(X, x)).toThrow('Class Y is not decorated with @JsonClass');

        const xc = new X();
        xc.y = new Y();
        expect(() => M.JsonMapper.serialize(xc)).toThrow('Class Y is not decorated with @JsonClass');
    });
});
