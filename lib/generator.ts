import 'reflect-metadata';

import { Constructable, fieldsMetadataKey, IMappingOptions, JsonSerializable, mappingMetadataKey } from './interfaces';

const typeMetadataKey = 'design:type';
export const typeHintMetadataKey = Symbol('type-hint-metadata-key');
export const genFnMetadataKey = Symbol('genFn-metadata-key');


interface ITypeHint<T>
{
    hint: any;
    isEnum: boolean;
}

type GenFn<T> = () => T;

export class MockGenerator
{
    static generateMock<T extends JsonSerializable>(ctor: Constructable<T>, ignoreWarnings = false): T
    {
        return MockGenerator.generateValue(ctor, { complexType: ctor }, null, null, ignoreWarnings);
    }

    private static generateComplexObject<T extends JsonSerializable>(ctor: Constructable<T>, ignoreWarnings: boolean)
    {
        const target = new ctor();

        const fields: string[] = Reflect.getMetadata(fieldsMetadataKey, target);

        for(const field of fields)
        {
            const propMappingMetadata: IMappingOptions<any, any> | null = Reflect.getMetadata(mappingMetadataKey, target, field);
            const type: string = Reflect.getMetadata(typeMetadataKey, target, field);
            const hint: ITypeHint<any> | null = Reflect.getMetadata(typeHintMetadataKey, target, field) || null;
            const genFn: GenFn<T> | null = Reflect.getMetadata(genFnMetadataKey, target, field) || null;

            target[field] = MockGenerator.generateValue(type, propMappingMetadata, hint, genFn, ignoreWarnings);
        }

        return target;
    }

    private static generateValue(type: any, propMappingMetadata: IMappingOptions<any, any> | null, hint: ITypeHint<any> | null, genFn: GenFn<any> | null, ignoreWarnings: boolean): any
    {
        if(genFn)
            return genFn();

        if(type === Object && hint?.hint)
            type = hint.hint;
      
        if(type === Array || propMappingMetadata?.isArray)
            return MockGenerator.generateRandomArray(propMappingMetadata, ignoreWarnings, hint);
        else if(type === Object)
        {
            if(!ignoreWarnings)
                console.warn('Object type without hint, it will be generated as {}');
            return {};
        }
        else if(type === String)
        {
            if(hint?.isEnum)
                return MockGenerator.randomEnum(hint);
            else
                return Math.random().toString();
        }
        else if(type === Number)
        {
            if(hint?.isEnum)
                return MockGenerator.randomEnum(hint);
            else
                return Math.random();
        }
        else if(type === Date)
            return new Date();
        else if(propMappingMetadata?.complexType)
            return MockGenerator.generateComplexObject(propMappingMetadata.complexType, ignoreWarnings);
    }

    private static generateRandomArray(propMappingMetadata: IMappingOptions<any, any> | null, ignoreWarnings: boolean, hint: ITypeHint<any> | null)
    {
        const array: Array<any> = [];
        const length = Math.floor(Math.random() * 9 + 1);
        const arrayGenItemFn = (function()
        {
            if(propMappingMetadata?.complexType)
                return () => MockGenerator.generateComplexObject(propMappingMetadata.complexType!, ignoreWarnings);
            else if(hint?.hint)
                return () => MockGenerator.generateMock(hint.hint, ignoreWarnings);
            else if(!ignoreWarnings)
                console.warn('Array type without hint, it will be generated empty');
        })();

        if(arrayGenItemFn)
            for(let i = 0; i < length; ++i)
                array.push(arrayGenItemFn());

        return array;
    }

    private static randomEnum(hint: ITypeHint<any>)
    {
        const keys = Object.keys(hint.hint).filter(x => isNaN(parseInt(x, 10)));
        const index = Math.floor(Math.random() * keys.length);
        return hint.hint[keys[index]];
    }
}

export function TypeHint<T>(hint: Constructable<T>): (target: Object, propertyKey: string | symbol) => void
{
    const settings: ITypeHint<T> = { hint, isEnum: false };

    return Reflect.metadata(
        typeHintMetadataKey,
        settings
    );
}

export function EnumHint<T>(hint: any): (target: Object, propertyKey: string | symbol) => void
{
    const settings: ITypeHint<T> = { hint, isEnum: true };

    return Reflect.metadata(
        typeHintMetadataKey,
        settings
    );
}

export function Generator<T>(genFn: GenFn<T>)
{
    return Reflect.metadata(
        genFnMetadataKey,
        genFn
    );
}