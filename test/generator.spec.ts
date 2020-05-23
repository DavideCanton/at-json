import 'mocha';

import { expect, spy, use } from 'chai';
import * as spies from 'chai-spies';

import * as atJ from '../lib';
import { MockGenerator } from '../lib';

use(spies);

const JsonDateProperty = atJ.makeCustomDecorator<Date>(
    d => d ? d.getFullYear().toString() : '',
    s => new Date(+s, 2, 12)
);

function dateEquals(d: Date | null | undefined, d2: Date | null | undefined): boolean
{
    if (d === d2) return true;

    if (!d || !d2) return false;

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


describe('Generator tests', () =>
{
    it('should generate', () =>
    {
        const generated = MockGenerator.generateMock(Person);
        console.log(generated);
    });


});
