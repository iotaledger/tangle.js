"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = exports.Config = exports.Client = exports.Document = exports.VerificationMethod = void 0;
const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");
const node_1 = require("@iota/identity-wasm/node");
let VerificationMethod = node_1.VerificationMethod;
exports.VerificationMethod = VerificationMethod;
let Document = node_1.Document;
exports.Document = Document;
let Client = node_1.Client;
exports.Client = Client;
let Config = node_1.Config;
exports.Config = Config;
let Network = node_1.Network;
exports.Network = Network;
const requirePath = "@iota/identity-wasm/web";
if (isBrowser()) {
    console.log("Browser environment. Loading WASM Web bindings");
    exports.VerificationMethod = VerificationMethod = require(requirePath).VerificationMethod;
    exports.Document = Document = require(requirePath).Document;
    exports.Client = Client = require(requirePath).Client;
    exports.Config = Config = require(requirePath).Config;
    exports.Network = Network = require(requirePath).Network;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YUlkZW50aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2lvdGFJZGVudGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdURBQXVEO0FBQ3ZELDBEQUEwRDtBQUMxRCx1REFBdUQ7QUFDdkQsZ0NBQWdDO0FBQ2hDLHlEQUF5RDs7O0FBRXpELE1BQU0sU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLDBEQUEwRCxDQUFDLENBQUM7QUFFM0YsbURBQ2tGO0FBRWxGLElBQUksa0JBQWtCLEdBQWMseUJBQUUsQ0FBQztBQW1COUIsZ0RBQWtCO0FBbEIzQixJQUFJLFFBQVEsR0FBYSxlQUFDLENBQUM7QUFrQkUsNEJBQVE7QUFqQnJDLElBQUksTUFBTSxHQUFjLGFBQUUsQ0FBQztBQWlCWSx3QkFBTTtBQWhCN0MsSUFBSSxNQUFNLEdBQWUsYUFBRyxDQUFDO0FBZ0JrQix3QkFBTTtBQWZyRCxJQUFJLE9BQU8sR0FBZSxjQUFHLENBQUM7QUFleUIsMEJBQU87QUFiOUQsTUFBTSxXQUFXLEdBQUcseUJBQXlCLENBQUM7QUFFOUMsSUFBSSxTQUFTLEVBQUUsRUFBRTtJQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELENBQUMsQ0FBQztJQUU5RCw2QkFBQSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsa0JBQWtCLENBQUM7SUFDN0QsbUJBQUEsUUFBUSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFFekMsaUJBQUEsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDckMsaUJBQUEsTUFBTSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDckMsa0JBQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUM7Q0FDMUMifQ==