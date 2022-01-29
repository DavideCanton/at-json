import { DecoratorInput } from '../interfaces';
import { makeCustomDecorator } from './common';

/**
 * The basic decorator for simple properties. Required to enable (de)serialization of property.
 *
 * `params` can be:
 * - a string, if only the name of source property is provided (`name` property of {@link IMappingOptions}).
 * - a function, if only the mapping function of property is provided (`mappingFn` property of {@link IMappingOptions}).
 * - an object compliant to {@link IMappingOptions} interface.
 *
 * @export
 * @param {(string | MappingFn<any, any> | IMappingOptions<any, any>)} [params] the params
 * @returns the decorator for the property.
 */
export function JsonProperty<T>(params?: DecoratorInput<T>): PropertyDecorator
{
    const identity = (v: any) => v;
    return makeCustomDecorator<T>(
        opt => ({
            serializeFn: opt?.serializeFn ?? identity,
            deserializeFn: opt?.mappingFn ?? identity,
        })
    )(params);
}
