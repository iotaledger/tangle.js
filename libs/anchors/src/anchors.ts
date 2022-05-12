import initialize from "./helpers/initializationHelper";

export class Anchors {
    public static isInitialized: boolean = false;

    public static async initialize() {
        if (!this.isInitialized) {
            await initialize();
        }
        this.isInitialized = true;
    }
}
