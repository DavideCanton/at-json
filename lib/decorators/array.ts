import { DecoratorInput } from '../interfaces';
import { makeCustomDecorator, mapArray } from './common';


/**
 * The basic decorator for array of simple properties. Required to enable (de)serialization of property.
 *
 * `params` has the same meaning that the one in {@link JsonProperty}.
 *
 * @export
 * @param {DecoratorInput<T>} [params] the params
 * @param {boolean} [throwIfNotArray] if the process should throw an error if the property value is not an array
 * @returns the decorator for the property.
 */
export function JsonArray(params?: DecoratorInput, throwIfNotArray?: boolean): PropertyDecorator
{
    return makeCustomDecorator(
        opt => ({
            serialize: array => mapArray(array, opt?.serialize, throwIfNotArray),
            deserialize: array => mapArray(array, opt?.deserialize, throwIfNotArray)
        })
    )(params);
}
