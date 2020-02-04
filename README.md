# at-json

[![Build Status](https://travis-ci.org/DavideCanton/at-json.svg?branch=master)](https://travis-ci.org/DavideCanton/at-json)

A declarative mapper to and from JSON.

## Installation

```bash
npm install at-json
```

## Usage

```typescript
import { JsonClass, JsonProperty, JsonArray, JsonComplexProperty, SerializeFn, JsonMapper } from 'at-json';

@JsonClass()
class Payload {
    // maps a "name" property to the field
    @JsonProperty() name: string;
    // maps a "SN" property to the field "surname"
    @JsonProperty('SN') surname: string;
    // maps an array of numbers named "numbers" to the field
    @JsonArray() numbers: number[];
    // maps a complex type recursively
    @JsonComplexProperty(C1) c1: C1;

    // needed to typecheck
    serialize: SerializeFn;
}

@JsonClass()
class C1 {
    // other mappings
    @JsonProperty() x: number;
    @JsonProperty() y: number;

    // needed to typecheck
    serialize: SerializeFn;
}

// ...
const payloadObject = {
    name: 'name',
    SN: 'surname',
    numbers: [1,2,3],
    c1: {
        x: 10,
        y: 20
    }
};

// you can deserialize objects, or JSON strings too!
const mapped = JsonMapper.deserialize(Payload, payloadObject);
const mappedFromString = JsonMapper.deserialize(Payload, JSON.serialize(payloadObject));

// mapped is a Payload instance
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)