import { JsonClass } from './decorators';
export const mappingMetadataKey = Symbol('mappingMetadataKey');
export const mappingOptionsKey = Symbol('mappingOptionsKey');
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
 * Interface for serializable object. Auto-implemented by {@link JsonClass} Decorator.
 *
 * @export
 * @interface JsonSerializable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JsonSerializable
{
}

/**
 * Interface for classes that want to apply a custom serialization logic.
 * If a class implements this interface, its {@link customSerialize}
 * method will be called instead of the default serialization logic.
 * It is the responsibility of the implementation to recursively serialize
 * nested objects.
 */
export interface CustomSerialize
{
    /**
     * Custom serialization logic.
     */
    customSerialize(): any;
}

/**
 * Interface for classes that want to apply an additional deserialization logic
 * after default deserialization.
 * If a class implements this interface, its {@link afterDeserialize}
 * method will be called after the deserialization.
 */
export interface AfterDeserialize
{
    /**
     * Additional deserialization logic.
     */
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

export interface IJsonClassOptions
{
    /**
     * If `true` (the default), undecorated properties are ignored by the serialization/deserialization process.
     * If `false`, they are treated as if they were decorated with the {@link JsonProperty} decorator.
     */
    ignoreUndecoratedProperties?: boolean;
}
