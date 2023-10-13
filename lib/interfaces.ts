import { JsonMapper } from './mapper';

export const Symbols = {
    mappingMetadata: Symbol('[[mapping]]'),
    mappingOptions: Symbol('[[mappingOptions]]'),
    fieldsMetadata: Symbol('[[fields]]'),
    metadataRoot: Symbol('[[AtJsonMetadata]]'),
};
Object.freeze(Symbols);

/**
 * Type alias for a mapping function.
 */
export type Mapping<T = any, R = any> = (mapper: JsonMapper, val: T) => R;

/**
 * Interface for constructor class.
 *
 * @export
 * @interface Constructable
 * @template T the constructed type
 */
export type Constructable<T, Args extends any[] = any[]> = new (...args: Args) => T;

/**
 * Interface for classes that want to apply a custom serialization logic.
 * If a class implements this interface, its {@link customSerialize}
 * method will be called instead of the default serialization logic.
 * It is the responsibility of the implementation to recursively serialize
 * nested objects.
 */
export interface CustomSerialize {
    /**
     * Custom serialization logic.
     */
    customSerialize(mapper: JsonMapper): any;
}

/**
 * Interface for classes that want to apply an additional deserialization logic
 * after default deserialization.
 * If a class implements this interface, its {@link afterDeserialize}
 * method will be called after the deserialization.
 */
export interface AfterDeserialize {
    /**
     * Additional deserialization logic.
     */
    afterDeserialize(): void;
}

/**
 * Type guard for {@link CustomSerialize} interface.
 *
 * @param mapValue value to check
 * @returns if the parameter is a CustomSerialize interface
 */
export function hasCustomSerializeExport(mapValue: any): mapValue is CustomSerialize {
    const fn = mapValue[nameOf<CustomSerialize>('customSerialize')];
    return typeof fn === 'function';
}

/**
 * Type guard for {@link AfterDeserialize} interface.
 *
 * @param mapValue value to check
 * @returns if the parameter is a AfterDeserialize interface
 */
export function hasAfterDeserialize(mapValue: any): mapValue is AfterDeserialize {
    const fn = mapValue[nameOf<AfterDeserialize>('afterDeserialize')];
    return typeof fn === 'function';
}

/**
 * Mapping functions.
 *
 * @export
 * @interface IMappingFunctions
 * @template S the type of the deserialized property
 * @template D the type of the serialized property
 */
export interface IMappingFunctionsOpt<S = any, D = any> {
    /**
     * Custom deserialization function.
     *
     * @type {Mapping}
     * @memberof IMappingOptions
     */
    deserialize?: Mapping<S, D>;

    /**
     * Custom serialization function.
     *
     * @type {Mapping}
     * @memberof IMappingOptions
     */
    serialize?: Mapping<D, S>;
}

/**
 * Mapping extra options.
 *
 * @export
 * @interface IMappingOptionsExtra
 */
export interface IMappingOptionsExtra {
    /**
     * Property name.
     * If specified, the serialize process will convert the class property name to this value, and
     * the deserialize process will convert the other way.
     *
     * @type {string}
     * @memberof IMappingOptions
     */
    name?: string;
}

export type IMappingOptions<S = any, D = any> = IMappingFunctionsOpt<S, D> & IMappingOptionsExtra;

type _DecInput<T> = string | T | undefined;
/**
 * Decorator input for decorators that support custom serialize/deserialize functions.
 */
export type DecoratorInputWithCustomFunctions<S = any, D = any> = _DecInput<IMappingOptions<S, D>>;
/**
 * Decorator input for decorators that don't support custom serialize/deserialize functions.
 */
export type DecoratorInputWithoutCustomFunctions = _DecInput<IMappingOptionsExtra>;

/** helper */
function nameOf<T>(k: keyof T): string {
    return k as string;
}
