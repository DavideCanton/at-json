import 'jest-extended';

import * as atJ from '../lib';

const JsonDateProperty = atJ.makeCustomDecorator<Date>(
    d => d ? d.getFullYear().toString() : '',
    s => new Date(+s, 2, 12)
);

function dateEquals(d: Date | null | undefined, d2: Date | null | undefined): boolean
{
    return d?.getTime() === d2?.getTime();
}

@atJ.JsonClass(true)
class Address
{
    @atJ.JsonProperty() line1: string;

    @atJ.JsonProperty() line2: string;

    serialize: atJ.SerializeFn;
}

@atJ.JsonClass(false)
class AddressExtended extends Address implements atJ.AfterDeserialize
{
    @atJ.JsonProperty() line3: string;

    serialize: atJ.SerializeFn;

    [other: string]: any;

    afterDeserialize() { }
}

enum Gender
{
    M = 0, F = 1
}

@atJ.JsonClass()
class Person
{
    @atJ.JsonProperty()
    firstName: string;

    @atJ.JsonProperty(Person.mapLastName)
    lastName: string;

    @atJ.JsonProperty('eta')
    age: number;

    @JsonDateProperty()
    date: Date | null;

    @JsonDateProperty('date22')
    date2: Date | null;

    @atJ.JsonProperty()
    gender: Gender;

    @atJ.JsonArray()
    numbers: number[] = [];

    @atJ.JsonArray()
    numbers2: number[] | null;

    @atJ.JsonComplexProperty(AddressExtended, 'aa')
    address: AddressExtended;


    @atJ.JsonComplexProperty(AddressExtended)
    address2: AddressExtended;

    @atJ.JsonArrayOfComplexProperty(Address, 'prevs')
    prevAddresses: Address[] = [];

    @atJ.JsonArrayOfComplexProperty(Address)
    nextAddresses: Address[] | null;

    serialize: atJ.SerializeFn;

    static mapLastName(s: string): string
    {
        return s.toUpperCase();
    }
}


