import { Constructable, DecoratorInputWithoutCustomFunctions } from '../interfaces';
import { JsonMapper } from '../mapper';
import { makeCustomDecorator } from './common';

export type MapDecoratorInput = DecoratorInputWithoutCustomFunctions & {
    complexType?: Constructable<any>;
};

/**
 * A custom decorator for handling objects as maps.
 *
 * @param params the mapping options to apply to the values of the map.
 */
export function JsonMap(params?: MapDecoratorInput): PropertyDecorator {
    return makeCustomDecorator(() => ({
        serialize: (mapper: JsonMapper, map: Map<any, any>) => {
            const ret = {};

            if (params?.complexType) {
                for (const [k, v] of map.entries()) {
                    ret[k] = mapper.serialize(v);
                }
            } else {
                for (const [k, v] of map.entries()) {
                    ret[k] = v;
                }
            }

            return ret;
        },
        deserialize: (mapper: JsonMapper, obj) => {
            const map = new Map();

            if (params?.complexType) {
                for (const key in obj) {
                    map.set(key, mapper.deserialize(params.complexType!, obj[key]));
                }
            } else {
                for (const key in obj) {
                    map.set(key, obj[key]);
                }
            }

            return map;
        },
    }))(params);
}
