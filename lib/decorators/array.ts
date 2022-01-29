import { MappingParams } from '../interfaces';
import { normalizeParams } from './common';
import { JsonProperty } from './property';


/**
 * The basic decorator for array of simple properties. Required to enable (de)serialization of property.
 *
 * `params` has the same meaning that the one in {@link JsonProperty}.
 *
 * @export
 * @param {(string | MappingFn<any, any> | IMappingOptions<any, any>)} [params] the params
 * @returns the decorator for the property.
 */
export function JsonArray<T, R>(params?: MappingParams<T, R>)
{
    params = normalizeParams(params);
    return JsonProperty({ isArray: true, ...params });
}
