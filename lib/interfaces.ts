export const mappingMetadataKey = Symbol('mappingMetadataKey');
export const mappingOptionsKey = Symbol('mappingOptionsKey');
export const fieldsMetadataKey = Symbol('fieldsMetadataKey');

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
}

/**
 * Decorator input
 */
export type DecoratorInput<T> = string | IMappingOptions<T, any> | undefined;
