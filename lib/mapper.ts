import 'reflect-metadata';

import { AfterDeserialize, Constructable, CustomSerialize, fieldsMetadataKey, IMappingOptions, JsonSerializable, mappingIgnoreKey, mappingMetadataKey } from './interfaces';

/**
 * Static class for JSON Mapping.
 *
 * @export
 * @class JsonMapper
 */
export class JsonMapper
{
    /**
     * Serialization method.
     * Transform `val` into a new JSON value by applying the "serialization" step for each property decorator.
     *
     * It needs @see JsonSerializable implementation, and serializes only properties
     * decorated with some decorator from this library, or a custom one implemented using @see makeCustomDecorator.
     *
     * Annotated properties are serialized into a property using the `name` value as the destination name (defaults to the property name),
     * if the `serializeFn` is present, it is invoked to allow serialization customization.
     *
     * If `complexType` is specified, the property is treated as it had @see JsonComplexProperty decorator,
     * recursively calling @see JsonMapper.serialize .
     *
     * If `isArray` is specified, the property is treated as it is an array,
     * using respectively @see JsonArray or @see JsonArrayOfComplexProperty ,
     * according to other parameters.
     *
     * @static
     * @param {*} source the value to be serialized.
     * @returns {string} the transformed JSON value.
     * @memberof JsonMapper
     */
    static serialize(source: JsonSerializable): any
    {
        // if val is nil no need to export it
        if (source === null || source === undefined)
            return source;

        // let's try to call an eventual custom export before the standard one
        const customExport = exportCustom(source);
        if (customExport.serialized)
            return customExport.value;

        // retrieve the object constructor in order to load the class decorator metadata
        const ctor: Constructable<JsonSerializable> = Object.getPrototypeOf(source).constructor;
        // should missing properties be ignored
        const ignoreMissingProperties = Reflect.getMetadata(mappingIgnoreKey, ctor);
        // destination object for the mapping
        const target = {};

        Object.keys(source).forEach(propName =>
        {
            // retrieve the serialization options in the decorator of the property
            const options: IMappingOptions = Reflect.getMetadata(mappingMetadataKey, ctor, propName);
            const propValue = source[propName];

            // if no decorator is provided, map the property by copy if "ignoreMissingFields" is false
            // maybe here a clone should be used instead of a shallow copy
            if (options === undefined)
            {
                if (!ignoreMissingProperties)
                    target[propName] = propValue;

                return;
            }

            // destination property name, by default the property name in the source object, but it can be
            // overridden in the decorator
            const name = options.name || propName;

            if (options.isArray)
            {
                // isArray handling, if not valued it is set to null by default
                if (propValue)
                {
                    // if value is an array, map each item recursively, else warn the user and set it to null
                    if (Array.isArray(propValue))
                        target[name] = propValue.map(el => serializeValue(options, el));
                    else
                    {
                        console.warn(`Field ${name} not an array`);
                        target[name] = null;
                    }
                }
                else
                    target[name] = null;
            }
            else
                // default handling, by calling serialize
                target[name] = serializeValue(options, propValue);
        });

        return target;
    }

    /**
     * Deserializes an array. @see deserialize
     * @static
     * @template T the type of output object
     * @param {Constructable<T>} ctor the destination constructor
     * @param jsonArray the array to be deserialized
     * @returns {T} the deserialized object
     * @memberof JsonMapper
     */
    static deserializeArray<T>(ctor: Constructable<T>, jsonArray: any[]): T[]
    {
        return jsonArray.map(v => JsonMapper.deserialize(ctor, v));
    }

