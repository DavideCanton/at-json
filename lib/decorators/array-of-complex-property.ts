import { Constructable, IMappingOptions, mappingMetadataKey } from '../interfaces';
import { wrapDecorator } from './common';


/**
 * Decorator for complex-type array properties to be (de)serialized correctly.
 * Use this if the property is an array of a type that needs recursive (de)serialization.
 *
 * @export
 * @param {Constructable<any>} constructor the constructor type of the array items.
 * @param name the name of the property
 * @returns the decorator for the property.
 */
export function JsonArrayOfComplexProperty<T>(constructor: Constructable<T>, name: string | null = null)
{
    const opts: IMappingOptions<any, T> = { isArray: true, complexType: constructor };
    if (name)
        opts.name = name;
    return wrapDecorator(Reflect.metadata(mappingMetadataKey, opts));
}
