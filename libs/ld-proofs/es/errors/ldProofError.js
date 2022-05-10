export default class LdProofError extends Error {
    constructor(name, message) {
        super();
        this.type = LdProofError.ERR_TYPE;
        this.name = name;
        this.message = message;
    }
}
LdProofError.ERR_TYPE = "LdProofError";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGRQcm9vZkVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Vycm9ycy9sZFByb29mRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxDQUFDLE9BQU8sT0FBTyxZQUFhLFNBQVEsS0FBSztJQUszQyxZQUFZLElBQVksRUFBRSxPQUFlO1FBQ3JDLEtBQUssRUFBRSxDQUFDO1FBSEksU0FBSSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUM7UUFJekMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDM0IsQ0FBQzs7QUFSYSxxQkFBUSxHQUFHLGNBQWMsQ0FBQyJ9