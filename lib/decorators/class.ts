import {
    Constructable,
    JsonSerializable,
    mappingOptionsKey,
} from '../interfaces';

export interface IJsonClassOptions {
    /**
     * If `true` (the default), undecorated properties are ignored by the serialization/deserialization process.
     * If `false`, they are treated as if they were decorated with the {@link JsonProperty} decorator.
     */
    ignoreUndecoratedProperties?: boolean;
}

/**
 * Constructor of a class decorated with {@link JsonClass}.
 */
export type JsonConstructor<T> = Constructable<T & JsonSerializable>;

/**
 * Decorator that auto-implements {@link JsonSerializable} interface.
 *
 * @export
 * @template T
 * @returns
 * @param ignoreMissingFields
 */
export function JsonClass<T>(
    options?: IJsonClassOptions
): <C extends JsonConstructor<T>>(ctor: C) => C {
    const actualOptions: Required<IJsonClassOptions> = Object.assign(
        { ignoreUndecoratedProperties: true } as Required<IJsonClassOptions>,
        options
    );

    return ctor => {
        Reflect.defineMetadata(mappingOptionsKey, actualOptions, ctor);
        return ctor;
    };
}
