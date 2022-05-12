import initialize from "./helpers/initializationHelper";
export class LdProofs {
    static async initialize() {
        if (!this.isInitialized) {
            await initialize();
            this.isInitialized = true;
        }
    }
}
LdProofs.isInitialized = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGRQcm9vZnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGRQcm9vZnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxVQUFVLE1BQU0sZ0NBQWdDLENBQUM7QUFFeEQsTUFBTSxPQUFPLFFBQVE7SUFHVixNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVU7UUFDMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDckIsTUFBTSxVQUFVLEVBQUUsQ0FBQztZQUVuQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztTQUM3QjtJQUNMLENBQUM7O0FBUmEsc0JBQWEsR0FBWSxLQUFLLENBQUMifQ==