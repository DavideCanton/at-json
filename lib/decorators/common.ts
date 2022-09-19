import { DecoratorInput, fieldsMetadataKey, IMappingOptions, mappingMetadataKey } from '../interfaces';


export function normalizeParams(params: DecoratorInput): IMappingOptions
{
    let resolvedParams: IMappingOptions;

    if (typeof params === 'string')
        resolvedParams = { name: params };
    else
        resolvedParams = params || {};

    return resolvedParams;
}


export type CustomDecoratorFunctions = NonNullable<Pick<IMappingOptions, 'serialize' | 'deserialize'>>;

/**
 * A custom decorator factory function, in order to allow defining custom reusable decorators.
 *
 * @param serializeFn the function used for serializing the value.
 * @param deserializeFn the function used for deserializing the value.
 */
export function makeCustomDecorator(
    fn: (opt: IMappingOptions) => CustomDecoratorFunctions
): (params?: DecoratorInput) => PropertyDecorator
{
    return params =>
    {
        let normalizedParams: IMappingOptions;
        if (params)
            normalizedParams = normalizeParams(params);
        else
            normalizedParams = {};

        const { serialize, deserialize } = fn(normalizedParams);

        const actualParams: IMappingOptions = {
            ...normalizedParams,
            serialize,
            deserialize
        };

        // eslint-disable-next-line @typescript-eslint/ban-types
        return function (target: Object, propertyKey: string | symbol)
        {
            const { constructor: ctor } = target;
            const objMetadata = Reflect.getMetadata(fieldsMetadataKey, ctor) || [];
            Reflect.defineMetadata(fieldsMetadataKey, [...objMetadata, propertyKey], ctor);
            return Reflect.metadata(mappingMetadataKey, actualParams)(ctor, propertyKey);
        };
    };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
