"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AnchoringChannelError extends Error {
    constructor(name, message) {
        super();
        this.type = AnchoringChannelError.ERR_TYPE;
        this.name = name;
        this.message = message;
    }
}
exports.default = AnchoringChannelError;
AnchoringChannelError.ERR_TYPE = "AnchoringChannelError";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yaW5nQ2hhbm5lbEVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Vycm9ycy9hbmNob3JpbmdDaGFubmVsRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFxQixxQkFBc0IsU0FBUSxLQUFLO0lBS3BELFlBQVksSUFBWSxFQUFFLE9BQWU7UUFDckMsS0FBSyxFQUFFLENBQUM7UUFISSxTQUFJLEdBQUcscUJBQXFCLENBQUMsUUFBUSxDQUFDO1FBSWxELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQzNCLENBQUM7O0FBVEwsd0NBVUM7QUFUaUIsOEJBQVEsR0FBRyx1QkFBdUIsQ0FBQyJ9