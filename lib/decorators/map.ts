import { Constructable, NoCustomFunctionsDecoratorInput } from '../interfaces';
import { JsonMapper } from '../mapper';
import { makeCustomDecorator } from './common';
import { _IDENTITY_FUNCTION } from './property';

export type MapDecoratorInput = NoCustomFunctionsDecoratorInput & {
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

            const serializeFn = params?.complexType
                ? (_mapper: JsonMapper, v: any) => mapper.serialize(v)
                : _IDENTITY_FUNCTION;

            for (const [k, v] of map.entries()) {
                ret[k] = serializeFn(mapper, v);
            }

            return ret;
        },
        deserialize: (mapper: JsonMapper, obj) => {
            const map = new Map();

            const deserializeFn = params?.complexType
                ? (_mapper: JsonMapper, v: any) => mapper.deserialize(params.complexType!, v)
                : _IDENTITY_FUNCTION;

            for (const key in obj) {
                map.set(key, deserializeFn(mapper, obj[key]));
            }

            return map;
        },
    }))(params);
}
