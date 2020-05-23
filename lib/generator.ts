import 'reflect-metadata';
import { Constructable, fieldsMetadataKey, IMappingOptions, JsonSerializable, mappingMetadataKey } from './interfaces';

const typeMetadataKey = 'design:type';
export const typeHintMetadataKey = Symbol('type-hint-metadata-key');

export class MockGenerator
{
    static generateMock<T extends JsonSerializable>(ctor: Constructable<T>): T
    {
        const target = new ctor();

        const fields: string[] = Reflect.getMetadata(fieldsMetadataKey, target);
        for (const field of fields)
        {
            const propMappingMetadata: IMappingOptions<any, any> = Reflect.getMetadata(mappingMetadataKey, target, field);
            const type = Reflect.getMetadata(typeMetadataKey, target, field);

            if (type === String) target[field] = Math.random().toString();
            else if (type === Number) target[field] = Math.random();
            else if (type === Date) target[field] = new Date();
            else if (type === Array)
            {
                target[field] = [];
                if (propMappingMetadata?.complexType)
                {
                    const length = Math.floor(Math.random() * 9 + 1);
                    for (let i = 0; i < length; ++i)
                    {
                        target[field].push(MockGenerator.generateMock(propMappingMetadata.complexType));
                    }
                }
            }
            else if (type === Object) target[field] = {};
            else if (propMappingMetadata?.complexType)
                target[field] = MockGenerator.generateMock(propMappingMetadata.complexType);
        }

        return target;
    }
}

export function TypeHint(hint: any, isEnum = false): (target: Object, propertyKey: string | symbol) => void
{
    return Reflect.metadata(
        typeHintMetadataKey,
        { hint, isEnum }
    );
}
