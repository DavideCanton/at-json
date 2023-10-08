import { DecoratorInput } from '../interfaces';
import { JsonMapper } from '../mapper';
import { makeCustomDecorator, mapArray } from './common';

/**
 * The basic decorator for array of simple properties.
 *
 * `params` has the same meaning that the one in {@link JsonProperty}.
 *
 * Usage examples:
 * ```typescript
 * import { JsonClass, JsonMapper, JsonArray } from '@mdcc/at-json';
 *
 * @JsonClass()
 * class MyClass
 * {
 *    @JsonArray()
 *    basicProperty: string[];
 *
 *    @JsonArray('extName')
 *    renamedProperty: number[];
 *
 *    @JsonArray({
 *      name: 'custom',
 *      serialize: (mapper, n) => n.toString(),
 *      deserialize: (mapper, n) => parseInt(n, 10)
 *    }, true)
 *    customProperty: number[];
 * }
 *
 * const backendObject = {
 *   basicProperty: ['value', 'value2'],
 *   extName: [123, 456],
 *   customProperty: ['456', '789']
 * };
 * const mapper = new JsonMapper();
 * const deserialized = mapper.deserialize<MyClass>(MyClass, backendObject);
 *
 * // basicProperty keeps the same name
 * assert.equal(deserialized.basicProperty, ['value', 'value2']);
 * // extName became renamedProperty
 * assert.equal(deserialized.renamedProperty, [123, 456]);
 * // customProperty became custom, and the string was converted to number
 * assert.equal(deserialized.custom, [456, 789]);
 *
 * const backendObjectSerialized = mapper.serialize(deserialized);
 * // reverse conversion was performed
 * assert.deepEqual(backendObjectSerialized, backendObject);
 *
 * const errorObject = { basicProperty: {} };
 * const deserializedErrorObject = mapper.deserialize<MyClass>(MyClass, errorObject);
 * // basicProperty is null
 * assert.isNull(deserializedErrorObject.basicProperty);
 *
 * const errorObject2 = { basicProperty: [], renamedProperty: [], customProperty: {} };
 * // this throws because customProperty was decorated with `@JsonArray(..., true)`
 * const deserializedErrorObject2 = mapper.deserialize<MyClass>(MyClass, errorObject2);

 * ```
 *
 * @export
 * @param {DecoratorInput<T>} [params] the params
 * @param {NoCustomFunctionsDecoratorInput} params params
 * @param {boolean} throwIfNotArray if true, throws an error if the property is not an array.
 * @returns the decorator for the property.
 */
export function JsonArray(params?: DecoratorInput, throwIfNotArray?: boolean): PropertyDecorator {
    if (typeof params === 'object' && !!params.serialize !== !!params.deserialize) {
        throw new Error('serialize and deserialize must be defined together');
    }

    return makeCustomDecorator(opt => ({
        serialize: (mapper: JsonMapper, array) => mapArray(mapper, array, opt?.serialize, throwIfNotArray),
        deserialize: (mapper: JsonMapper, array) => mapArray(mapper, array, opt?.deserialize, throwIfNotArray),
    }))(params);
}
