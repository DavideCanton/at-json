import 'jest-extended';
import { makeCustomDecorator, JsonProperty, JsonClass, JsonArray, JsonComplexProperty, JsonArrayOfComplexProperty } from '../lib/decorators';
import { SerializeFn, AfterDeserialize } from '../lib/interfaces';
import { TypeHint, EnumHint, Generator, MockGenerator } from '../lib/generator';


const JsonDateProperty = makeCustomDecorator<Date>(
    d => d ? d.getFullYear().toString() : '',
    s => new Date(+s, 2, 12)
);

@JsonClass()
class Address
{
    @JsonProperty() line1: string;

    @JsonProperty() line2: string;

    serialize: SerializeFn;
}

@JsonClass()
class AddressExtended extends Address implements AfterDeserialize
{
    @JsonProperty() line3: string;

    serialize: SerializeFn;

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

@JsonClass()
class Container
{
    @JsonProperty()
    firstName: string;

    @JsonProperty(Container.mapLastName)
    lastName: string;

    @JsonProperty('eta')
    age: number;

    @JsonDateProperty()
    @TypeHint(Date)
    date: Date | null;

    @JsonDateProperty('date22')
    @TypeHint(Date)
    date2: Date | null;

    @JsonProperty()
    @EnumHint(Gender)
    gender: Gender;

    @JsonProperty()
    @EnumHint(GenderS)
    genders: GenderS;

    @JsonArray()
    @Generator(() => fns.generateArray())
    numbers: number[] = [];

    @JsonArray()
    @TypeHint(Number)
    numbers2: number[] | null;

    @JsonComplexProperty(AddressExtended, 'aa')
    address: AddressExtended;

    @JsonComplexProperty(AddressExtended)
    address2: AddressExtended;

    @JsonArrayOfComplexProperty(Address, 'prevs')
    prevAddresses: Address[] = [];

    @JsonArrayOfComplexProperty(Address)
    nextAddresses: Address[] | null;

    serialize: SerializeFn;

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

        const generated = MockGenerator.generateMock(Container);
        expect(generated.firstName).toBeString();
        expect(generated.lastName).toBeString();
        expect(generated.address).toBeInstanceOf(AddressExtended);
        expect(generated.address2).toBeInstanceOf(AddressExtended);

        expect(generated.prevAddresses).toBeArray();
        expect(generated.prevAddresses.length).toBeGreaterThan(0);
        for(const address of generated.prevAddresses)
        {
            expect(address).toBeInstanceOf(Address);
            expect(address.line1).toBeString();
            expect(address.line2).toBeString();
            expect((address as any).line3).toBeUndefined();
        }

        expect(generated.nextAddresses).toBeArray();
        expect(generated.nextAddresses!.length).toBeGreaterThan(0);
        for(const address of generated.nextAddresses!)
        {
            expect(address).toBeInstanceOf(Address);
            expect(address.line1).toBeString();
            expect(address.line2).toBeString();
            expect((address as any).line3).toBeUndefined();
        }

        expect(generated.date).toBeValidDate();
        expect(generated.date2).toBeValidDate();

        expect([Gender.M, Gender.F]).toEqual(expect.arrayContaining([generated.gender]));
        expect([GenderS.M, GenderS.F]).toEqual(expect.arrayContaining([generated.genders]));

        expect(generated.numbers).toEqual([1, 2, 3]);

        expect(generated.numbers2).toBeArray();
        expect(generated.numbers2!.length).toBeGreaterThan(0);
        for(const num of generated.numbers2!)
            expect(num).toBeNumber();

        expect(spy).toHaveBeenCalled();
    });
});
