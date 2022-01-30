import { DecoratorInput, fieldsMetadataKey, IMappingOptions, mappingMetadataKey } from '../interfaces';


export function normalizeParams<T>(params: DecoratorInput<T>): IMappingOptions<T>
{
    let resolvedParams: IMappingOptions<T>;

    if (typeof params === 'string')
        resolvedParams = { name: params };
    else
        resolvedParams = params || {};

    return resolvedParams;
}


export type CustomDecoratorFunctions<T> = NonNullable<Pick<IMappingOptions<T>, 'serialize' | 'deserialize'>>;

/**
 * A custom decorator factory function, in order to allow defining custom reusable decorators.
 *
 * @param serializeFn the function used for serializing the value.
 * @param deserializeFn the function used for deserializing the value.
 */
export function makeCustomDecorator<T>(
    fn: (opt: IMappingOptions<T>) => CustomDecoratorFunctions<T>
): (params?: DecoratorInput<T>) => PropertyDecorator
{
    return params =>
    {
        let normalizedParams: IMappingOptions<T>;
        if (params)
            normalizedParams = normalizeParams(params);
        else
            normalizedParams = {};

        const { serialize: serializeFn, deserialize: deserializeFn } = fn(normalizedParams);

        const actualParams: IMappingOptions<any, T> = {
            ...normalizedParams,
            serialize: serializeFn,
            deserialize: deserializeFn
        };

        return function (target: Object, propertyKey: string | symbol)
        {
            const { constructor: ctor } = target;
            const objMetadata = Reflect.getMetadata(fieldsMetadataKey, ctor) || [];
            Reflect.defineMetadata(fieldsMetadataKey, [...objMetadata, propertyKey], ctor);
            return Reflect.metadata(mappingMetadataKey, actualParams)(ctor, propertyKey);
        };
    };
}

export function mapArray<T>(propertyValue: any, deserializeItem?: (t: T) => any, throwIfNotArray?: boolean): T[] | null
{
    if (Array.isArray(propertyValue))
    {
        // map deserialize on the array
        return propertyValue.map(item => deserializeItem ? deserializeItem(item) : item);
    }
    else
    {
        if (throwIfNotArray)
            throw new Error(`Expected array, got ${typeof propertyValue}`);

        // if marked as array, but not an array, set the value to null
        return null;
    }
}
