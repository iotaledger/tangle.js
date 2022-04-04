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
const requirePath = "@tangle.js/streams-wasm/web";
if (isBrowser()) {
    console.log("Browser environment. Loading WASM Web bindings");
    exports.StreamsClient = StreamsClient = require(requirePath).StreamsClient;
    exports.Author = Author = require(requirePath).Author;
    exports.Subscriber = Subscriber = require(requirePath).Subscriber;
    exports.Address = Address = require(requirePath).Address;
    exports.ChannelType = ChannelType = require(requirePath).ChannelType;
    exports.MsgId = MsgId = require(requirePath).MsgId;
    exports.ChannelAddress = ChannelAddress = require(requirePath).ChannelAddress;
    exports.ClientBuilder = ClientBuilder = require(requirePath).ClientBuilder;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW90YVN0cmVhbXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW90YVN0cmVhbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHVEQUF1RDtBQUN2RCwwREFBMEQ7QUFDMUQsdURBQXVEO0FBQ3ZELGdDQUFnQztBQUNoQyx5REFBeUQ7OztBQUV6RCxNQUFNLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQywwREFBMEQsQ0FBQyxDQUFDO0FBRTNGLHVEQUlzQztBQUV0QyxJQUFJLGFBQWEsR0FBYyxvQkFBRSxDQUFDO0FBK0JoQixzQ0FBYTtBQTdCL0IsSUFBSSxVQUFVLEdBQWdCLGlCQUFJLENBQUM7QUE2QkYsZ0NBQVU7QUEzQjNDLElBQUksTUFBTSxHQUFjLGFBQUUsQ0FBQztBQTJCK0Msd0JBQU07QUF6QmhGLElBQUksT0FBTyxHQUFnQixjQUFJLENBQUM7QUF5QnZCLDBCQUFPO0FBdkJoQixJQUFJLFdBQVcsR0FBYyxrQkFBRSxDQUFDO0FBdUI2QixrQ0FBVztBQXJCeEUsSUFBSSxLQUFLLEdBQWEsWUFBQyxDQUFDO0FBcUIwRCxzQkFBSztBQW5CdkYsSUFBSSxjQUFjLEdBQWtCLHFCQUFNLENBQUM7QUFtQkUsd0NBQWM7QUFqQjNELElBQUksYUFBYSxHQUFzQixvQkFBVSxDQUFDO0FBaUJ1QyxzQ0FBYTtBQWZ0RyxNQUFNLFdBQVcsR0FBRyw2QkFBNkIsQ0FBQztBQUVsRCxJQUFJLFNBQVMsRUFBRSxFQUFFO0lBQ2IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO0lBRTlELHdCQUFBLGFBQWEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsYUFBYSxDQUFDO0lBQ25ELGlCQUFBLE1BQU0sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3JDLHFCQUFBLFVBQVUsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxDQUFDO0lBQzdDLGtCQUFBLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ3ZDLHNCQUFBLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsV0FBVyxDQUFDO0lBQy9DLGdCQUFBLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ25DLHlCQUFBLGNBQWMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsY0FBYyxDQUFDO0lBQ3JELHdCQUFBLGFBQWEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsYUFBYSxDQUFDO0NBQ3REIn0=