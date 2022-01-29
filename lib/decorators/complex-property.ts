import { Constructable, DecoratorInput } from '../interfaces';
import { JsonMapper } from '../mapper';
import { makeCustomDecorator } from './common';

/**
 * Decorator for complex-type properties to be (de)serialized correctly.
 * Use this if the property is of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the property.
 * @param name the name of the property
 * @returns the decorator for the property.
 */
export function JsonComplexProperty<T>(constructor: Constructable<T>, params?: DecoratorInput<T>)
{
    return makeCustomDecorator<T>(
        () => ({
            serializeFn: value => JsonMapper.serialize(value),
            deserializeFn: value => JsonMapper.deserialize<T>(constructor, value)
        })
    )(params);
}
