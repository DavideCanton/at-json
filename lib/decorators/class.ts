import { Symbols } from '../interfaces';
import { defineMetadata } from '../reflection';

export interface IJsonClassOptions {
    /**
     * If `true` (the default), undecorated properties are ignored by the serialization/deserialization process.
     * If `false`, they are treated as if they were decorated with the {@link JsonProperty} decorator.
     */
    ignoreUndecoratedProperties?: boolean;
}

/**
 * Decorator for mapped classes.
 *
 * @export
 * @template T
 * @returns
 * @param ignoreMissingFields
 */
export function JsonClass(options?: IJsonClassOptions): ClassDecorator {
    const actualOptions: Required<IJsonClassOptions> = Object.assign(
        { ignoreUndecoratedProperties: true } as Required<IJsonClassOptions>,
        options
    );

    return ctor => {
        defineMetadata(Symbols.mappingOptions, actualOptions, ctor);
        return ctor;
    };
}
