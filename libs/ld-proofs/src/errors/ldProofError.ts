export default class LdProofError extends Error {
    public static ERR_TYPE = "LdProofError";

    public readonly type = LdProofError.ERR_TYPE;

    constructor(name: string, message: string) {
        super();
        this.name = name;
        this.message = message;
    }
}
