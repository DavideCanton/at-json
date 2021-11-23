import 'reflect-metadata';

import { AfterDeserialize, Constructable, fieldsMetadataKey, IMappingOptions, JsonSerializable, mappingIgnoreKey, mappingMetadataKey, CustomSerialize } from './interfaces';

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
     * Transform `val` into a string by calling @see JsonMapper.exportForSerialize and then by calling JSON.stringify.
     *
     * @param {*} val the value to be serialized.
     * @returns {string} the serialized JSON string.
     */
    static serialize<T extends JsonSerializable>(val: T): string
    {
        const exported = JsonMapper.exportForSerialize(val);

        // if export returns a string, no need to call stringify
        if (typeof exported === 'string')
            return exported;
        else
            return JSON.stringify(exported);
    }

    /**
     * Pre-serialization method.
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
     * @param {*} val the value to be serialized.
     * @returns {string} the transformed JSON value.
     * @memberof JsonMapper
     */
    static exportForSerialize<T extends JsonSerializable>(val: T): any
    {
        // if val is nil no need to export it
        if (val === null || val === undefined)
            return val;

        // let's try to call an eventual custom export before the standard one
        const customExport = exportCustom(val);
        if (customExport.serialized)
            return customExport.value;

        // retrieve the object constructor in order to load the class decorator metadata
        const ctor: Constructable<T> = Object.getPrototypeOf(val).constructor;
        // should missing properties be ignored
        const ignoreMissingProperties = Reflect.getMetadata(mappingIgnoreKey, ctor);
        // destination object for the mapping
        const mappingDest = {};

        Object.keys(val).forEach(propName =>
        {
            // retrieve the serialization options in the decorator of the property
            const opt: IMappingOptions = Reflect.getMetadata(mappingMetadataKey, ctor, propName);
            const propValue = val[propName];

            // if no decorator is provided, map the property by copy if "ignoreMissingFields" is false
            if (opt === undefined)
            {
                if (!ignoreMissingProperties)
                    mappingDest[propName] = propValue;

                return;
            }

            // destination property name, by default the property name in the source object, but it can be
            // overridden in the decorator
            const name = opt.name || propName;

            if (opt.isArray)
            {
                // isArray handling, if not valued it is set to null by default
                if (propValue)
                {
                    // if value is an array, map each item recursively, else warn the user and set it to null
                    if (Array.isArray(propValue))
                        mappingDest[name] = propValue.map(el => serializeValue(opt, el));
                    else
                    {
                        console.warn(`Field ${name} not an array`);
                        mappingDest[name] = null;
                    }
                }
                else
                    mappingDest[name] = null;
            }
            else
                // default handling, by calling serialize
                mappingDest[name] = serializeValue(opt, propValue);
        });

        return mappingDest;
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
     * @param {*} jsonObj the value to be deserialized
     * @returns {T} the deserialized object
     * @memberof JsonMapper
     */
    static deserialize<T>(ctor: Constructable<T>, jsonObj: any): T
    {
        if (typeof jsonObj === 'string')
            jsonObj = JSON.parse(jsonObj);

        const obj = new ctor();
        const has = Object.prototype.hasOwnProperty;
        const ignoreMissingProperties = Reflect.getMetadata(mappingIgnoreKey, ctor);
        const mapped = new Set<string>();

        const propNames = Reflect.getMetadata(fieldsMetadataKey, ctor) as string[];

        propNames.forEach(propName =>
        {
            const opt: IMappingOptions = Reflect.getMetadata(mappingMetadataKey, ctor, propName);

            if (opt === undefined)
                return;

            const name = opt.name || propName;

            if (!has.call(jsonObj, name))
                return;

            if (opt.isArray)
            {
                const prop = jsonObj[name];
                if (Array.isArray(prop))
                    obj[propName] = prop.map(e => deserializeValue(opt, e));
                else
                    obj[propName] = null;
            }
            else
                obj[propName] = deserializeValue(opt, jsonObj[name]);

            mapped.add(name);
        });

        if (!ignoreMissingProperties)
        {
            Object.keys(jsonObj).forEach(propName =>
            {
                if (!mapped.has(propName))
                    obj[propName] = jsonObj[propName];
            });
        }

        if (hasAfterDeserialize(obj))
            obj.afterDeserialize();

        return obj;
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
        return JsonMapper.exportForSerialize(valueToSerialize);
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
            value: mapValue.exportForSerialize()
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
    const fn = mapValue[nameOf<CustomSerialize>('exportForSerialize')];
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
