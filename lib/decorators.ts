import 'reflect-metadata';

import { IJsonClassOptions } from '.';
import
{
    Constructable,
    fieldsMetadataKey,
    IMappingOptions,
    JsonSerializable,
    mappingIgnoreKey,
    mappingMetadataKey,
    MappingParams,
} from './interfaces';
import { deserializeValue, serializeValue } from './mapper';

type JsonConstructor<T> = Constructable<T & JsonSerializable>;
/**
 * Decorator that auto-implements @see JsonSerializable interface.
 *
 * @export
 * @template T
 * @returns
 * @param ignoreMissingFields
 */
export function JsonClass<T>(options?: IJsonClassOptions): <C extends JsonConstructor<T>>(ctor: C) => C
{
    const actualOptions: Required<IJsonClassOptions> = Object.assign(
        { ignoreUndecoratedProperties: true } as Required<IJsonClassOptions>,
        options
    );

    return ctor =>
    {
        Reflect.defineMetadata(mappingIgnoreKey, actualOptions.ignoreUndecoratedProperties, ctor);
        return ctor;
    };
}

function normalizeParams<T, R>(params: MappingParams<T, R> | null | undefined): IMappingOptions<T, R>
{
    let resolvedParams: IMappingOptions<T, R>;

    if (typeof params === 'string')
        resolvedParams = { name: params };
    else if (typeof params === 'function')
        resolvedParams = { mappingFn: params };
    else
        resolvedParams = params || {};

    return resolvedParams;
}

/**
 * Decorator for complex-type properties to be (de)serialized correctly.
 * Use this if the property is of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the property.
 * @param name the name of the property
 * @returns the decorator for the property.
 */
export function JsonComplexProperty<T>(constructor: Constructable<T>, name: string | null = null)
{
    const opts: IMappingOptions<any, T> = { complexType: constructor };
    if (name)
        opts.name = name;
    return wrapDecorator(Reflect.metadata(mappingMetadataKey, opts));
}

/**
 * Decorator for complex-type array properties to be (de)serialized correctly.
 * Use this if the property is an array of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the array items.
 * @param name the name of the property
 * @returns the decorator for the property.
 */
export function JsonArrayOfComplexProperty<T>(constructor: Constructable<T>, name: string | null = null)
{
    const opts: IMappingOptions<any, T> = { isArray: true, complexType: constructor };
    if (name)
        opts.name = name;
    return wrapDecorator(Reflect.metadata(mappingMetadataKey, opts));
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
export function JsonArray<T, R>(params?: MappingParams<T, R>)
{
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
export function JsonProperty<T, R>(params?: MappingParams<T, R>)
{
    params = normalizeParams(params);
    return wrapDecorator(Reflect.metadata(mappingMetadataKey, params));
}

function wrapDecorator(fn: (target: Object, propertyKey: string | symbol) => void)
{
    return function (target: Object, propertyKey: string | symbol)
    {
        const { constructor: ctor } = target;
        const objMetadata = Reflect.getMetadata(fieldsMetadataKey, ctor) || [];
        Reflect.defineMetadata(fieldsMetadataKey, [...objMetadata, propertyKey], ctor);
        return fn.call(null, ctor, propertyKey);
    };
}

/**
 * A custom decorator factory function, in order to allow defining custom reusable decorators.
 *
 * @param serializeFn the function used for serializing the value.
 * @param deserializeFn the function used for deserializing the value.
 */
export function makeCustomDecorator<T>(serializeFn: (t: T) => any, deserializeFn: (arg: any) => T)
{

    return (params?: string | IMappingOptions<any, T>) =>
    {
        let normalizedParams: IMappingOptions<any, T>;
        if (params)
            normalizedParams = normalizeParams(params);
        else
            normalizedParams = {};

        const actualParams: IMappingOptions<any, T> = {
            ...normalizedParams,
            serializeFn,
            mappingFn: deserializeFn
        };
        return wrapDecorator(Reflect.metadata(mappingMetadataKey, actualParams));
    };
}

/**
 * A custom decorator for handling objects as maps.
 *
 * @param params the mapping options to apply to the values of the map.
 */
export const JsonMap = (params?: MappingParams) =>
{
    const normalized = normalizeParams(params);

    const decoratorFactory = makeCustomDecorator(
        (map: Map<any, any>) =>
        {
            const ret = {};
            for (const [k, v] of map.entries())
                ret[k] = serializeValue(normalized, v);
            return ret;
        },
        obj =>
        {
            const map = new Map();
            for (const key in obj)
                map.set(key, deserializeValue(normalized, obj[key]));
            return map;
        }
    );

    return decoratorFactory();
};
