declare namespace jest
{
    interface Matchers<R, T = {}>
    {
        toBeWithinInclusive(min: number, max: number): R;
    }
}
