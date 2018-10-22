import 'reflect-metadata';

import { Constructable, IMappingOptions, mappingMetadataKey, mappingIgnoreKey, JsonSerializable } from './interfaces';

/**
 * Static class for JSON Mapping.
 *
 * @export
 * @class JsonMapper
 */
export class JsonMapper {

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
    static serialize<T extends JsonSerializable>(val: T): string {
        return JSON.stringify(JsonMapper.exportForSerialize(val));
    }

    static exportForSerialize<T extends JsonSerializable>(val: T): any {
        if (val === null || val === undefined)
            return val;

        const ignoreMissingProperties = Object.getPrototypeOf(val)[mappingIgnoreKey];
        const obj = {};

        Object.keys(val).forEach(propName => {
            const opt: IMappingOptions<any, any> = Reflect.getMetadata(mappingMetadataKey, val, propName);

            if (opt === undefined) {
                if (!ignoreMissingProperties)
                    obj[propName] = val[propName];

                return;
            }

            const name = opt.name || propName;

            if (opt.isArray)
                obj[name] = val[propName] ? (val[propName] as Array<any>).map(el => JsonMapper.serializeValue(opt, el)) : null;
            else
                obj[name] = JsonMapper.serializeValue(opt, val, propName);
        });

        return obj;
    }

    private static serializeValue(opt: IMappingOptions<any, any>, val: any, propName?: string) {
        const mapValue = propName ? val[propName] : val;

        let value;
        if (opt.complexType)
            value = JsonMapper.exportForSerialize(mapValue);
        else if (opt.serializeFn)
            value = opt.serializeFn(mapValue);
        else
            value = mapValue;

        return value;
    }

    /**
     * Deserializes an array. @see deserialize
     * @static
     * @template T the type of output object
     * @param {Constructable<T>} ctor the destination constructor
     * @param {*} jsonObj the value to be deserialized
     * @returns {T} the deserialized object
     * @memberof JsonMapper
     */
    static deserializeArray<T>(ctor: Constructable<T>, jsonArray: any[]): T[] {
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
    static deserialize<T>(ctor: Constructable<T>, jsonObj: any): T {
        if (typeof jsonObj === 'string')
            jsonObj = JSON.parse(jsonObj);

        const obj = new ctor();
        const has = Object.prototype.hasOwnProperty;
        const ignoreMissingProperties = ctor.prototype[mappingIgnoreKey];
        const mapped = <string[]>[];

        Object.keys(obj).forEach(propName => {
            const opt: IMappingOptions<any, any> = Reflect.getMetadata(mappingMetadataKey, obj, propName);

            if (opt === undefined)
                return;

            const name = opt.name || propName;

            if (!has.call(jsonObj, name))
                return;

            if (opt.isArray) {
                const prop = jsonObj[name];
                if (Array.isArray(prop))
                    obj[propName] = prop.map(e => JsonMapper.deserializeValue(opt, e));
                else
                    obj[propName] = JsonMapper.getDefaultArrayValue(opt);
            }
            else
                obj[propName] = JsonMapper.deserializeValue(opt, jsonObj, name);

            mapped.push(name);
        });

        if (!ignoreMissingProperties) {
            Object.keys(jsonObj).forEach(propName => {
                if (mapped.indexOf(propName) < 0)
                    obj[propName] = jsonObj[propName];
            });
        }

        return obj;
    }

    private static deserializeValue(opt: IMappingOptions<any, any>, jsonObj: any, name?: string) {
        const mapValue = name ? jsonObj[name] : jsonObj;

        let value;
        if (opt.complexType) {
            if (mapValue)
                value = this.deserialize(opt.complexType, mapValue);
            else
                value = null;
        }
        else if (opt.mappingFn)
            value = opt.mappingFn(mapValue);
        else
            value = mapValue;

        return value;
    }

    private static getDefaultArrayValue<R>(opt: IMappingOptions<any, R>): R[] | null {
        return opt.isArray && !opt.keepNullArray ? [] : null;
    }
}
