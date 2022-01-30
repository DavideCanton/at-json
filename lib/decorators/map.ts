import { Constructable, DecoratorInput } from '../interfaces';
import { JsonMapper } from '../mapper';
import { makeCustomDecorator } from './common';

export type MapDecoratorInput = DecoratorInput & { complexType?: Constructable<any> };

/**
 * A custom decorator for handling objects as maps.
 *
 * @param params the mapping options to apply to the values of the map.
 */
export function JsonMap<T extends Map<any, any>>(params?: MapDecoratorInput): PropertyDecorator
{
    return makeCustomDecorator<T>(
        () => ({
            serialize: (map: Map<any, any>) =>
            {
                const ret = {};

                const serializeFn = params?.complexType ?
                    (v: any) => JsonMapper.serialize(v) :
                    (v: any) => v;

                for (const [k, v] of map.entries())
                    ret[k] = serializeFn(v);

                return ret;
            },
            deserialize: obj =>
            {
                const map = new Map();

                const deserializeFn = params?.complexType ?
                    (v: any) => JsonMapper.deserialize(params.complexType!, v) :
                    (v: any) => v;

                for (const key in obj)
                    map.set(key, deserializeFn(obj[key]));

                return map;
            }
        })
    )(params);
};
