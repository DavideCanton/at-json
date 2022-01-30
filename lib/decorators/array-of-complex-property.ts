import { Constructable, DecoratorInput, JsonSerializable } from '../interfaces';
import { JsonMapper } from '../mapper';
import { makeCustomDecorator, mapArray } from './common';


/**
 * Decorator for complex-type array properties to be (de)serialized correctly.
 * Use this if the property is an array of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the array items.
 * @param name the name of the property
 * @returns the decorator for the property.
 */
export function JsonArrayOfComplexProperty<T extends JsonSerializable>(
    constructor: Constructable<T>,
    params?: DecoratorInput<T[] | null>,
    throwIfNotArray?: boolean
): PropertyDecorator
{
    return makeCustomDecorator<T[] | null>(
        () => ({
            serialize: array => mapArray<T>(
                array,
                item => JsonMapper.serialize(item),
                throwIfNotArray
            ),
            deserialize: array => mapArray<T>(array,
                item => item === null || item === undefined ?
                    item :
                    JsonMapper.deserialize(constructor, item),
                throwIfNotArray
            )
        })
    )(params);
}
