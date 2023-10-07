# at-json

[![Build Status](https://github.com/DavideCanton/at-json/actions/workflows/main.yml/badge.svg)](https://github.com/DavideCanton/at-json/actions/workflows/main.yml)

A declarative mapper to and from JSON.

## Installation

```bash
npm install @mdcc/at-json
```

## Usage

```typescript
import { JsonClass, JsonProperty, JsonArray, JsonComplexProperty, JsonMapper } from '@mdcc/at-json';

@JsonClass()
class Payload {
    // maps a "name" property to the field
    @JsonProperty() name: string;
    // maps a "SN" property to the field "surname"
    @JsonProperty('SN') surname: string;
    // maps an array of numbers named "numbers" to the field
    @JsonArray() numbers: number[];
    // maps a complex type recursively
    @JsonComplexProperty(SubClass) sub: SubClass;
}

@JsonClass()
class SubClass {
    // other mappings
    @JsonProperty() x: number;
    @JsonProperty() y: number;

    get norm(): double {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

// ...
const payloadObject = {
    name: 'name',
    SN: 'surname',
    numbers: [1, 2, 3],
    sub: {
        x: 1,
        y: 2,
    },
};

// you can deserialize objects, or JSON strings too!
const mapped = JsonMapper.deserialize(Payload, payloadObject);
const mappedFromString = JsonMapper.deserialize(Payload, JSON.stringify(payloadObject));

// mapped is a Payload instance
expect(mapped instanceof Payload).toBe(true);

// fields are deserialized accordingly to the names specified in decorators
expect(mapped.name).toBe('name');
expect(mapped.surname).toBe('surname');

// mapped.sub is a SubClass instance
expect(mapped.sub instanceof SubClass).toBe(true);
expect(mapped.sub.norm).toBe(Math.sqrt(5));
```

## Documentation

Documentation can be found [here](https://davidecanton.github.io/at-json/).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
