import each from 'jest-each';
import { JsonClass, JsonMapper, JsonProperty } from '../../lib';

describe('JsonProperty', () => {
    each(['null', 'non-null', 'default']).it('should deserialize [%s]', val => {
        const obj = {
            basic: 'foo',
            name: 'bar',
            name2: 'baz',
            code: '42',
        } as any;

        switch (val) {
            case 'null':
                obj.nullable = null;
                break;
            case 'non-null':
                obj.nullable = 'abc';
                break;
        }
        const des = new JsonMapper().deserialize(Class, obj);
        expect(des).toBeInstanceOf(Class);
        expect(des.basic).toBe('foo');
        expect(des.customName).toBe('bar');
        expect(des.customName2).toBe('baz');
        expect(des.id).toBe(42);

        if (val === 'null' || val === 'default') {
            expect(des.nullable).toBeNull();
        } else {
            expect(des.nullable).toBe('abc');
        }
    });

    each(['null', 'non-null', 'default']).it('should serialize [%s]', val => {
        const obj = new Class();
        obj.basic = 'foo';
        obj.customName = 'bar';
        obj.customName2 = 'baz';
        obj.id = 42;

        switch (val) {
            case 'null':
                obj.nullable = null;
                break;
            case 'non-null':
                obj.nullable = 'abc';
                break;
        }

        const ser = new JsonMapper().serialize(obj);
        const target = {
            basic: 'foo',
            name: 'bar',
            name2: 'baz',
            code: '42',
        } as any;
        if (val === 'null' || val === 'default') {
            target.nullable = null;
        } else {
            target.nullable = 'abc';
        }
        expect(ser).toStrictEqual(target);
    });
});

@JsonClass()
class Class {
    @JsonProperty()
    basic: string;

    @JsonProperty()
    nullable: string | null = null;

    @JsonProperty('name')
    customName: string;

    @JsonProperty({ name: 'name2' })
    customName2: string;

    @JsonProperty({
        name: 'code',
        serialize: (_m, v) => v.toString(),
        deserialize: (_m, v) => parseInt(v, 10),
    })
    id: number;
}
