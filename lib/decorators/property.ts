import { DecoratorInput } from '../interfaces';
import { JsonMapper } from '../mapper';
import { makeCustomDecorator } from './common';

export function _IDENTITY_FUNCTION<T>(_mapper: JsonMapper, v: T): T {
    return v;
}

/**
 * The basic decorator for simple properties.
 *
 * It basically takes the incoming property value, applies eventual custom serialization or deserialization,
 * and then sets the property value to the result.
 *
 * `params` can be:
 * - a string, if only the name of source property is provided (`name` property of {@link IMappingOptions}).
 * - an object compliant to {@link IMappingOptions} interface.
 *
 * Usage examples:
 * ```typescript
 * import { JsonClass, JsonMapper, JsonProperty } from '@mdcc/at-json';
 *
 * @JsonClass()
 * class MyClass
 * {
 *    @JsonProperty()
 *    basicProperty: string;
 *
 *    @JsonProperty('extName')
 *    renamedProperty: number;
 *
 *    @JsonProperty({
 *      name: 'custom',
 *      serialize: (mapper, n) => n.toString(),
 *      deserialize: (mapper, n) => parseInt(n, 10)
 *    })
 *    customProperty: number;
 * }
 *
 * const mapper = new JsonMapper();
 * const backendObject = { basicProperty: 'value', extName: 123, customProperty: '456' };
 * const deserialized = mapper.deserialize<MyClass>(MyClass, backendObject);
 *
 * // basicProperty keeps the same name
 * assert.equal(deserialized.basicProperty, 'value');
 * // extName became renamedProperty
 * assert.equal(deserialized.renamedProperty, 123);
 * // customProperty became custom, and the string was converted to number
 * assert.equal(deserialized.custom, 456);
 *
 * const backendObjectSerialized = mapper.serialize(deserialized);
 * // reverse conversion was performed
 * assert.deepEqual(backendObjectSerialized, backendObject);
 * ```
 *
 * @export
 * @param {DecoratorInput} [params] the params
 * @returns the decorator for the property.
 */
export function JsonProperty(params?: DecoratorInput): PropertyDecorator {
    return makeCustomDecorator(opt => ({
        serialize: opt?.serialize ?? _IDENTITY_FUNCTION,
        deserialize: opt?.deserialize ?? _IDENTITY_FUNCTION,
    }))(params);
}
