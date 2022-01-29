import { DecoratorInput } from '../interfaces';
import { makeCustomDecorator, mapArray } from './common';


/**
 * The basic decorator for array of simple properties. Required to enable (de)serialization of property.
 *
 * `params` has the same meaning that the one in {@link JsonProperty}.
 *
 * @export
 * @param {(string | MappingFn<any, any> | IMappingOptions<any, any>)} [params] the params
 * @returns the decorator for the property.
 */
export function JsonArray<T>(params?: DecoratorInput<T>, throwIfNotArray?: boolean): PropertyDecorator
{
    return makeCustomDecorator<T>(
        opt => ({
            serializeFn: array => mapArray(array, opt?.serializeFn, throwIfNotArray),
            deserializeFn: array => mapArray(array, opt?.mappingFn, throwIfNotArray)
        })
    )(params);
}
