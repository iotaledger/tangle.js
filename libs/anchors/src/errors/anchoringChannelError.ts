export class AnchoringChannelError extends Error {
    public static ERR_TYPE = "AnchoringChannelError";

    public readonly type = AnchoringChannelError.ERR_TYPE;

    constructor(name: string, message: string) {
        super();
        this.name = name;
        this.message = message;
    }
}