    /**
     * Deserialization method.
     * Deserialize `jsonObj` into an object built using `ctor`.
     *
     * It deserializes only properties
     * decorated with some decorator from this library, or a custom one implemented using @see makeCustomDecorator .
     *
     * Annotated properties are deserialized into a property using the `name` value as the source name (defaults to the property name),
     * if the `mappingFn` is present, it is invoked to allow deserialization customization.
     *
     * If `complexType` is specified, the property is treated as it had @see JsonComplexProperty decorator,
     * recursively calling @see JsonMapper.serialize .
     *
     * If `isArray` is specified, the property is treated as it is an array,
     * using respectively @see JsonArray or @see JsonArrayOfComplexProperty ,
     * according to other parameters.
     *
     * @static
     * @template T the type of output object
     * @param {Constructable<T>} ctor the destination constructor
     * @param {*} source the value to be deserialized
     * @returns {T} the deserialized object
     * @memberof JsonMapper
     */
    static deserialize<T>(ctor: Constructable<T>, source: any): T
    {
        // automatic parse of strings
        if (typeof source === 'string')
            source = JSON.parse(source);

        const target = new ctor();
        const has = Object.prototype.hasOwnProperty;
        const ignoreMissingProperties = Reflect.getMetadata(mappingIgnoreKey, ctor);
        // keep track of mapped properties, so we can copy not mapped ones if "ignoreMissingFields" is false
        const mapped = new Set<string>();
        // extract the property names array from the metadata stored in the constructor
        // be careful: undecorated properties are NOT stored in this array
        const propNames = Reflect.getMetadata(fieldsMetadataKey, ctor) as string[];

        propNames.forEach(propName =>
        {
            const options: IMappingOptions = Reflect.getMetadata(mappingMetadataKey, ctor, propName);

            if (options === undefined)
                return;

            const name = options.name || propName;

            if (!has.call(source, name))
                return;

            if (options.isArray)
            {
                const propertyValue = source[name];
                if (Array.isArray(propertyValue))
                    // map deserialize on the array
                    target[propName] = propertyValue.map(item => deserializeValue(options, item));
                else
                    // if marked as array, but not an array, set the value to null
                    target[propName] = null;
            }
            else
                target[propName] = deserializeValue(options, source[name]);

            mapped.add(name);
        });

        if (!ignoreMissingProperties)
        {
            // iterate ALL object keys (even undecorated ones, since we are using Object.keys)
            Object.keys(source).forEach(propName =>
            {
                // copy over not mapped properties
                // maybe here a clone should be performed?
                if (!mapped.has(propName))
                    target[propName] = source[propName];
            });
        }

        // call eventual after deserialize callback to postprocess values
        if (hasAfterDeserialize(target))
            target.afterDeserialize();

        return target;
    }
}

/**
 * Deserializes the input `val` property according to is decorator options.
 *
 * @param options the decorator options
 * @param valueToDeserialize the value to deserialize
 * @returns the deserialized value
 */
export function deserializeValue(options: IMappingOptions, valueToDeserialize: any)
{
    if (options.mappingFn)
        return options.mappingFn(valueToDeserialize);
    else if (options.complexType)
    {
        return valueToDeserialize ?
            JsonMapper.deserialize(options.complexType, valueToDeserialize) :
            null;
    }
    else
        return valueToDeserialize;
}

/**
 * Serializes the input `val` property according to is decorator options.
 *
 * @param options the decorator options
 * @param valueToSerialize the value to serialize
 * @returns the serialized value
 */
export function serializeValue(options: IMappingOptions, valueToSerialize: any): any
{
    if (options.serializeFn)
        return options.serializeFn(valueToSerialize);
    else if (options.complexType)
        return JsonMapper.serialize(valueToSerialize);
    else
        return valueToSerialize;
}

/**
 * This method checks if the input value is a @see CustomSerialize implementation.
 * If it is so, it calls the custom export function and returns its output in the `value` field
 * of the response.
 *
 * @param mapValue the value to export
 * @returns the exported value decorated with a boolean
 */
function exportCustom(mapValue: any): { serialized: true; value: any } | { serialized: false }
{
    if (hasCustomSerializeExport(mapValue))
        return {
            serialized: true,
            value: mapValue.customSerialize()
        };
    else
        return {
            serialized: false,
        };
}

/**
 * Type guard for @see CustomSerialize interface.
 *
 * @param mapValue value to check
 * @returns if the parameter is a CustomSerialize interface
 */
function hasCustomSerializeExport(mapValue: any): mapValue is CustomSerialize
{
    const fn = mapValue[nameOf<CustomSerialize>('customSerialize')];
    return typeof fn === 'function';
}

/**
 * Type guard for @see AfterDeserialize interface.
 *
 * @param mapValue value to check
 * @returns if the parameter is a AfterDeserialize interface
 */
function hasAfterDeserialize(mapValue: any): mapValue is AfterDeserialize
{
    const fn = mapValue[nameOf<AfterDeserialize>('afterDeserialize')];
    return typeof fn === 'function';
}

/** helper */
function nameOf<T>(k: keyof T): string
{
    return k as string;
}
