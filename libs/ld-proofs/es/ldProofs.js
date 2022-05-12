import initialize from "./helpers/initializationHelper";
/**
 * Initialization class.
 */
export class LdProofs {
    /**
     * Initializes the library.
     */
    static async initialize() {
        if (!this.isInitialized) {
            await initialize();
            this.isInitialized = true;
        }
    }
}
/** Whether is initialized or not. */
// eslint-disable-next-line @typescript-eslint/naming-convention
LdProofs.isInitialized = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGRQcm9vZnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGRQcm9vZnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sZ0NBQWdDLENBQUM7QUFFeEQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sUUFBUTtJQUtqQjs7T0FFRztJQUNJLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVTtRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNyQixNQUFNLFVBQVUsRUFBRSxDQUFDO1lBRW5CLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1NBQzdCO0lBQ0wsQ0FBQzs7QUFiRCxxQ0FBcUM7QUFDckMsZ0VBQWdFO0FBQ2xELHNCQUFhLEdBQVksS0FBSyxDQUFDIn0=