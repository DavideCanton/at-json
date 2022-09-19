export const mappingMetadataKey = Symbol('mappingMetadataKey');
export const mappingOptionsKey = Symbol('mappingOptionsKey');
export const fieldsMetadataKey = Symbol('fieldsMetadataKey');

/**
 * Type alias for mapping function.
 */
export type Mapping<T = any, R = any> = (val: T) => R;

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
 * Type guard for {@link CustomSerialize} interface.
 *
 * @param mapValue value to check
 * @returns if the parameter is a CustomSerialize interface
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function hasCustomSerializeExport(mapValue: any): mapValue is CustomSerialize
{
    const fn = mapValue[nameOf<CustomSerialize>('customSerialize')];
    return typeof fn === 'function';
}

/**
 * Type guard for {@link AfterDeserialize} interface.
 *
 * @param mapValue value to check
 * @returns if the parameter is a AfterDeserialize interface
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function hasAfterDeserialize(mapValue: any): mapValue is AfterDeserialize
{
    const fn = mapValue[nameOf<AfterDeserialize>('afterDeserialize')];
    return typeof fn === 'function';
}

/**
 * Mapping options.
 *
 * @export
 * @interface IMappingOptions
 * @template T the source type of mapping
 * @template R the destination type of mapping
 */
export interface IMappingOptions
{
    /**
     * Property name.
     * If specified, the serialize process will convert the class property name to this value, and
     * the deserialize process will convert the other way.
     *
     * @type {string}
     * @memberof IMappingOptions
     */
    name?: string;

    /**
     * Custom deserialization function.
     *
     * @type {Mapping}
     * @memberof IMappingOptions
     */
    deserialize?: Mapping;

    /**
     * Custom serialization function.
     *
     * @type {Mapping}
     * @memberof IMappingOptions
     */
    serialize?: Mapping;
}

/**
 * Decorator input
 */
export type DecoratorInput = string | IMappingOptions | undefined;
export type NoCustomFunctionsDecoratorInput = string | Omit<IMappingOptions, 'serialize' | 'deserialize'> | undefined;


/** helper */
function nameOf<T>(k: keyof T): string
{
    return k as string;
}
