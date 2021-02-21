import { makeCustomDecorator } from '../lib';

export const JsonDateProperty = makeCustomDecorator<Date>(
    d => d?.getFullYear()?.toString() ?? '',
    s => new Date(+s, 2, 12)
);

export function dateEquals(d: Date | null | undefined, d2: Date | null | undefined): boolean
{
    return d?.getTime() === d2?.getTime();
}
