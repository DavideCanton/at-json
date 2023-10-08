import { Symbols } from './interfaces';

/**
 * Defines a metadata on the target object.
 *
 * Replaces `Reflect.defineMetadata`.
 *
 * @param {string | symbol} key the key of the metadata
 * @param {any} value the value to be set in the metadata
 * @param {object} target the target on which the metadata should be set
 * @param {string | symbol} propertyName optional property name to add to the path on where value is set
 */
export function defineMetadata(key: string | symbol, value: any, target: object, propertyName?: string | symbol): void {
    // define metadata map on object to avoid overwriting the parent
    if (!has(target, Symbols.metadataRoot)) {
        target[Symbols.metadataRoot] = {};
    }

    const v = target[Symbols.metadataRoot];
    if (typeof v[propertyName] === 'undefined') {
        v[propertyName] = {};
    }
    v[propertyName][key] = value;
}

/**
 * Retrieves the metadata associated to `target` and `propertyName`.
 *
 * If not found, follows the prototype chain.
 *
 * Replaces `Reflect.getMedadata`.
 *
 * @param {string | symbol} key the key of the metadata
 * @param {object} target the target from which the metadata should be retrieved
 * @param {string | symbol} propertyName optional property name to add to the path on where value is retrieved
 * @returns {any} the value found, or `undefined` if not found
 */
export function getMetadata(key: string | symbol, target: object, propertyName?: string | symbol): any {
    const propName = propertyName as any;
    while (target) {
        const map = target?.[Symbols.metadataRoot];
        if (map && has(map, propName) && has(map[propName], key)) {
            return map[propName][key];
        }
        target = Object.getPrototypeOf(target);
    }
    return undefined;
}

function has(object: any, key: string | symbol): any {
    return Object.prototype.hasOwnProperty.call(object, key);
}
