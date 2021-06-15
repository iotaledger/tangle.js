export default class AnchorError extends Error {
    
    constructor(name: string, message: string) {
        super();
        this.name = name;
        this.message = message;
    }

    public readonly type = "AnchorError";
}
