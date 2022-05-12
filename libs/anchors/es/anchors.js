import initialize from "./helpers/initializationHelper";
export class Anchors {
    static async initialize() {
        if (!this.isInitialized) {
            await initialize();
            this.isInitialized = true;
        }
    }
}
Anchors.isInitialized = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9hbmNob3JzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sVUFBVSxNQUFNLGdDQUFnQyxDQUFDO0FBRXhELE1BQU0sT0FBTyxPQUFPO0lBR1QsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVO1FBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3JCLE1BQU0sVUFBVSxFQUFFLENBQUM7WUFDbkIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7U0FDN0I7SUFDTCxDQUFDOztBQVBhLHFCQUFhLEdBQVksS0FBSyxDQUFDIn0=