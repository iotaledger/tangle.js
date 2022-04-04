/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable no-new-func */
/* eslint-disable @typescript-eslint/naming-convention */

const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");

import {
    StreamsClient as Sc, Subscriber as Subs,
    Address as Addr, Author as Au, ChannelType as Ct,
    MsgId as M, ChannelAddress as ChAddr, ClientBuilder as CliBuilder
} from "@tangle.js/streams-wasm/node";

let StreamsClient: typeof Sc = Sc;

let Subscriber: typeof Subs = Subs;

let Author: typeof Au = Au;

let Address: typeof Addr = Addr;

let ChannelType: typeof Ct = Ct;

let MsgId: typeof M = M;

let ChannelAddress: typeof ChAddr = ChAddr;

let ClientBuilder: typeof CliBuilder = CliBuilder;

const requirePath = "@tangle.js/streams-wasm/web";

if (isBrowser()) {
    console.log("Browser environment. Loading WASM Web bindings");

    StreamsClient = require(requirePath).StreamsClient;
    Author = require(requirePath).Author;
    Subscriber = require(requirePath).Subscriber;
    Address = require(requirePath).Address;
    ChannelType = require(requirePath).ChannelType;
    MsgId = require(requirePath).MsgId;
    ChannelAddress = require(requirePath).ChannelAddress;
    ClientBuilder = require(requirePath).ClientBuilder;
}

export { Address, StreamsClient, Subscriber, ChannelAddress, ChannelType, Author, MsgId, ClientBuilder };
