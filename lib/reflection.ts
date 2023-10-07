import { metadataRootKey } from './interfaces';

export function defineMetadata(key: string | symbol, value: any, target: object, propertyName?: string | symbol) {
    // define metadata map on object to avoid overwriting the parent
    if (!has(target, metadataRootKey)) {
        target[metadataRootKey] = {};
    }

    const v = target[metadataRootKey];
    if (typeof v[propertyName] === 'undefined') {
        v[propertyName] = {};
    }
    v[propertyName][key] = value;
}

export function getMetadata(key: string | symbol, target: object, propertyName?: string | symbol) {
    const propName = propertyName as any;
    while (target) {
        const map = target?.[metadataRootKey];
        if (map && has(map, propName) && has(map[propName], key)) {
            return map[propName][key];
        }
        target = Object.getPrototypeOf(target);
    }
    return undefined;
}

function has(object: any, key: string | symbol) {
    return Object.prototype.hasOwnProperty.call(object, key);
}
