import { Constructable } from './interfaces';

export const typeMetadataKey = 'design:type';
export const typeHintMetadataKey = Symbol('type-hint-metadata-key');
export const genFnMetadataKey = Symbol('genFn-metadata-key');

export interface ITypeHint<T>
{
    hint: T;
    isEnum: boolean;
}

export type GenFn<T> = () => T;

