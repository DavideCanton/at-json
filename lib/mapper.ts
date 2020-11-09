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
     * Serializes `val` into a JSON string.
     *
     * It needs @see JsonSerializable implementation, and serializes only properties
     * decorated with @see JsonProperty , @see JsonArray , @see JsonComplexProperty , @see JsonArrayOfComplexProperty .
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
     * @returns {string} the serialized JSON string.
     * @memberof JsonMapper
     */
    static serialize<T extends JsonSerializable>(val: T): string
    {
        const exported = JsonMapper.exportForSerialize(val);

        if(typeof exported === 'string')
            return exported;
        else
            return JSON.stringify(exported);
    }

    static exportForSerialize<T extends JsonSerializable>(val: T): any
    {
        if(val === null || val === undefined)
            return val;

        const ctor: Constructable<T> = Object.getPrototypeOf(val).constructor;
        const ignoreMissingProperties = Reflect.getMetadata(mappingIgnoreKey, ctor);
        const obj = {};

        const { serialized, value } = exportCustom(val);
        if(serialized)
            return value;

        Object.keys(val).forEach(propName =>
        {
            const opt: IMappingOptions<any, any> = Reflect.getMetadata(mappingMetadataKey, ctor, propName);

            if(opt === undefined)
            {
                if(!ignoreMissingProperties)
                    obj[propName] = val[propName];

                return;
            }

            const name = opt.name || propName;

            if(opt.isArray)
            {
                if(val[propName])
                {
                    if(!Array.isArray(val[propName]))
                    {
                        console.warn(`Field ${name} not an array`);
                        obj[name] = null;
                    }
                    else
                        obj[name] = (val[propName] as Array<any>).map(el => serializeValue(opt, el));
                }
                else
                    obj[name] = null;
            }
            else
                obj[name] = serializeValue(opt, val, propName);
        });

        return obj;
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
     * decorated with @see JsonProperty , @see JsonArray , @see JsonComplexProperty , @see JsonArrayOfComplexProperty .
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
        if(typeof jsonObj === 'string')
            jsonObj = JSON.parse(jsonObj);

        const obj = new ctor();
        const has = Object.prototype.hasOwnProperty;
        const ignoreMissingProperties = Reflect.getMetadata(mappingIgnoreKey, ctor);
        const mapped = new Set<string>();

        const propNames = Reflect.getMetadata(fieldsMetadataKey, ctor) as string[];

        propNames.forEach(propName =>
        {
            const opt: IMappingOptions<any, any> = Reflect.getMetadata(mappingMetadataKey, ctor, propName);

            if(opt === undefined)
                return;

            const name = opt.name || propName;

            if(!has.call(jsonObj, name))
                return;

            if(opt.isArray)
            {
                const prop = jsonObj[name];
                if(Array.isArray(prop))
                    obj[propName] = prop.map(e => deserializeValue(opt, e));
                else
                    obj[propName] = null;
            }
            else
                obj[propName] = deserializeValue(opt, jsonObj, name);

            mapped.add(name);
        });

        if(!ignoreMissingProperties)
        {
            Object.keys(jsonObj).forEach(propName =>
            {
                if(!mapped.has(propName))
                    obj[propName] = jsonObj[propName];
            });
        }

        const fn = obj[nameOf<AfterDeserialize>('afterDeserialize')];
        if(typeof fn === 'function')
            fn.call(obj);

        return obj;
    }
}

function nameOf<T>(k: keyof T): string
{
    return k as string;
}

export function deserializeValue(opt: IMappingOptions<any, any>, jsonObj: any, name?: string)
{
    const mapValue = name ? jsonObj[name] : jsonObj;

    let value: any;
    if(opt.mappingFn)
        value = opt.mappingFn(mapValue);
    else if(opt.complexType)
    {
        if(mapValue)
            value = JsonMapper.deserialize(opt.complexType, mapValue);
        else
            value = null;
    }
    else
        value = mapValue;

    return value;
}


export function serializeValue(opt: IMappingOptions<any, any>, val: any, propName?: string): any
{
    const mapValue = propName ? val[propName] : val;

    let value: string;
    if(opt.serializeFn)
        value = opt.serializeFn(mapValue);
    else if(opt.complexType)
        value = JsonMapper.exportForSerialize(mapValue);
    else
        value = mapValue;

    return value;
}

function exportCustom(mapValue: any): { serialized: boolean; value: any }
{
    const fn = mapValue[nameOf<CustomSerialize>('exportForSerialize')];
    if(typeof fn === 'function')
        return { serialized: true, value: fn.call(mapValue) };
    else
        return { serialized: false, value: '' };
}
