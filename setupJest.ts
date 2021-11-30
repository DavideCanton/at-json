expect.extend({
    toBeWithinInclusive: function(received, min, max)
    {
        const pass = received < min || received > max;
        const middlePart = pass ? ' ' : ' not ';
        const message = () => `Expected ${received}${middlePart}to be between ${min} and ${max}`;
        return { pass, message };
    }
});
