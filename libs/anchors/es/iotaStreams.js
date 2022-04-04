"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientBuilder = exports.MsgId = exports.Author = exports.ChannelType = exports.ChannelAddress = exports.Subscriber = exports.StreamsClient = exports.Address = void 0;
const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");
const node_1 = require("@tangle.js/streams-wasm/node");
let StreamsClient = node_1.StreamsClient;
exports.StreamsClient = StreamsClient;
let Subscriber = node_1.Subscriber;
exports.Subscriber = Subscriber;
let Author = node_1.Author;
exports.Author = Author;
let Address = node_1.Address;
exports.Address = Address;
let ChannelType = node_1.ChannelType;
exports.ChannelType = ChannelType;
let MsgId = node_1.MsgId;
exports.MsgId = MsgId;
let ChannelAddress = node_1.ChannelAddress;
exports.ChannelAddress = ChannelAddress;
let ClientBuilder = node_1.ClientBuilder;
exports.ClientBuilder = ClientBuilder;
if (isBrowser()) {
    console.log("Browser environment. Loading WASM Web bindings");
    exports.StreamsClient = StreamsClient = require("@tangle.js/streams-wasm/web").StreamsClient;
    exports.Author = Author = require("@tangle.js/streams-wasm/web").Author;
    exports.Subscriber = Subscriber = require("@tangle.js/streams-wasm/web").Subscriber;
    exports.Address = Address = require("@tangle.js/streams-wasm/web").Address;
    exports.ChannelType = ChannelType = require("@tangle.js/streams-wasm/web").ChannelType;
    exports.MsgId = MsgId = require("@tangle.js/streams-wasm/web").MsgId;
    exports.ChannelAddress = ChannelAddress = require("@tangle.js/streams-wasm/web").ChannelAddress;
    exports.ClientBuilder = ClientBuilder = require("@tangle.js/streams-wasm/web").ClientBuilder;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVN0cmVhbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YVN0cmVhbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVEQUF1RDtBQUN2RCwwREFBMEQ7QUFDMUQsdURBQXVEO0FBQ3ZELGdDQUFnQztBQUNoQyx5REFBeUQ7OztBQUV6RCxNQUFNLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQywwREFBMEQsQ0FBQyxDQUFDO0FBRTNGLHVEQUlzQztBQUV0QyxJQUFJLGFBQWEsR0FBYyxvQkFBRSxDQUFDO0FBNkJoQixzQ0FBYTtBQTNCL0IsSUFBSSxVQUFVLEdBQWdCLGlCQUFJLENBQUM7QUEyQkYsZ0NBQVU7QUF6QjNDLElBQUksTUFBTSxHQUFjLGFBQUUsQ0FBQztBQXlCK0Msd0JBQU07QUF2QmhGLElBQUksT0FBTyxHQUFnQixjQUFJLENBQUM7QUF1QnZCLDBCQUFPO0FBckJoQixJQUFJLFdBQVcsR0FBYyxrQkFBRSxDQUFDO0FBcUI2QixrQ0FBVztBQW5CeEUsSUFBSSxLQUFLLEdBQWEsWUFBQyxDQUFDO0FBbUIwRCxzQkFBSztBQWpCdkYsSUFBSSxjQUFjLEdBQWtCLHFCQUFNLENBQUM7QUFpQkUsd0NBQWM7QUFmM0QsSUFBSSxhQUFhLEdBQXNCLG9CQUFVLENBQUM7QUFldUMsc0NBQWE7QUFidEcsSUFBSSxTQUFTLEVBQUUsRUFBRTtJQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0RBQWdELENBQUMsQ0FBQztJQUU5RCx3QkFBQSxhQUFhLEdBQUcsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUMsYUFBYSxDQUFDO0lBQ3JFLGlCQUFBLE1BQU0sR0FBRyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDdkQscUJBQUEsVUFBVSxHQUFHLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLFVBQVUsQ0FBQztJQUMvRCxrQkFBQSxPQUFPLEdBQUcsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ3pELHNCQUFBLFdBQVcsR0FBRyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxXQUFXLENBQUM7SUFDakUsZ0JBQUEsS0FBSyxHQUFHLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNyRCx5QkFBQSxjQUFjLEdBQUcsT0FBTyxDQUFDLDZCQUE2QixDQUFDLENBQUMsY0FBYyxDQUFDO0lBQ3ZFLHdCQUFBLGFBQWEsR0FBRyxPQUFPLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxhQUFhLENBQUM7Q0FDeEUifQ==