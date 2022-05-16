/* eslint-disable jsdoc/require-jsdoc */
export default class ValidationHelper {
    static url(input) {
        try {
            // eslint-disable-next-line no-new
            new URL(input);
        }
        catch {
            return false;
        }
        return true;
    }
    static did(input) {
        const regex = /^did:[\da-z]+:[\w.-]+/;
        return regex.test(input);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3ZhbGlkYXRpb25IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDO0FBRXhDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sZ0JBQWdCO0lBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBYTtRQUMzQixJQUFJO1lBQ0Esa0NBQWtDO1lBQ2xDLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2xCO1FBQUMsTUFBTTtZQUNKLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBYTtRQUMzQixNQUFNLEtBQUssR0FBRyx1QkFBdUIsQ0FBQztRQUV0QyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0IsQ0FBQztDQUNKIn0=