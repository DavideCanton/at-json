expect.extend({
    toBeWithinInclusive: function (received, min, max) {
        const valid = received < min || received > max;
        const messageFn = (b: boolean) => `Expected ${received}${b ? ' ' : ' not '}to be between ${min} and ${max}`;

        return valid ?
            {
                pass: true,
                message: () => messageFn(true)
            } :
            {
                pass: false,
                message: () => messageFn(false)
            };
    }
});
