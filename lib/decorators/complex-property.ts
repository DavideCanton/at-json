import { Constructable, IMappingOptions, mappingMetadataKey } from '../interfaces';
import { wrapDecorator } from './common';

/**
 * Decorator for complex-type properties to be (de)serialized correctly.
 * Use this if the property is of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the property.
 * @param name the name of the property
 * @returns the decorator for the property.
 */
export function JsonComplexProperty<T>(constructor: Constructable<T>, name: string | null = null)
{
    const opts: IMappingOptions<any, T> = { complexType: constructor };
    if (name)
        opts.name = name;
    return wrapDecorator(Reflect.metadata(mappingMetadataKey, opts));
}
