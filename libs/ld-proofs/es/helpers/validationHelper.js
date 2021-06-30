"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidationHelper {
    static url(input) {
        try {
            // eslint-disable-next-line no-new
            new URL(input);
        }
        catch (_a) {
            return false;
        }
        return true;
    }
    static did(input) {
        const regex = /^did:[\da-z]+:[\w.-]+/;
        return regex.test(input);
    }
}
exports.default = ValidationHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbkhlbHBlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9oZWxwZXJzL3ZhbGlkYXRpb25IZWxwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFxQixnQkFBZ0I7SUFDMUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFhO1FBQzNCLElBQUk7WUFDQSxrQ0FBa0M7WUFDbEMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDbEI7UUFBQyxXQUFNO1lBQ0osT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFhO1FBQzNCLE1BQU0sS0FBSyxHQUFHLHVCQUF1QixDQUFDO1FBRXRDLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM3QixDQUFDO0NBQ0o7QUFqQkQsbUNBaUJDIn0=