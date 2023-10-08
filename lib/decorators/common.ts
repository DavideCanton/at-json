import { DecoratorInput, IMappingOptions, Mapping, Symbols } from '../interfaces';
import { JsonMapper } from '../mapper';
import { defineMetadata, getMetadata } from '../reflection';

function normalizeParams(params: DecoratorInput): IMappingOptions {
    let resolvedParams: IMappingOptions;

    if (typeof params === 'string') {
        resolvedParams = { name: params };
    } else {
        resolvedParams = params || {};
    }

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
): (params?: DecoratorInput) => PropertyDecorator {
    return params => {
        let normalizedParams: IMappingOptions;
        if (params) {
            normalizedParams = normalizeParams(params);
        } else {
            normalizedParams = {};
        }

        const { serialize, deserialize } = fn(normalizedParams);

        const actualParams: IMappingOptions = {
            ...normalizedParams,
            serialize,
            deserialize,
        };

        return function (target: object, propertyKey: string | symbol) {
            const constructor = target.constructor;
            const objMetadata = getMetadata(Symbols.fieldsMetadata, constructor) || [];
            defineMetadata(Symbols.fieldsMetadata, [...objMetadata, propertyKey], constructor);
            defineMetadata(Symbols.mappingMetadata, actualParams, constructor, propertyKey);
        };
    };
}

export function mapArray<T>(
    mapper: JsonMapper,
    propertyValue: any,
    deserializeItem?: Mapping<any, T>,
    throwIfNotArray?: boolean
): T[] | null {
    if (Array.isArray(propertyValue)) {
        if (deserializeItem) {
            // map deserialize on the array
            return propertyValue.map(item => deserializeItem(mapper, item));
        } else {
            return propertyValue;
        }
    } else {
        if (throwIfNotArray) {
            throw new Error(`Expected array, got ${typeof propertyValue}`);
        }

        // if marked as array, but not an array, set the value to null
        return null;
    }
}
