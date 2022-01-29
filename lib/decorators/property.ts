import { mappingMetadataKey, MappingParams } from '../interfaces';
import { normalizeParams, wrapDecorator } from './common';

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
export function JsonProperty<T, R>(params?: MappingParams<T, R>)
{
    params = normalizeParams(params);
    return wrapDecorator(Reflect.metadata(mappingMetadataKey, params));
}
