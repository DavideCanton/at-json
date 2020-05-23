import 'mocha';

import { expect, spy, use } from 'chai';
import * as spies from 'chai-spies';

import * as atJ from '../lib';

use(spies);

const JsonDateProperty = atJ.makeCustomDecorator<Date>(
    d => d ? d.getFullYear().toString() : '',
    s => new Date(+s, 2, 12)
);

function dateEquals(d: Date | null | undefined, d2: Date | null | undefined): boolean
{
    if(d === d2) return true;

    if(!d || !d2) return false;

    return d.getTime() === d2.getTime();
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

        expect(p).to.be.not.null;
        expect(p.address).to.be.not.null;

        expect(p instanceof Person).to.be.true;
        expect(p.address instanceof AddressExtended).to.be.true;

        expect(p.address.line4).to.equal('d');

        expect(p.address2 instanceof AddressExtended).to.be.true;

        expect(p.address2.line1).to.equal('e');
        expect(p.address2.line2).to.equal('f');
        expect(p.address2.line3).to.equal('g');
        expect(p.address2.line4).to.equal('h');

        expect(p.firstName).to.equal(obj.firstName);
        expect(p.lastName).to.equal(obj.lastName.toUpperCase());
        expect(p.age).to.equal(obj.eta);
        expect(p.gender).to.equal(Gender.F);
        expect(dateEquals(p.date, new Date(+obj.date, 2, 12))).to.be.true;
        expect(dateEquals(p.date2, new Date(+obj.date22, 2, 12))).to.be.true;

        expect(p.numbers.length).to.equal(obj.numbers.length);

        expect(p.numbers[0]).to.equal(obj.numbers[0]);
        expect(p.numbers[1]).to.equal(obj.numbers[1]);
        expect(p.numbers[2]).to.equal(obj.numbers[2]);

        expect(p.address.line1).to.equal(obj.aa.line1);
        expect(p.address.line2).to.equal(obj.aa.line2);
        expect(p.address.line3).to.equal(obj.aa.line3);

        expect(p.prevAddresses.length).to.equal(obj.prevs.length);

        expect(p.prevAddresses[0].line1).to.equal(obj.prevs[0].line1);
        expect(p.prevAddresses[0].line2).to.equal(obj.prevs[0].line2);
        expect((<any>p.prevAddresses[0]).line4).to.be.undefined;

        expect(p.prevAddresses[1].line1).to.equal(obj.prevs[1].line1);
        expect(p.prevAddresses[1].line2).to.equal(obj.prevs[1].line2);

        expect(p.prevAddresses[2]).to.be.null;
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
        expect(des.x).to.be.null;
        expect(des.y).to.be.null;
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

        expect(ps.length).to.equal(objs.length);

        ps.forEach((p, i) =>
        {
            const obj = objs[i];

            expect(p).to.be.not.null;
            expect(p.address).to.be.not.null;

            expect(p instanceof Person).to.be.true;
            expect(p.address instanceof AddressExtended).to.be.true;

            expect(p.firstName).to.equal(obj.firstName);
            expect(p.lastName).to.equal(obj.lastName.toUpperCase());
            expect(p.age).to.equal(obj.eta);
            expect(p.gender).to.equal(obj.gender);
            expect(dateEquals(p.date, new Date(+obj.date, 2, 12))).to.be.true;
            expect(dateEquals(p.date2, new Date(+obj.date22, 2, 12))).to.be.true;

            expect(p.numbers.length).to.equal(obj.numbers.length);

            expect(p.numbers[0]).to.equal(obj.numbers[0]);
            expect(p.numbers[1]).to.equal(obj.numbers[1]);
            expect(p.numbers[2]).to.equal(obj.numbers[2]);

            expect(p.address.line1).to.equal(obj.aa.line1);
            expect(p.address.line2).to.equal(obj.aa.line2);
            expect(p.address.line3).to.equal(obj.aa.line3);

            expect(p.prevAddresses.length).to.equal(obj.prevs.length);

            expect(p.prevAddresses[0].line1).to.equal(obj.prevs[0].line1);
            expect(p.prevAddresses[0].line2).to.equal(obj.prevs[0].line2);

            expect(p.prevAddresses[1].line1).to.equal(obj.prevs[1].line1);
            expect(p.prevAddresses[1].line2).to.equal(obj.prevs[1].line2);

            expect(p.prevAddresses[2]).to.be.null;
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

        expect(p2.firstName).to.equal(p.firstName);
        expect(p2.lastName).to.equal(p.lastName);
        expect(p2.age).to.equal(p.age);
        expect(dateEquals(p2.date, p.date)).to.be.true;
        expect(p2.gender).to.equal(p.gender);
        expect(p2.numbers.length).to.equal(p.numbers.length);
        expect(p2.numbers[0]).to.equal(p.numbers[0]);
        expect(p2.numbers[1]).to.equal(p.numbers[1]);
        expect(p2.numbers[2]).to.equal(p.numbers[2]);
        expect(p2.numbers2).to.be.null;
        expect(p2.address.line1).to.equal(p.address.line1);
        expect(p2.address.line2).to.equal(p.address.line2);
        expect(p2.address.line3).to.equal(p.address.line3);
        expect(p2.address.line4).to.equal(p.address.line4);
        expect(p2.prevAddresses.length).to.equal(p.prevAddresses.length);
        expect(p2.prevAddresses[0].line1).to.equal(p.prevAddresses[0].line1);
        expect(p2.prevAddresses[0].line2).to.equal(p.prevAddresses[0].line2);
        expect((p2.prevAddresses[0] as any).line3).to.equal((<any>p.prevAddresses[0]).line3);
        expect(p2.prevAddresses[1].line1).to.equal(p.prevAddresses[1].line1);
        expect(p2.prevAddresses[1].line2).to.equal(p.prevAddresses[1].line2);
        expect(p2.prevAddresses[2]).to.be.null;
    });

    it('should not map undefined fields in input object', () =>
    {
        const obj = {
            line1: 'ciao'
        };

        const addr = atJ.JsonMapper.deserialize(AddressExtended, obj);
        const addrDefault = new AddressExtended();

        expect(addr instanceof AddressExtended).to.be.true;
        expect(addr.line1).to.equal(obj.line1);
        expect(addr.line2).to.equal(addrDefault.line2);
        expect(addr.line3).to.equal(addrDefault.line3);
    });

    it('should not serialize missing fields in input object if @atJson.JsonClass(true)', () =>
    {
        const addr = new Address();

        addr.line1 = 'a';
        addr.line2 = 'b';
        (addr as any).line3 = 'c';

        const s = JSON.parse(addr.serialize());

        expect(s.line1).to.equal(addr.line1);
        expect(s.line2).to.equal(addr.line2);
        expect(s.line3).to.be.undefined;
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

        expect(p.numbers.length).to.equal(obj.numbers.length);
        expect(p.numbers[0]).to.equal(obj.numbers[0]);
        expect(p.numbers[1]).to.equal(obj.numbers[1]);
        expect(p.numbers[2]).to.equal(obj.numbers[2]);
        expect(p.numbers2.length).to.equal(obj.numbers2.length);
        expect(p.numbers2[0]).to.equal(obj.numbers2[0]);
        expect(p.numbers2[1]).to.equal(obj.numbers2[1]);
        expect(p.numbers2[2]).to.equal(obj.numbers2[2]);

        expect(p.prevAddresses.length).to.equal(obj.prevs.length);
        expect(p.prevAddresses[0].line1).to.equal(obj.prevs[0].line1);
        expect(p.prevAddresses[0].line2).to.equal(obj.prevs[0].line2);

        expect(p.nextAddresses.length).to.equal(obj.nextAddresses.length);
        expect(p.nextAddresses[0].line1).to.equal(obj.nextAddresses[0].line1);
        expect(p.nextAddresses[0].line2).to.equal(obj.nextAddresses[0].line2);
    });

    it('should deserialize arrays correctly when null', () =>
    {
        const obj = {};
        const p = atJ.JsonMapper.deserialize(Person, obj);

        expect(p.numbers.length).to.equal(0);
        expect(p.numbers2).to.be.undefined;

        expect(p.prevAddresses.length).to.equal(0);
        expect(p.nextAddresses).to.be.undefined;
    });

    it('should call atJson.afterDeserialize if implemented', () =>
    {
        const oldFn = AddressExtended.prototype.atJson.afterDeserialize;

        const spyFn = spy.on(AddressExtended.prototype, 'atJson.afterDeserialize');

        const obj = { line1: 'ciao' };

        atJ.JsonMapper.deserialize(AddressExtended, obj);

        expect(spyFn).to.have.been.called();

        AddressExtended.prototype.atJson.afterDeserialize = oldFn;
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
        expect(s).to.equal('{"a":[{"n":1},{"n":2},{"n":3}],"b":1,"c":"ciao","d":{"e":1,"f":null}}');
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
        expect(des.x).to.not.be.null;
        expect(des.x.surname).to.equal('CANTON');
        expect(des.x.name).to.equal('davide');

        const obj2 = des.serialize();

        expect(JSON.stringify(obj)).to.equal(obj2);
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
        expect(des.surname).to.equal('canton');
        expect(des.name).to.equal('davide');
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
        expect(des.map.get('n')).to.equal('davide');
        expect(des.map.get('s')).to.equal('canton');
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
        expect(s.map.n).to.equal('davide');
        expect(s.map.s).to.equal('canton');
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
        expect(p1.name).to.equal('davide');
        expect(p1.surname).to.equal('canton');

        const p2 = des.map.get('p2')!;
        expect(p2.name).to.equal('paolo');
        expect(p2.surname).to.equal('rossi');
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
        x.map.get('p1').name = 'davide';
        x.map.get('p1').surname = 'canton';
        x.map.set('p2', new Y());
        x.map.get('p2').name = 'paolo';
        x.map.get('p2').surname = 'rossi';

        const s = JSON.parse(x.serialize());
        expect(s.map.p1.n).to.equal('davide');
        expect(s.map.p1.s).to.equal('canton');

        expect(s.map.p2.n).to.equal('paolo');
        expect(s.map.p2.s).to.equal('rossi');
    });

    it('should not map fields not of array type but decorated with array', () =>
    {
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
        expect(s.x).to.be.null;
    });
});
