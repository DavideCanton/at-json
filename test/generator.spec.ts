import 'mocha';

import { expect, spy, use } from 'chai';
import * as spies from 'chai-spies';

import * as atJ from '../lib';

use(spies);

const JsonDateProperty = atJ.makeCustomDecorator<Date>(
    d => d ? d.getFullYear().toString() : '',
    s => new Date(+s, 2, 12)
);

@atJ.JsonClass()
class Address
{
    @atJ.JsonProperty() line1: string;

    @atJ.JsonProperty() line2: string;

    serialize: atJ.SerializeFn;
}

@atJ.JsonClass()
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

enum GenderS
{
    M = 'M', F = 'F'
}

const fns = {
    generateArray: () =>
    {
        return [1, 2, 3];
    }
};

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
    @atJ.TypeHint(Date)
    date: Date | null;

    @JsonDateProperty('date22')
    @atJ.TypeHint(Date)
    date2: Date | null;

    @atJ.JsonProperty()
    @atJ.EnumHint<Gender>(Gender)
    gender: Gender;

    @atJ.JsonProperty()
    @atJ.EnumHint<GenderS>(GenderS)
    genders: GenderS;

    @atJ.JsonArray()
    @atJ.Generator(fns.generateArray)
    numbers: number[] = [];

    @atJ.JsonArray()
    @atJ.TypeHint(Number)
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


describe('Generator tests', () =>
{
    it('should generate', () =>
    {
        const s = spy.on(fns, 'generateArray');

        const generated = atJ.MockGenerator.generateMock(Person);
        expect(generated.firstName).to.be.a('string');
        expect(generated.lastName).to.be.a('string');
        expect(generated.address).to.be.an.instanceOf(AddressExtended);
        expect(generated.address2).to.be.an.instanceOf(AddressExtended);

        expect(generated.prevAddresses).to.be.an.instanceOf(Array);
        for(const a of generated.prevAddresses)
        {
            expect(a).to.be.an.instanceOf(Address);
            expect(a.line1).to.be.a('string');
            expect(a.line2).to.be.a('string');
            expect((a as any).line3).to.be.undefined;
        }

        expect(generated.nextAddresses).to.be.an.instanceOf(Array);
        for(const a of generated.nextAddresses!)
        {
            expect(a).to.be.an.instanceOf(Address);
            expect(a.line1).to.be.a('string');
            expect(a.line2).to.be.a('string');
            expect((a as any).line3).to.be.undefined;
        }

        expect(generated.date).to.be.an.instanceOf(Date);
        expect(generated.date2).to.be.an.instanceOf(Date);

        expect([Gender.M, Gender.F]).to.include(generated.gender);
        expect([GenderS.M, GenderS.F]).to.include(generated.genders);

        expect(generated.numbers).to.be.an.instanceOf(Array);
        for(const a of generated.numbers)
            expect(a).to.be.a('number');

        expect(generated.numbers2).to.be.an.instanceOf(Array);
        for(const a of generated.numbers2!)
            expect(a).to.be.a('number');

        expect(s).to.have.been.called();
    });


});
