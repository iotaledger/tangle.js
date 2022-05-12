import initialize from "./helpers/initializationHelper";

/**
 * Initialization class.
 */
export class LdProofs {
    /** Whether is initialized or not. */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public static isInitialized: boolean = false;

    /**
     * Initializes the library.
     */
    public static async initialize() {
        if (!this.isInitialized) {
            await initialize();

            this.isInitialized = true;
        }
    }
}
