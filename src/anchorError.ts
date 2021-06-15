export default class AnchorageError extends Error {
    constructor(name: string, message: string) {
        super();
        this.name = name;
        this.message = message;
    }
}
