import { makeCustomDecorator } from '../lib';

export const JsonDateProperty = makeCustomDecorator<Date>(
    () => ({
        serialize: d => d?.getFullYear()?.toString() ?? '',
        deserialize: s => new Date(+s, 2, 12)
    })
);

export function dateEquals(d: Date | null | undefined, d2: Date | null | undefined): boolean
{
    return d?.getTime() === d2?.getTime();
}
