import { IJsonClassOptions } from './decorators/class';
import * as I from './interfaces';
import { getMetadata } from './reflection';

/**
 * Class for JSON Mapping.
 *
 * @export
 * @class JsonMapper
 */
export class JsonMapper {
    /**
     * Serialization method.
     * Transforms `source` into a new JSON value by applying the "serialization" step for each property decorator.
     *
     * Annotated properties are serialized into a property using the `name` value as the destination name (defaults to the property name).
     *
     * @param {*} source the value to be serialized.
     * @returns {string} the transformed JSON value.
     * @throws An error if a class encountered while serializing has no {@link JsonClass} decorator.
     * @memberof JsonMapper
     */
    serialize(source: any): any {
        // if val is nil no need to do anything
        if (source === null || source === undefined) {
            return source;
        }

        // retrieve the object constructor in order to load the class decorator metadata
        const ctor: I.Constructable<any> = Object.getPrototypeOf(source).constructor;
        const ctorOptions: IJsonClassOptions = getMetadata(I.Symbols.mappingOptions, ctor);
        if (!ctorOptions) {
            throw new Error(`Class ${ctor.name} is not decorated with @JsonClass`);
        }

        // let's try to call an eventual custom export before the standard one
        const customExport = exportCustom(this, source);
        if (customExport.serialized) {
            return customExport.value;
        }

        // should missing properties be ignored
        const { ignoreUndecoratedProperties } = ctorOptions;
        // destination object for the mapping
        const target = {};

        Object.keys(source).forEach(propName => {
            // retrieve the serialization options in the decorator of the property
            const options: I.IMappingOptions = getMetadata(I.Symbols.mappingMetadata, ctor, propName);
            const propValue = source[propName];

            // if no decorator is provided, map the property by copy if "ignoreUndecoratedProperties" is false
            // maybe here a clone should be used instead of a shallow copy
            if (options === undefined) {
                if (!ignoreUndecoratedProperties) {
                    target[propName] = propValue;
                }

                return;
            }

            // destination property name, by default the property name in the source object, but it can be
            // overridden in the decorator
            const name = options.name || propName;

            if (options.serialize) {
                target[name] = options.serialize(this, propValue);
            } else {
                target[name] = propValue;
            }
        });

        return target;
    }

    /**
     * Deserializes an array by applying {@link deserialize} to each element.
     * @template T the type of output object
     * @param {I.Constructable<T>} ctor the destination constructor
     * @param jsonArray the array to be deserialized
     * @returns {T} the deserialized object
     * @memberof JsonMapper
     */
    deserializeArray<T>(ctor: I.Constructable<T>, jsonArray: any[]): T[] {
        return jsonArray.map(v => this.deserialize(ctor, v));
    }

    /**
     * Deserialization method.
     * Deserializes `source` into an object built using `ctor`.
     *
     * Annotated properties are deserialized into a property using the `name` value as the source name (defaults to the property name).
     *
     * @template T the type of output object
     * @param {I.Constructable<T>} ctor the destination constructor
     * @param {*} source the value to be deserialized
     * @param {(s: string) => any} stringParser the string parser to deserialize strings into JSON objects. Defaults to `JSON.parse`.
     * @returns {T} the deserialized object
     * @throws An error if a class encountered while deserializing has no {@link JsonClass} decorator.
     * @memberof JsonMapper
     */
    deserialize<T>(
        ctor: I.Constructable<T>,
        source: string | object,
        stringParser: (s: string) => any = JSON.parse
    ): T {
        const ctorOptions: IJsonClassOptions = getMetadata(I.Symbols.mappingOptions, ctor);
        if (!ctorOptions) {
            throw new Error(`Class ${ctor.name} is not decorated with @JsonClass`);
        }

        // automatic parse of strings
        if (typeof source === 'string') {
            source = stringParser(source);
        }

        const target = new ctor();
        const has = Object.prototype.hasOwnProperty;

        const { ignoreUndecoratedProperties } = ctorOptions;

        // keep track of mapped properties, so we can copy not mapped ones if "ignoreUndecoratedProperties" is false
        const mapped = new Set<string>();

        // extract the property names array from the metadata stored in the constructor
        // be careful: undecorated properties are NOT stored in this array
        const propNames = (getMetadata(I.Symbols.fieldsMetadata, ctor) as string[]) ?? [];

        propNames.forEach(propName => {
            const options: I.IMappingOptions = getMetadata(I.Symbols.mappingMetadata, ctor, propName);

            /* istanbul ignore next */
            if (options === undefined) {
                return;
            }

            const name = options.name || propName;

            if (!has.call(source, name)) {
                return;
            }

            if (options.deserialize) {
                target[propName] = options.deserialize(this, source[name]);
            } else {
                target[propName] = source[name];
            }

            mapped.add(name);
        });

        if (!ignoreUndecoratedProperties) {
            // iterate ALL object keys (even undecorated ones, since we are using Object.keys)
            Object.keys(source).forEach(propName => {
                // copy over not mapped properties
                // maybe here a clone should be performed?
                if (!mapped.has(propName)) {
                    target[propName] = source[propName];
                }
            });
        }

        // call eventual after deserialize callback to post-process values
        if (I.hasAfterDeserialize(target)) {
            target.afterDeserialize();
        }

        return target;
    }
}

/**
 * This method checks if the input value is a {@link CustomSerialize} implementation.
 * If it is so, it calls the custom export function and returns its output in the `value` field
 * of the response.
 *
 * @param {JsonMapper} mapper the mapper
 * @param mapValue the value to export
 * @returns the exported value decorated with a boolean
 */
function exportCustom(mapper: JsonMapper, mapValue: any): { serialized: true; value: any } | { serialized: false } {
    if (I.hasCustomSerializeExport(mapValue)) {
        return {
            serialized: true,
            value: mapValue.customSerialize(mapper),
        };
    } else {
        return {
            serialized: false,
        };
    }
}
