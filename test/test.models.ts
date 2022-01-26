import { AfterDeserialize, JsonArray, JsonArrayOfComplexProperty, JsonClass, JsonComplexProperty, JsonProperty } from '../lib';
import { JsonDateProperty } from './test-utils';

export enum Gender
{
    M = 0, F = 1
}

@JsonClass({ ignoreUndecoratedProperties: true })
export class Address
{
    @JsonProperty() line1: string;

    @JsonProperty() line2: string;
}

@JsonClass({ ignoreUndecoratedProperties: false })
export class AddressExtended extends Address implements AfterDeserialize
{
    [other: string]: any;
    
    line3: string;

    afterDeserialize() { }
}

@JsonClass()
export class Person
{
    @JsonProperty()
    firstName: string;

    @JsonProperty(Person.mapLastName)
    lastName: string;

    @JsonProperty('eta')
    age: number;

    @JsonDateProperty()
    date: Date | null;

    @JsonDateProperty('date22')
    date2: Date | null;

    @JsonProperty()
    gender: Gender;

    @JsonArray()
    numbers: number[] = [];

    @JsonArray()
    numbers2: number[] | null;

    @JsonComplexProperty(AddressExtended, 'aa')
    address: AddressExtended;

    @JsonComplexProperty(AddressExtended)
    address2: AddressExtended;

    @JsonArrayOfComplexProperty(Address, 'prevs')
    prevAddresses: Address[] = [];

    @JsonArrayOfComplexProperty(Address)
    nextAddresses: Address[] | null;

    static mapLastName(s: string): string
    {
        return s.toUpperCase();
    }
}


