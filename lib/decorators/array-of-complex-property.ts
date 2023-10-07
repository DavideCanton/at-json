import {
    Constructable,
    JsonSerializable,
    NoCustomFunctionsDecoratorInput,
} from '../interfaces';
import { JsonMapper } from '../mapper';
import { makeCustomDecorator, mapArray } from './common';

/**
 * Decorator for complex-type array properties to be (de)serialized correctly.
 * Use this if the property is an array of a type that needs recursive (de)serialization.
 *
 * Usage examples:
 * ```typescript
 * import {
 *  JsonClass,
 *  JsonMapper,
 *  JsonProperty,
 *  JsonArrayOfComplexProperty
 * } from '@mdcc/at-json';
 *
 * @JsonClass()
 * class SubClass
 * {
 *   @JsonProperty()
 *   foo: string;
 * }
 *
 * @JsonClass()
 * class MyClass
 * {
 *    @JsonArrayOfComplexProperty(SubClass)
 *    sub1: SubClass[];
 *
 *    @JsonArrayOfComplexProperty(SubClass, 'extSub2', true)
 *    sub2: SubClass[];
 * }
 *
 * const backendObject = {
 *   sub1: [{ foo: 'bar' }],
 *   extSub2: [{ foo: 'baz' }]
 * };
 * const deserialized = JsonMapper.deserialize<MyClass>(MyClass, backendObject);
 *
 * // sub1 keeps the same name
 * assert.isInstanceOf(deserialized.sub1, Array);
 * assert.isInstanceOf(deserialized.sub1[0], SubClass);
 * assert.equal(deserialized.sub1[0].foo, 'bar');
 *
 * // extSub2 became sub2
 * assert.isInstanceOf(deserialized.sub2, Array);
 * assert.isInstanceOf(deserialized.sub2[0], SubClass);
 * assert.equal(deserialized.sub2[0].foo, 'baz');
 *
 * const backendObjectSerialized = JsonMapper.serialize(deserialized);
 * // reverse conversion was performed
 * assert.deepEqual(backendObjectSerialized, backendObject);
 *
 * const errorObject = { sub1: {} };
 * const deserializedErrorObject = JsonMapper.deserialize<MyClass>(MyClass, errorObject);
 * // sub1 is null
 * assert.isNull(deserializedErrorObject.sub1);
 *
 * const errorObject2 = { sub1: [], sub2: {} };
 * // this throws because sub2 was decorated with `@JsonArrayOfComplexProperty(..., true)`
 * const deserializedErrorObject2 = JsonMapper.deserialize<MyClass>(MyClass, errorObject2);
 * ```
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the array items.
 * @param {NoCustomFunctionsDecoratorInput} params params
 * @param {boolean} throwIfNotArray if true, throws an error if the property is not an array.
 * @returns the decorator for the property.
 */
export function JsonArrayOfComplexProperty<T extends JsonSerializable>(
    constructor: Constructable<T>,
    params?: NoCustomFunctionsDecoratorInput,
    throwIfNotArray?: boolean
): PropertyDecorator {
    return makeCustomDecorator(() => ({
        serialize: (array: any) =>
            mapArray<T>(
                array,
                item => JsonMapper.serialize(item),
                throwIfNotArray
            ),
        deserialize: (array: any) =>
            mapArray<T>(
                array,
                item =>
                    item === null || item === undefined
                        ? item
                        : JsonMapper.deserialize(constructor, item),
                throwIfNotArray
            ),
    }))(params);
}
