import { IMappingFunctionsOpt, IMappingOptions, IMappingOptionsExtra, Mapping, Symbols } from '../interfaces';
import { JsonMapper } from '../mapper';
import { defineMetadata, getMetadata } from '../reflection';

function normalizeParams(params?: string | IMappingOptionsExtra | undefined): IMappingOptions {
    let resolvedParams: IMappingOptions;

    if (typeof params === 'string') {
        resolvedParams = { name: params };
    } else {
        resolvedParams = params || {};
    }

    return resolvedParams;
}

/**
 * A custom decorator factory function, in order to allow defining custom reusable decorators.
 *
 * @param serializeFn the function used for serializing the value.
 * @param deserializeFn the function used for deserializing the value.
 */
export function makeCustomDecorator<S = any, D = any>(
    fn: () => IMappingFunctionsOpt<S, D>
): (params?: string | IMappingOptionsExtra | undefined) => PropertyDecorator {
    return params => {
        const actualParams: IMappingOptions = {
            ...normalizeParams(params),
            ...fn(),
        };
        return _createPropertyDecorator(actualParams);
    };
}

/**
 * A decorator transforming function, used internally.
 */
export function transformDecorator<S = any, D = any>(
    fn: (opt: IMappingFunctionsOpt<S, D>) => IMappingFunctionsOpt<S, D>
): (params?: string | IMappingOptionsExtra | undefined) => PropertyDecorator {
    return params => {
        const normalizedParams = normalizeParams(params);
        const { serialize, deserialize } = fn(normalizedParams);

        const actualParams: IMappingOptions = {
            ...normalizedParams,
            serialize,
            deserialize,
        };
        return _createPropertyDecorator(actualParams);
    };
}

function _createPropertyDecorator(actualParams: IMappingOptions): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const constructor = target.constructor;
        const objMetadata = getMetadata(Symbols.fieldsMetadata, constructor) || [];
        defineMetadata(Symbols.fieldsMetadata, [...objMetadata, propertyKey], constructor);
        defineMetadata(Symbols.mappingMetadata, actualParams, constructor, propertyKey);
    };
}

export function mapArray<D, S = any>(
    mapper: JsonMapper,
    propertyValue: S,
    deserializeItem?: Mapping<S, D>,
    throwIfNotArray?: boolean
): D[] | null {
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
