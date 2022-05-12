/* eslint-disable jsdoc/require-jsdoc */
export default class LdProofError extends Error {
    constructor(name, message) {
        super();
        this.type = LdProofError.ERR_TYPE;
        this.name = name;
        this.message = message;
    }
}
LdProofError.ERR_TYPE = "LdProofError";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGRQcm9vZkVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Vycm9ycy9sZFByb29mRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBRXhDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sWUFBYSxTQUFRLEtBQUs7SUFLM0MsWUFBWSxJQUFZLEVBQUUsT0FBZTtRQUNyQyxLQUFLLEVBQUUsQ0FBQztRQUhJLFNBQUksR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDO1FBSXpDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7O0FBUmEscUJBQVEsR0FBRyxjQUFjLENBQUMifQ==