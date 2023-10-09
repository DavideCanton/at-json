import { JsonClass, JsonMap, JsonMapper, JsonProperty } from '../../lib';

describe('JsonMap', () => {
    it('should deserialize map with primitive values', () => {
        const obj = { map: { n: 'foo', s: 'bar' } };

        const des = new JsonMapper().deserialize(WithSimpleMap, obj);
        expect([...des.map.keys()].sort()).toStrictEqual(['n', 's']);
        expect(des.map.get('n')).toEqual('foo');
        expect(des.map.get('s')).toEqual('bar');
    });

    it('should serialize map with primitive values', () => {
        const obj = new WithSimpleMap();

        obj.map.set('n', 'foo');
        obj.map.set('s', 'bar');

        const s = new JsonMapper().serialize(obj);
        expect(s.map).toStrictEqual({ n: 'foo', s: 'bar' });
    });

    it('should deserialize map with complex values', () => {
        const obj = {
            map: {
                p1: { n: 'foo', s: 'bar' },
                p2: { n: 'baz', s: 'quux' },
            },
        };

        const des = new JsonMapper().deserialize(WithComplexMap, obj);

        expect([...des.map.keys()].sort()).toStrictEqual(['p1', 'p2']);

        const v1 = des.map.get('p1')!;
        expect(v1.name).toEqual('foo');
        expect(v1.surname).toEqual('bar');

        const v2 = des.map.get('p2')!;
        expect(v2.name).toEqual('baz');
        expect(v2.surname).toEqual('quux');
    });

    it('should serialize map with complex values', () => {
        const root = new WithComplexMap();

        const v1 = new MapValue();
        root.map.set('p1', v1);
        v1.name = 'foo';
        v1.surname = 'bar';

        const v2 = new MapValue();
        root.map.set('p2', v2);
        v2.name = 'baz';
        v2.surname = 'quux';

        const s = new JsonMapper().serialize(root);
        expect(s.map).toStrictEqual({
            p1: { n: 'foo', s: 'bar' },
            p2: { n: 'baz', s: 'quux' },
        });
    });
});

@JsonClass()
class WithSimpleMap {
    @JsonMap()
    map = new Map<string, string>();
}

@JsonClass()
class MapValue {
    @JsonProperty('n') name: string;
    @JsonProperty('s') surname: string;
}

@JsonClass()
class WithComplexMap {
    @JsonMap({ complexType: MapValue })
    map = new Map<string, MapValue>();
}
