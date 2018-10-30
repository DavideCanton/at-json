import * as Symbol from 'es6-symbol';

export const mappingMetadataKey = Symbol('mappingMetadataKey');
export const mappingIgnoreKey = Symbol('mappingIgnoreKey');

/**
 * Type alias for mapping function.
 */
export type MappingFn<T, R> = (val: T) => R;

/**
 * Type alias for serialize function member.
 */
export type SerializeFn = () => string;

/**
 * Interface for constructor class.
 *
 * @export
 * @interface Constructable
 * @template T the constructed type
 */
export interface Constructable<T> {
    new(...args: any[]): T;
}

/**
 * Interface for serializable object. Auto-implemented by @see JsonClass Decorator.
 *
 * @export
 * @interface JsonSerializable
 */
export interface JsonSerializable {
    serialize(): string;
}


export interface AfterDeserialize {
    afterDeserialize(): void;
}

/**
 * Mapping options.
 *
 * @export
 * @interface IMappingOptions
 * @template T the source type of mapping
 * @template R the destination type of mapping
 */
export interface IMappingOptions<T, R> {
    /**
     * Property name.
     *
     * @type {string}
     * @memberof IMappingOptions
     */
    name?: string;

    /**
     * Deserialization function.
     *
     * @type {MappingFn<T, R>}
     * @memberof IMappingOptions
     */
    mappingFn?: MappingFn<T, R>;

    /**
     * Serialization function.
     *
     * @type {MappingFn<T, string>}
     * @memberof IMappingOptions
     */
    serializeFn?: MappingFn<T, string>;

    /**
     * Complex type constructor for complex properties.
     *
     * @type {Constructable<R>}
     * @memberof IMappingOptions
     */
    complexType?: Constructable<R>;

    /**
     * If the property is an array.
     *
     * @type {boolean}
     * @memberof IMappingOptions
     */
    isArray?: boolean;

    /**
     * If the property is an array, by default null arrays will be deserialized as [].
     *
     * Use this property to keep null value.
     *
     * Unused if isArray is false.
     *
     * @type {boolean}
     * @memberof IMappingOptions
    */
    keepNullArray?: boolean;
}
