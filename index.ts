import 'reflect-metadata';
import * as Symbol from 'es6-symbol';

const mappingMetadataKey = Symbol('mappingMetadataKey');

/**
 * Type alias for mapping function.
 */
export type MappingFn<T, R> = (val: T) => R;

/**
 * Type alias for serialize function member.
 */
export type SerializeFn = () => string;

/**
 * Interface for constructor class.
 *
 * @export
 * @interface Constructable
 * @template T the constructed type
 */
export interface Constructable<T> {
    new (...args: any[]): T;
}
/**
 * Interface for serializable object. Auto-implemented by @see JsonClass Decorator.
 *
 * @export
 * @interface JsonSerializable
 */
export interface JsonSerializable {
    serialize(): string;
}

/**
 * Decorator that auto-implements @see JsonSerializable interface.
 *
 * Classes must only provide a declaration for the unique interface method:
 *
 * `serialize: SerializeFn;`
 *
 * @export
 * @template T
 * @param {T} constructor
 * @returns
 */
export function JsonClass<T extends Constructable<JsonSerializable>>(constructor: T) {
    constructor.prototype.serialize = function (this: JsonSerializable) {
        return JsonMapper.serialize(this);
    };

    return constructor;
}

function normalizeParams<T, R>(params: string | MappingFn<T, R> | IMappingOptions<T, R>): IMappingOptions<T, R> {
    if (!params)
        params = {};
    if (typeof params === 'string')
        params = { name: params };
    else if (typeof params === 'function')
        params = { mappingFn: params };

    return params;
}

/**
 * Decorator for complex-type properties to be (de)serialized correctly.
 * Use this if the property is of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the property.
 * @returns the decorator for the property.
 */
export function JsonComplexProperty<T>(constructor: Constructable<T>) {
    const opts: IMappingOptions<any, T> = { complexType: constructor };
    return Reflect.metadata(mappingMetadataKey, opts);
}

/**
 * Decorator for complex-type array properties to be (de)serialized correctly.
 * Use this if the property is an array of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the array items.
 * @returns the decorator for the property.
 */
export function JsonArrayOfComplexProperty<T>(constructor: Constructable<T>) {
    const opts: IMappingOptions<any, T> = { isArray: true, complexType: constructor };
    return Reflect.metadata(mappingMetadataKey, opts);
}

/**
 * The basic decorator for array of simple properties. Required to enable (de)serialization of property.
 *
 * `params` has the same meaning that the one in @see JsonProperty .
 *
 * @export
 * @param {(string | MappingFn<any, any> | IMappingOptions<any, any>)} [params] the params
 * @returns the decorator for the property.
 */
export function JsonArray<T, R>(params?: string | MappingFn<T, R> | IMappingOptions<T, R>) {
    params = normalizeParams(params);
    return JsonProperty({ isArray: true, ...params });
}

/**
 * The basic decorator for simple properties. Required to enable (de)serialization of property.
 *
 * `params` can be:
 * - a string, if only the name of source property is provided (`name` property of @see IMappingOptions ).
 * - a function, if only the mapping function of property is provided (`mappingFn` property of @see IMappingOptions ).
 * - an object compliant to @see IMappingOptions interface.
 *
 * @export
 * @param {(string | MappingFn<any, any> | IMappingOptions<any, any>)} [params] the params
 * @returns the decorator for the property.
 */
export function JsonProperty<T, R>(params?: string | MappingFn<T, R> | IMappingOptions<T, R>) {
    params = normalizeParams(params);
    return Reflect.metadata(mappingMetadataKey, params);
}
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
    static serialize(val: any): string {
        return JSON.stringify(JsonMapper.innerSerialize(val));
    }

    private static innerSerialize(val: any): any {
        if (val === null || val === undefined)
            return val;

        const obj = {};

        Object.keys(val).forEach(propName => {
            const opt: IMappingOptions<any, any> = Reflect.getMetadata(mappingMetadataKey, val, propName);

            if (opt === undefined)
                return;

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
            value = JsonMapper.innerSerialize(mapValue);
        else if (opt.serializeFn)
            value = opt.serializeFn(mapValue);
        else
            value = mapValue;

        return value;
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

        Object.keys(obj).forEach(propName => {
            const opt: IMappingOptions<any, any> = Reflect.getMetadata(mappingMetadataKey, obj, propName);

            if (opt === undefined)
                return;

            const name = opt.name || propName;

            if (opt.isArray)
                obj[propName] = jsonObj[name] ? (jsonObj[name] as Array<any>).map(e => JsonMapper.deserializeValue(opt, e)) : null;
            else
                obj[propName] = JsonMapper.deserializeValue<T>(opt, jsonObj, name);
        });

        return obj;
    }

    private static deserializeValue<T>(opt: IMappingOptions<any, any>, jsonObj: any, name?: string) {
        const mapValue = name ? jsonObj[name] : jsonObj;

        let value;
        if (opt.complexType)
            value = this.deserialize(opt.complexType, mapValue);
        else if (opt.mappingFn)
            value = opt.mappingFn(mapValue);
        else
            value = mapValue;

        return value;
    }
}

/**
 * Mapping options.
 *
 * @export
 * @interface IMappingOptions
 * @template T the source type of mapping
 * @template R the destination type of mapping
 */
export interface IMappingOptions<T, R> {
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
     * @type {MappingFn<T, string>}
     * @memberof IMappingOptions
     */
    serializeFn?: MappingFn<T, string>;

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
}
