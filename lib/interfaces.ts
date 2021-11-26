export const mappingMetadataKey = Symbol('mappingMetadataKey');
export const mappingIgnoreKey = Symbol('mappingIgnoreKey');
export const fieldsMetadataKey = Symbol('fieldsMetadataKey');

export type MappingParams<T = any, R = any> = string | MappingFn<T, R> | IMappingOptions<T, R>;

/**
 * Type alias for mapping function.
 */
export type MappingFn<T = any, R = any> = (val: T) => R;

/**
 * Interface for constructor class.
 *
 * @export
 * @interface Constructable
 * @template T the constructed type
 */
export type Constructable<T> = new (...args: any[]) => T;

/**
 * Interface for serializable object. Auto-implemented by @see JsonClass Decorator.
 *
 * @export
 * @interface JsonSerializable
 */
export interface JsonSerializable
{
}

export interface CustomSerialize
{
    customSerialize(): any;
}

export interface AfterDeserialize
{
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
export interface IMappingOptions<T = any, R = any>
{
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
     * @type {MappingFn<T, any>}
     * @memberof IMappingOptions
     */
    serializeFn?: MappingFn<T, any>;

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
     * If the property is a map.
     *
     * @type {boolean}
     * @memberof IMappingOptions
     */
    isMap?: boolean;
}

export interface IJsonClassOptions {
    ignoreMissingProperties?: boolean;
}