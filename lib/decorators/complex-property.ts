import { Constructable, JsonSerializable, NoCustomFunctionsDecoratorInput } from '../interfaces';
import { JsonMapper } from '../mapper';
import { makeCustomDecorator } from './common';

/**
 * Decorator for complex-type properties to be (de)serialized correctly.
 * Use this if the property is of a non-array type that needs recursive (de)serialization.
 *
 * Uses only the `name` property of the params.
 *
 * Usage examples:
 * ```typescript
 * import { JsonClass, JsonMapper, JsonProperty, JsonComplexProperty } from '@mdcc/at-json';
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
 *    @JsonComplexProperty(SubClass)
 *    sub1: SubClass;
 *
 *    @JsonComplexProperty(SubClass, 'extSub2')
 *    sub2: SubClass;
 * }
 *
 * const backendObject = {
 *   sub1: { foo: 'bar' },
 *   extSub2: { foo: 'baz' }
 * };
 * const deserialized = JsonMapper.deserialize<MyClass>(MyClass, backendObject);
 *
 * // sub1 keeps the same name
 * assert.isInstanceOf(deserialized.sub1, SubClass);
 * assert.equal(deserialized.sub1.foo, 'bar');
 *
 * // extSub2 became sub2
 * assert.isInstanceOf(deserialized.sub2, SubClass);
 * assert.equal(deserialized.sub2.foo, 'baz');
 *
 * const backendObjectSerialized = JsonMapper.serialize(deserialized);
 * // reverse conversion was performed
 * assert.deepEqual(backendObjectSerialized, backendObject);
 * ```
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the property.
 * @param name the name of the property
 * @returns the decorator for the property.
 */
export function JsonComplexProperty<T extends JsonSerializable>(constructor: Constructable<T>, params?: NoCustomFunctionsDecoratorInput): PropertyDecorator
{
    return makeCustomDecorator(
        () => ({
            serialize: (value: T) => JsonMapper.serialize(value),
            // eslint-disable-next-line @typescript-eslint/ban-types
            deserialize: (value: string | object) => JsonMapper.deserialize<T>(constructor, value)
        })
    )(params);
}
