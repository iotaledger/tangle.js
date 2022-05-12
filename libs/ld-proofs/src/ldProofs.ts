import initialize from "./helpers/initializationHelper";

export class LdProofs {
    public static isInitialized: boolean = false;

    public static async initialize() {
        if (!this.isInitialized) {
            await initialize();

            this.isInitialized = true;
        }
    }
}
