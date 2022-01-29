import { fieldsMetadataKey, IMappingOptions, mappingMetadataKey, MappingParams } from '../interfaces';

export function wrapDecorator(fn: (target: Object, propertyKey: string | symbol) => void)
{
    return function (target: Object, propertyKey: string | symbol)
    {
        const { constructor: ctor } = target;
        const objMetadata = Reflect.getMetadata(fieldsMetadataKey, ctor) || [];
        Reflect.defineMetadata(fieldsMetadataKey, [...objMetadata, propertyKey], ctor);
        return fn.call(null, ctor, propertyKey);
    };
}


export function normalizeParams<T, R>(params: MappingParams<T, R> | null | undefined): IMappingOptions<T, R>
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

