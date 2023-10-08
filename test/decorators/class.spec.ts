import each from 'jest-each';
import { Symbols } from '../../lib/interfaces';
import { getMetadata } from '../../lib/reflection';
import { JsonClass } from '../../lib';

describe('JsonClass', () => {
    each([true, false, null]).it('should store correctly metadata on class [%s]', value => {
        let dec: ClassDecorator;
        if (value === null) {
            dec = JsonClass();
        } else {
            dec = JsonClass({ ignoreUndecoratedProperties: value });
        }

        @dec
        class C {}

        const data = getMetadata(Symbols.mappingOptions, C);
        expect(data).toStrictEqual({ ignoreUndecoratedProperties: value ?? true });
    });
});
