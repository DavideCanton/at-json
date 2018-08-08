import 'reflect-metadata';

import { Constructable, IMappingOptions, JsonSerializable, MappingFn, mappingMetadataKey } from './interfaces';
import { JsonMapper } from './mapper';

/**
 * Decorator that auto-implements @see JsonSerializable interface.
 *
 * Classes must only provide a declaration for the unique interface method:
 *
 * `serialize: SerializeFn;`
 *
 * @export
 * @template T
 * @param {T} constructor
 * @returns
 */
export function JsonClass<T extends Constructable<JsonSerializable>>(constructor: T) {
    constructor.prototype.serialize = function (this: JsonSerializable) {
        return JsonMapper.serialize(this);
    };

    return constructor;
}

function normalizeParams<T, R>(params: string | MappingFn<T, R> | IMappingOptions<T, R>): IMappingOptions<T, R> {
    if (!params)
        params = {};
    if (typeof params === 'string')
        params = { name: params };
    else if (typeof params === 'function')
        params = { mappingFn: params };

    return params;
}

/**
 * Decorator for complex-type properties to be (de)serialized correctly.
 * Use this if the property is of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the property.
 * @returns the decorator for the property.
 */
export function JsonComplexProperty<T>(constructor: Constructable<T>, name: string = null) {
    const opts: IMappingOptions<any, T> = { complexType: constructor };
    if (name)
        opts.name = name;
    return Reflect.metadata(mappingMetadataKey, opts);
}

/**
 * Decorator for complex-type array properties to be (de)serialized correctly.
 * Use this if the property is an array of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the array items.
 * @returns the decorator for the property.
 */
export function JsonArrayOfComplexProperty<T>(constructor: Constructable<T>, name: string = null) {
    const opts: IMappingOptions<any, T> = { isArray: true, complexType: constructor };
    if (name)
        opts.name = name;
    return Reflect.metadata(mappingMetadataKey, opts);
}

/**
 * The basic decorator for array of simple properties. Required to enable (de)serialization of property.
 *
 * `params` has the same meaning that the one in @see JsonProperty .
 *
 * @export
 * @param {(string | MappingFn<any, any> | IMappingOptions<any, any>)} [params] the params
 * @returns the decorator for the property.
 */
export function JsonArray<T, R>(params?: string | MappingFn<T, R> | IMappingOptions<T, R>) {
    params = normalizeParams(params);
    return JsonProperty({ isArray: true, ...params });
}

/**
 * The basic decorator for simple properties. Required to enable (de)serialization of property.
 *
 * `params` can be:
 * - a string, if only the name of source property is provided (`name` property of @see IMappingOptions ).
 * - a function, if only the mapping function of property is provided (`mappingFn` property of @see IMappingOptions ).
 * - an object compliant to @see IMappingOptions interface.
 *
 * @export
 * @param {(string | MappingFn<any, any> | IMappingOptions<any, any>)} [params] the params
 * @returns the decorator for the property.
 */
export function JsonProperty<T, R>(params?: string | MappingFn<T, R> | IMappingOptions<T, R>) {
    params = normalizeParams(params);
    return Reflect.metadata(mappingMetadataKey, params);
}

/**
 * A custom decorator factory function, in order to allow defining custom reusable decorators.
 *
 * @param serializeFn the function used for serializing the value.
 * @param deserializeFn the function used for deserializing the value.
 */
export function makeCustomDecorator<T>(serializeFn: (t: T) => string, deserializeFn: (any) => T) {

    return (params?: string | IMappingOptions<any, T>) => {
        let normalizedParams;
        if (params)
            normalizedParams = normalizeParams(params);
        else
            normalizedParams = {};

        const actualParams: IMappingOptions<any, T> = { ...normalizedParams, serializeFn, mappingFn: deserializeFn };
        return Reflect.metadata(mappingMetadataKey, actualParams);
    };
}
