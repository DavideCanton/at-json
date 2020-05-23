import * as atJ from '../lib';
import 'jest-extended';

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
    generateArray()
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
    @atJ.Generator(() => fns.generateArray())
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
        const spy = jest.spyOn(fns, 'generateArray');

        const generated = atJ.MockGenerator.generateMock(Person);
        expect(generated.firstName).toBeString();
        expect(generated.lastName).toBeString();
        expect(generated.address).toBeInstanceOf(AddressExtended);
        expect(generated.address2).toBeInstanceOf(AddressExtended);

        expect(generated.prevAddresses).toBeArray();
        expect(generated.prevAddresses.length).toBeGreaterThan(0);
        for(const a of generated.prevAddresses)
        {
            expect(a).toBeInstanceOf(Address);
            expect(a.line1).toBeString();
            expect(a.line2).toBeString();
            expect((a as any).line3).toBeUndefined();
        }

        expect(generated.nextAddresses).toBeArray();
        expect(generated.nextAddresses!.length).toBeGreaterThan(0);
        for(const a of generated.nextAddresses!)
        {
            expect(a).toBeInstanceOf(Address);
            expect(a.line1).toBeString();
            expect(a.line2).toBeString();
            expect((a as any).line3).toBeUndefined();
        }

        expect(generated.date).toBeValidDate();
        expect(generated.date2).toBeValidDate();

        expect([Gender.M, Gender.F]).toEqual(expect.arrayContaining([generated.gender]));
        expect([GenderS.M, GenderS.F]).toEqual(expect.arrayContaining([generated.genders]));

        expect(generated.numbers).toEqual([1, 2, 3]);

        expect(generated.numbers2).toBeArray();
        expect(generated.numbers2!.length).toBeGreaterThan(0);
        for(const a of generated.numbers2!)
            expect(a).toBeNumber();

        expect(spy).toHaveBeenCalled();
    });
});
