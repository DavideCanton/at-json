import { describe } from 'mocha';
import { expect } from 'chai';

import { JsonClass, JsonProperty, SerializeFn, JsonArrayOfComplexProperty, JsonMapper, JsonSerializable, JsonComplexProperty, JsonArray } from '../index';

@JsonClass
class Address {
  @JsonProperty()
  line1 = '';

  @JsonProperty()
  line2 = '';

  serialize: SerializeFn;
}

enum Sesso {
  M = 0, F = 1
}

@JsonClass
class Person {
  @JsonProperty()
  firstName = '';

  @JsonProperty(Person.mapLastName)
  lastName = '';

  @JsonProperty('eta')
  age = -1;

  @JsonProperty()
  sex: Sesso = Sesso.M;

  @JsonArray()
  numbers: number[] = [];

  @JsonComplexProperty(Address)
  address: Address = new Address();

  @JsonArrayOfComplexProperty(Address)
  prevAddresses: Address[] = [];

  serialize: SerializeFn;

  static mapLastName(s: string): string {
    return s.toUpperCase();
  }
}


describe('Mapper tests', () => {
  it('should deserialize', () => {
    const obj = {
      firstName: 'Piero',
      lastName: 'Gorgi',
      eta: 16,
      sex: 1,
      numbers: [1, 2, 3],
      address: {
        line1: 'a',
        line2: 'b'
      },
      prevAddresses: [
        {
          line1: 'c',
          line2: 'd'
        },
        {
          line1: 'e',
          line2: 'f'
        }
      ]
    };

    const p = JsonMapper.deserialize(Person, obj);

    expect(p).to.be.not.null;
    expect(p.address).to.be.not.null;

    expect(p instanceof Person).to.be.true;
    expect(p.address instanceof Address).to.be.true;

    expect(p.firstName).to.equal(obj.firstName);
    expect(p.lastName).to.equal(obj.lastName.toUpperCase());
    expect(p.age).to.equal(obj.eta);
    expect(p.sex).to.equal(Sesso.F);

    expect(p.numbers.length).to.equal(obj.numbers.length);

    expect(p.numbers[0]).to.equal(obj.numbers[0]);
    expect(p.numbers[1]).to.equal(obj.numbers[1]);
    expect(p.numbers[2]).to.equal(obj.numbers[2]);

    expect(p.address.line1).to.equal(obj.address.line1);
    expect(p.address.line2).to.equal(obj.address.line2);

    expect(p.prevAddresses.length).to.equal(obj.prevAddresses.length);

    expect(p.prevAddresses[0].line1).to.equal(obj.prevAddresses[0].line1);
    expect(p.prevAddresses[0].line2).to.equal(obj.prevAddresses[0].line2);

    expect(p.prevAddresses[1].line1).to.equal(obj.prevAddresses[1].line1);
    expect(p.prevAddresses[1].line2).to.equal(obj.prevAddresses[1].line2);
  });

  it('should serialize', () => {
    const obj = {
      firstName: 'Piero',
      lastName: 'Milo',
      eta: 16,
      sex: 1,
      numbers: [1, 2, 3],
      address: {
        line1: 'a',
        line2: 'b'
      },
      prevAddresses: [
        {
          line1: 'c',
          line2: 'd'
        },
        {
          line1: 'e',
          line2: 'f'
        }
      ]
    };

    const p = JsonMapper.deserialize(Person, obj);

    const s = p.serialize();

    const p2 = JsonMapper.deserialize(Person, s);

    expect(p2.firstName).to.equal(p.firstName);
    expect(p2.lastName).to.equal(p.lastName);
    expect(p2.age).to.equal(p.age);
    expect(p2.sex).to.equal(p.sex);
    expect(p2.numbers.length).to.equal(p.numbers.length);
    expect(p2.numbers[0]).to.equal(p.numbers[0]);
    expect(p2.numbers[1]).to.equal(p.numbers[1]);
    expect(p2.numbers[2]).to.equal(p.numbers[2]);
    expect(p2.address.line1).to.equal(p.address.line1);
    expect(p2.address.line2).to.equal(p.address.line2);
    expect(p2.prevAddresses.length).to.equal(p.prevAddresses.length);
    expect(p2.prevAddresses[0].line1).to.equal(p.prevAddresses[0].line1);
    expect(p2.prevAddresses[0].line2).to.equal(p.prevAddresses[0].line2);
    expect(p2.prevAddresses[1].line1).to.equal(p.prevAddresses[1].line1);
    expect(p2.prevAddresses[1].line2).to.equal(p.prevAddresses[1].line2);
  });
});
