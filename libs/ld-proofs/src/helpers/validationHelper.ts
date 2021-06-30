export default class ValidationHelper {
    public static url(input: string): boolean {
        try {
            // eslint-disable-next-line no-new
            new URL(input);
        } catch {
            return false;
        }

        return true;
    }

    public static did(input: string): boolean {
        const regex = /^did:[\da-z]+:[\w.-]+/;

        return regex.test(input);
    }
}
