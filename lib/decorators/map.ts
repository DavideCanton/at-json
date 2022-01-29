import { MappingParams } from '../interfaces';
import { deserializeValue, serializeValue } from '../mapper';
import { makeCustomDecorator, normalizeParams } from './common';

/**
 * A custom decorator for handling objects as maps.
 *
 * @param params the mapping options to apply to the values of the map.
 */
export const JsonMap = (params?: MappingParams) =>
{
    const normalized = normalizeParams(params);

    const decoratorFactory = makeCustomDecorator(
        (map: Map<any, any>) =>
        {
            const ret = {};
            for (const [k, v] of map.entries())
                ret[k] = serializeValue(normalized, v);
            return ret;
        },
        obj =>
        {
            const map = new Map();
            for (const key in obj)
                map.set(key, deserializeValue(normalized, obj[key]));
            return map;
        }
    );

    return decoratorFactory();
};
