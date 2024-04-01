import someTest from "./src/utils/test"
describe('someFunctionToTest', () => {
    it('should return a greeting', () => {
        expect(someTest ("Kash")).toBe("Hello Kash");
    });
})