describe('Mapper tests', () =>
{
    it('should deserialize', () =>
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

        const p = atJ.JsonMapper.deserialize(Person, obj);

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

    it('should deserialize as null if array property is not an array', () =>
    {
        @atJ.JsonClass()
        class Y
        {
            @atJ.JsonProperty()
            s: string;

            serialize: atJ.SerializeFn;
        }

        @atJ.JsonClass()
        class X
        {
            @atJ.JsonArray() x: number[];
            @atJ.JsonArrayOfComplexProperty(Y) y: Y[];

            serialize: atJ.SerializeFn;
        }

        const des = atJ.JsonMapper.deserialize(X, {
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

        const ps = atJ.JsonMapper.deserializeArray(Person, objs);

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

        const p = atJ.JsonMapper.deserialize(Person, obj);
        p.numbers2 = null;

        const s = p.serialize();

        const p2 = atJ.JsonMapper.deserialize(Person, s);

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

        const addr = atJ.JsonMapper.deserialize(AddressExtended, obj);
        const addrDefault = new AddressExtended();

        expect(addr instanceof AddressExtended).toBeTrue();
        expect(addr.line1).toEqual(obj.line1);
        expect(addr.line2).toEqual(addrDefault.line2);
        expect(addr.line3).toEqual(addrDefault.line3);
    });

    it('should not serialize missing fields in input object if @atJson.JsonClass(true)', () =>
    {
        const addr = new Address();

        addr.line1 = 'a';
        addr.line2 = 'b';
        (addr as any).line3 = 'c';

        const s = JSON.parse(addr.serialize());

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
        const p = atJ.JsonMapper.deserialize(Person, obj);

        expect(p.numbers).toEqual(obj.numbers);
        expect(p.numbers2).toEqual(obj.numbers2);

        expect(p.prevAddresses).toEqual(obj.prevs);
    });

    it('should deserialize arrays correctly when null', () =>
    {
        const obj = {};
        const p = atJ.JsonMapper.deserialize(Person, obj);

        expect(p.numbers).toBeArrayOfSize(0);
        expect(p.numbers2).toBeUndefined();

        expect(p.prevAddresses).toBeArrayOfSize(0);
        expect(p.nextAddresses).toBeUndefined();
    });

    it('should call atJson.afterDeserialize if implemented', () =>
    {
        const spyFn = jest.spyOn(AddressExtended.prototype, 'afterDeserialize');
        const obj = { line1: 'ciao' };
        atJ.JsonMapper.deserialize(AddressExtended, obj);
        expect(spyFn).toHaveBeenCalled();
    });

    it('should serialize correctly fields', () =>
    {
        const obj = {
            a: [
                { n: 1 },
                { n: 2 },
                { n: 3 }
            ],
            b: 1,
            c: 'ciao',
            d: {
                e: 1,
                f: null
            },
            serialize: () => ''
        };

        const s = atJ.JsonMapper.serialize(obj);
        expect(s).toEqual('{"a":[{"n":1},{"n":2},{"n":3}],"b":1,"c":"ciao","d":{"e":1,"f":null}}');
    });

    it('should serialize correctly with custom decorators', () =>
    {
        const dec = <T extends atJ.JsonSerializable>(ctor: atJ.Constructable<T>, params?: atJ.IMappingOptions<T, any>) => atJ.makeCustomDecorator<T>(
            x => [atJ.JsonMapper.exportForSerialize(x)],
            x => atJ.JsonMapper.deserialize(ctor, x[0])
        )({ ...params, complexType: ctor });

        @atJ.JsonClass()
        class X
        {
            @atJ.JsonProperty('n') name: string;
            @atJ.JsonProperty({
                name: 's',
                serializeFn: (x: string) => x.toLowerCase(),
                mappingFn: (x: string) => x.toUpperCase()
            }) surname: string;

            serialize: atJ.SerializeFn;
        }

        @atJ.JsonClass()
        class Y
        {
            @dec(X, { name: 'xs' })
            x: X;

            serialize: atJ.SerializeFn;
        }

        const obj = {
            xs: [
                { n: 'davide', s: 'canton' }
            ]
        };

        const des = atJ.JsonMapper.deserialize(Y, obj);
        expect(des.x).not.toBeNull();
        expect(des.x.surname).toEqual('CANTON');
        expect(des.x.name).toEqual('davide');

        const obj2 = des.serialize();

        expect(JSON.stringify(obj)).toEqual(obj2);
    });

    it('should serialize correctly with not initialized properties', () =>
    {
        @atJ.JsonClass()
        class X
        {
            @atJ.JsonProperty('n') name: string;
            @atJ.JsonProperty('s') surname: string;

            serialize: atJ.SerializeFn;
        }

        const obj = { n: 'davide', s: 'canton' };

        const des = atJ.JsonMapper.deserialize(X, obj);
        expect(des.surname).toEqual('canton');
        expect(des.name).toEqual('davide');
    });

    it('should deserialize map with primitive values', () =>
    {
        @atJ.JsonClass()
        class X
        {
            @atJ.JsonMap()
            map: Map<string, string>;

            serialize: atJ.SerializeFn;
        }

        const obj = { map: { n: 'davide', s: 'canton' } };

        const des = atJ.JsonMapper.deserialize(X, obj);
        expect(des.map.get('n')).toEqual('davide');
        expect(des.map.get('s')).toEqual('canton');
    });

    it('should serialize map with primitive values', () =>
    {
        @atJ.JsonClass()
        class X
        {
            @atJ.JsonMap()
            map = new Map<string, string>();

            serialize: atJ.SerializeFn;
        }

        const x = new X();
        x.map.set('n', 'davide');
        x.map.set('s', 'canton');

        const s = JSON.parse(x.serialize());
        expect(s.map.n).toEqual('davide');
        expect(s.map.s).toEqual('canton');
    });

    it('should deserialize map with complex values', () =>
    {
        @atJ.JsonClass()
        class Y
        {
            @atJ.JsonProperty('n') name: string;
            @atJ.JsonProperty('s') surname: string;
            serialize: atJ.SerializeFn;
        }

        @atJ.JsonClass()
        class X
        {
            @atJ.JsonMap({ complexType: Y })
            map: Map<string, Y>;

            serialize: atJ.SerializeFn;
        }

        const obj = { map: { p1: { n: 'davide', s: 'canton' }, p2: { n: 'paolo', s: 'rossi' } } };

        const des = atJ.JsonMapper.deserialize(X, obj);

        const p1 = des.map.get('p1')!;
        expect(p1.name).toEqual('davide');
        expect(p1.surname).toEqual('canton');

        const p2 = des.map.get('p2')!;
        expect(p2.name).toEqual('paolo');
        expect(p2.surname).toEqual('rossi');
    });

    it('should serialize map with complex values', () =>
    {
        @atJ.JsonClass()
        class Y
        {
            @atJ.JsonProperty('n') name: string;
            @atJ.JsonProperty('s') surname: string;
            serialize: atJ.SerializeFn;
        }

        @atJ.JsonClass()
        class X
        {
            @atJ.JsonMap({ complexType: Y })
            map = new Map<string, Y>();

            serialize: atJ.SerializeFn;
        }

        const x = new X();
        x.map.set('p1', new Y());
        x.map.get('p1')!.name = 'davide';
        x.map.get('p1')!.surname = 'canton';
        x.map.set('p2', new Y());
        x.map.get('p2')!.name = 'paolo';
        x.map.get('p2')!.surname = 'rossi';

        const s = JSON.parse(x.serialize());
        expect(s.map.p1.n).toEqual('davide');
        expect(s.map.p1.s).toEqual('canton');

        expect(s.map.p2.n).toEqual('paolo');
        expect(s.map.p2.s).toEqual('rossi');
    });

    it('should not map fields not of array type but decorated with array', () =>
    {
        const spy = jest.spyOn(console, 'warn').mockImplementation(() => { });

        @atJ.JsonClass()
        class X
        {
            @atJ.JsonArray()
            x: number;

            serialize: atJ.SerializeFn;
        }

        const x = new X();
        x.x = 10;
        const s = JSON.parse(x.serialize());
        expect(s.x).toBeNull();
        expect(spy).toHaveBeenCalled();
    });
});
