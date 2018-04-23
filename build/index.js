"use strict";
var symbol_1 = require('symbol');
var Reflect;
var mappingMetadataKey = symbol_1.Symbol('mappingMetadataKey');
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
function JsonClass(constructor) {
    constructor.prototype.serialize = ;
    this;
    JsonSerializable;
    {
        return JsonMapper.serialize(this);
    }
    ;
    return constructor;
}
exports.JsonClass = JsonClass;
function normalizeParams(params) {
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
function JsonComplexProperty(constructor) {
    var opts = { complexType: constructor };
    return Reflect.metadata(mappingMetadataKey, opts);
}
exports.JsonComplexProperty = JsonComplexProperty;
/**
 * Decorator for complex-type array properties to be (de)serialized correctly.
 * Use this if the property is an array of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the array items.
 * @returns the decorator for the property.
 */
function JsonArrayOfComplexProperty(constructor) {
    var opts = { isArray: true, complexType: constructor };
    return Reflect.metadata(mappingMetadataKey, opts);
}
exports.JsonArrayOfComplexProperty = JsonArrayOfComplexProperty;
/**
 * The basic decorator for array of simple properties. Required to enable (de)serialization of property.
 *
 * `params` has the same meaning that the one in @see JsonProperty .
 *
 * @export
 * @param {(string | MappingFn<any, any> | IMappingOptions<any, any>)} [params] the params
 * @returns the decorator for the property.
 */
function JsonArray(params) {
    params = normalizeParams(params);
    return JsonProperty.apply(void 0, [{ isArray: true }].concat(params));
}
exports.JsonArray = JsonArray;
;
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
function JsonProperty(params) {
    params = normalizeParams(params);
    return Reflect.metadata(mappingMetadataKey, params);
}
exports.JsonProperty = JsonProperty;
/**
 * Static class for JSON Mapping.
 *
 * @export
 * @class JsonMapper
 */
var JsonMapper = (function () {
    function JsonMapper() {
    }
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
    JsonMapper.serialize = function (val) {
        return JSON.stringify(JsonMapper.innerSerialize(val));
    };
    JsonMapper.innerSerialize = function (val) {
        if (val === null || val === undefined)
            return val;
        var obj = {};
        Object.keys(val).forEach(function (propName) {
            var opt = Reflect.getMetadata(mappingMetadataKey, val, propName);
            if (opt === undefined)
                return;
            var name = opt.name || propName;
            if (opt.isArray)
                obj[name] = val[propName] ? val[propName].map(function (el) { return JsonMapper.serializeValue(opt, el); }) : null;
            else
                obj[name] = JsonMapper.serializeValue(opt, val, propName);
        });
        return obj;
    };
    JsonMapper.serializeValue = function (opt, val, propName) {
        var mapValue = propName ? val[propName] : val;
        var value;
        if (opt.complexType)
            value = JsonMapper.innerSerialize(mapValue);
        else if (opt.serializeFn)
            value = opt.serializeFn(mapValue);
        else
            value = mapValue;
        return value;
    };
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
    JsonMapper.deserialize = function (ctor, jsonObj) {
        if (typeof jsonObj === 'string')
            jsonObj = JSON.parse(jsonObj);
        var obj = new ctor();
        Object.keys(obj).forEach(function (propName) {
            var opt = Reflect.getMetadata(mappingMetadataKey, obj, propName);
            if (opt === undefined)
                return;
            var name = opt.name || propName;
            if (opt.isArray)
                obj[propName] = jsonObj[name] ? jsonObj[name].map(function (e) { return JsonMapper.deserializeValue(opt, e); }) : null;
            else
                obj[propName] = JsonMapper.deserializeValue(opt, jsonObj, name);
        });
        return obj;
    };
    JsonMapper.deserializeValue = function (opt, jsonObj, name) {
        var mapValue = name ? jsonObj[name] : jsonObj;
        var value;
        if (opt.complexType)
            value = this.deserialize(opt.complexType, mapValue);
        else if (opt.mappingFn)
            value = opt.mappingFn(mapValue);
        else
            value = mapValue;
        return value;
    };
    return JsonMapper;
}());
exports.JsonMapper = JsonMapper;
