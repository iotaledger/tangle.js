
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_34(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h45c87d7cad3bb951(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_37(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd67b012b38ff8c15(arg0, arg1);
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

const u32CvtShim = new Uint32Array(2);

const uint64CvtShim = new BigUint64Array(u32CvtShim.buffer);
/**
*/
export function set_panic_hook() {
    wasm.set_panic_hook();
}

/**
* Initializes the console error panic hook for better error messages
*/
export function start() {
    wasm.start();
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
function __wbg_adapter_393(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h943e05907d25c2a8(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
export const ChannelType = Object.freeze({ SingleBranch:0,"0":"SingleBranch",MultiBranch:1,"1":"MultiBranch",SingleDepth:2,"2":"SingleDepth", });
/**
*/
export const LedgerInclusionState = Object.freeze({ Conflicting:0,"0":"Conflicting",Included:1,"1":"Included",NoTransaction:2,"2":"NoTransaction", });
/**
* Tangle representation of a Message Link.
*
* An `Address` is comprised of 2 distinct parts: the channel identifier
* ({@link ChannelAddress}) and the message identifier
* ({@link MsgId}). The channel identifier is unique per channel and is common in the
* `Address` of all messages published in it. The message identifier is
* produced pseudo-randomly out of the the message's sequence number, the
* previous message identifier, and other internal properties.
*/
export class Address {

    static __wrap(ptr) {
        const obj = Object.create(Address.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_address_free(ptr);
    }
    /**
    * @param {ChannelAddress} channel_address
    * @param {MsgId} msgid
    */
    constructor(channel_address, msgid) {
        _assertClass(channel_address, ChannelAddress);
        var ptr0 = channel_address.ptr;
        channel_address.ptr = 0;
        _assertClass(msgid, MsgId);
        var ptr1 = msgid.ptr;
        msgid.ptr = 0;
        const ret = wasm.address_new(ptr0, ptr1);
        return Address.__wrap(ret);
    }
    /**
    * @returns {ChannelAddress}
    */
    get channelAddress() {
        const ret = wasm.address_channelAddress(this.ptr);
        return ChannelAddress.__wrap(ret);
    }
    /**
    * @returns {MsgId}
    */
    get msgId() {
        const ret = wasm.address_msgId(this.ptr);
        return MsgId.__wrap(ret);
    }
    /**
    * Generate the hash used to index the {@link Message} published in this address.
    *
    * Currently this hash is computed with {@link https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2|Blake2b256}.
    * The returned Uint8Array contains the binary digest of the hash. To obtain the hexadecimal representation of the
    * hash, use the convenience method {@link Address#toMsgIndexHex}.
    * @returns {Uint8Array}
    */
    toMsgIndex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_toMsgIndex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Generate the hash used to index the {@link Message} published in this address.
    *
    * Currently this hash is computed with {@link https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2|Blake2b256}.
    * The returned String contains the hexadecimal digest of the hash. To obtain the binary digest of the hash,
    * use the method {@link Address#toMsgIndex}.
    * @returns {string}
    */
    toMsgIndexHex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_toMsgIndexHex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Render the `Address` as a colon-separated String of the hex-encoded {@link Address#channelAddress} and
    * {@link Address#msgId} (`<channelAddressHex>:<msgIdHex>`) suitable for exchanging the `Address` between
    * participants. To convert the String back to an `Address`, use {@link Address.parse}.
    *
    * @see Address.parse
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.address_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Decode an `Address` out of a String. The String must follow the format used by {@link Address#toString}
    *
    * @throws Throws an error if String does not follow the format `<channelAddressHex>:<msgIdHex>`
    *
    * @see Address#toString
    * @see ChannelAddress#hex
    * @see MsgId#hex
    * @param {string} string
    * @returns {Address}
    */
    static parse(string) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.address_parse(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Address.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Address}
    */
    copy() {
        const ret = wasm.address_copy(this.ptr);
        return Address.__wrap(ret);
    }
}
/**
*/
export class AddressGetter {

    static __wrap(ptr) {
        const obj = Object.create(AddressGetter.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_addressgetter_free(ptr);
    }
    /**
    * @param {Client} client
    * @param {string} seed
    * @returns {AddressGetter}
    */
    static new(client, seed) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        const ptr1 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.addressgetter_new(ptr0, ptr1, len1);
        return AddressGetter.__wrap(ret);
    }
    /**
    * Set the account index
    * @param {number} index
    * @returns {AddressGetter}
    */
    accountIndex(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.addressgetter_accountIndex(retptr, this.ptr, index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return AddressGetter.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set the address range
    * @param {number} start
    * @param {number} end
    * @returns {AddressGetter}
    */
    range(start, end) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.addressgetter_range(retptr, this.ptr, start, end);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return AddressGetter.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set the bech32 hrp
    * @param {string} bech32_hrp
    * @returns {AddressGetter}
    */
    bech32Hrp(bech32_hrp) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(bech32_hrp, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.addressgetter_bech32Hrp(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return AddressGetter.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Include internal addresses
    * @returns {AddressGetter}
    */
    includeInternal() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.addressgetter_includeInternal(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return AddressGetter.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get the addresses.
    * @returns {Promise<any>}
    */
    get() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.addressgetter_get(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class Author {

    static __wrap(ptr) {
        const obj = Object.create(Author.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_author_free(ptr);
    }
    /**
    * @param {string} seed
    * @param {SendOptions} options
    * @param {number} implementation
    */
    constructor(seed, options, implementation) {
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(options, SendOptions);
        var ptr1 = options.ptr;
        options.ptr = 0;
        const ret = wasm.author_new(ptr0, len0, ptr1, implementation);
        return Author.__wrap(ret);
    }
    /**
    * @param {StreamsClient} client
    * @param {string} seed
    * @param {number} implementation
    * @returns {Author}
    */
    static fromClient(client, seed, implementation) {
        _assertClass(client, StreamsClient);
        var ptr0 = client.ptr;
        client.ptr = 0;
        const ptr1 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.author_fromClient(ptr0, ptr1, len1, implementation);
        return Author.__wrap(ret);
    }
    /**
    * @param {StreamsClient} client
    * @param {Uint8Array} bytes
    * @param {string} password
    * @returns {Author}
    */
    static import(client, bytes, password) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(client, StreamsClient);
            var ptr0 = client.ptr;
            client.ptr = 0;
            const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            wasm.author_import(retptr, ptr0, ptr1, len1, ptr2, len2);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Author.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} password
    * @returns {Uint8Array}
    */
    export(password) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.author_export(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} seed
    * @param {Address} ann_address
    * @param {number} implementation
    * @param {SendOptions} options
    * @returns {Promise<Author>}
    */
    static recover(seed, ann_address, implementation, options) {
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(ann_address, Address);
        var ptr1 = ann_address.ptr;
        ann_address.ptr = 0;
        _assertClass(options, SendOptions);
        var ptr2 = options.ptr;
        options.ptr = 0;
        const ret = wasm.author_recover(ptr0, len0, ptr1, implementation, ptr2);
        return takeObject(ret);
    }
    /**
    * @returns {Author}
    */
    clone() {
        const ret = wasm.author_clone(this.ptr);
        return Author.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    channel_address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.author_channel_address(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr0 = r0;
            var len0 = r1;
            if (r3) {
                ptr0 = 0; len0 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr0, len0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr0, len0);
        }
    }
    /**
    * @returns {string | undefined}
    */
    announcementLink() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.author_announcementLink(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v0;
            if (r0 !== 0) {
                v0 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1);
            }
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {boolean}
    */
    is_multi_branching() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.author_is_multi_branching(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {StreamsClient}
    */
    get_client() {
        const ret = wasm.author_get_client(this.ptr);
        return StreamsClient.__wrap(ret);
    }
    /**
    * @param {string} psk_seed_str
    * @returns {string}
    */
    store_psk(psk_seed_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(psk_seed_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.author_store_psk(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
    /**
    * @returns {string}
    */
    get_public_key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.author_get_public_key(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr0 = r0;
            var len0 = r1;
            if (r3) {
                ptr0 = 0; len0 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr0, len0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr0, len0);
        }
    }
    /**
    * @returns {Promise<UserResponse>}
    */
    send_announce() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.author_send_announce(ptr);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    send_keyload_for_everyone(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.author_send_keyload_for_everyone(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {PskIds} psk_ids
    * @param {PublicKeys} sig_pks
    * @returns {Promise<UserResponse>}
    */
    send_keyload(link, psk_ids, sig_pks) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        _assertClass(psk_ids, PskIds);
        var ptr1 = psk_ids.ptr;
        psk_ids.ptr = 0;
        _assertClass(sig_pks, PublicKeys);
        var ptr2 = sig_pks.ptr;
        sig_pks.ptr = 0;
        const ret = wasm.author_send_keyload(ptr, ptr0, ptr1, ptr2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {Promise<UserResponse>}
    */
    send_tagged_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.author_send_tagged_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {Promise<UserResponse>}
    */
    send_signed_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.author_send_signed_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link_to
    * @returns {Promise<void>}
    */
    receive_subscribe(link_to) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link_to, Address);
        var ptr0 = link_to.ptr;
        link_to.ptr = 0;
        const ret = wasm.author_receive_subscribe(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link_to
    * @returns {Promise<void>}
    */
    receive_unsubscribe(link_to) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link_to, Address);
        var ptr0 = link_to.ptr;
        link_to.ptr = 0;
        const ret = wasm.author_receive_unsubscribe(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    receive_tagged_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.author_receive_tagged_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    receive_signed_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.author_receive_signed_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<Address>}
    */
    receive_sequence(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.author_receive_sequence(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    receive_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.author_receive_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} anchor_link
    * @param {number} msg_num
    * @returns {Promise<UserResponse>}
    */
    receive_msg_by_sequence_number(anchor_link, msg_num) {
        const ptr = this.__destroy_into_raw();
        _assertClass(anchor_link, Address);
        var ptr0 = anchor_link.ptr;
        anchor_link.ptr = 0;
        const ret = wasm.author_receive_msg_by_sequence_number(ptr, ptr0, msg_num);
        return takeObject(ret);
    }
    /**
    * Fetch all the pending messages that the user can read so as to bring the state of the user up to date
    *
    * This is the main method to bring the user to the latest state of the channel in order to be able to
    * publish new messages to it. It makes sure that the messages are processed in topologically order
    * (ie parent messages before child messages), ensuring a consistent state regardless of the order of publication.
    *
    * @returns {number} the amount of messages processed
    * @throws Throws error if an error has happened during message retrieval.
    * @see {@link Author#fetchNextMsg} for a method that retrieves the immediately next message that the user can read
    * @see {@link Author#fetchNextMsgs} for a method that retrieves all pending messages and collects
    *      them into an Array.
    * @returns {Promise<number>}
    */
    syncState() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.author_syncState(ptr);
        return takeObject(ret);
    }
    /**
    * Fetch all the pending messages that the user can read and collect them into an Array
    *
    * This is the main method to traverse the a channel forward at once.  It
    * makes sure that the messages in the Array are topologically ordered (ie
    * parent messages before child messages), ensuring a consistent state regardless
    * of the order of publication.
    *
    * @returns {UserResponse[]}
    * @throws Throws error if an error has happened during message retrieval.
    * @see {@link Author#fetchNextMsg} for a method that retrieves the immediately next message that the user can read
    * @see {@link Author#syncState} for a method that traverses all pending messages to update the state
    *      without accumulating them.
    * @returns {Promise<Array<any>>}
    */
    fetchNextMsgs() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.author_fetchNextMsgs(ptr);
        return takeObject(ret);
    }
    /**
    * Fetch the immediately next message that the user can read
    *
    * This is the main method to traverse the a channel forward message by message, as it
    * makes sure that no message is returned unless its parent message in the branches tree has already
    * been returned, ensuring a consistent state regardless of the order of publication.
    *
    * Keep in mind that internally this method might have to fetch multiple messages until the correct
    * message to be returned is found.
    *
    * @throws Throws error if an error has happened during message retrieval.
    * @see {@link Author#fetchNextMsgs} for a method that retrieves all pending messages and collects
    *      them into an Array.
    * @see {@link Author#syncState} for a method that traverses all pending messages to update the state
    *      without accumulating them.
    * @returns {Promise<UserResponse | undefined>}
    */
    fetchNextMsg() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.author_fetchNextMsg(ptr);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    fetch_prev_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.author_fetch_prev_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {number} num_msgs
    * @returns {Promise<Array<any>>}
    */
    fetch_prev_msgs(link, num_msgs) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.author_fetch_prev_msgs(ptr, ptr0, num_msgs);
        return takeObject(ret);
    }
    /**
    * Generate the next batch of message {@link Address} to poll
    *
    * Given the set of users registered as participants of the channel and their current registered
    * sequencing position, this method generates a set of new {@link Address} to poll for new messages
    * (one for each user, represented by its identifier). However, beware that it is not recommended to
    * use this method as a means to implement message traversal, as there's no guarantee that the addresses
    * returned are the immediately next addresses to be processed. use {@link Author#fetchNextMsg} instead.
    *
    * Keep in mind that in multi-branch channels, the link returned corresponds to the next sequence message.
    *
    * @see Author#fetchNextMsg
    * @see Author#fetchNextMsgs
    * @returns {NextMsgAddress[]}
    * @returns {Array<any>}
    */
    genNextMsgAddresses() {
        const ret = wasm.author_genNextMsgAddresses(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    fetch_state() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.author_fetch_state(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    reset_state() {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.author_reset_state(retptr, ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} pk_str
    */
    store_new_subscriber(pk_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(pk_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.author_store_new_subscriber(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} pk_str
    */
    remove_subscriber(pk_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(pk_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.author_remove_subscriber(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} pskid_str
    */
    remove_psk(pskid_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(pskid_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.author_remove_psk(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class BalanceGetter {

    static __wrap(ptr) {
        const obj = Object.create(BalanceGetter.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_balancegetter_free(ptr);
    }
    /**
    * @param {Client} client
    * @param {string} seed
    * @returns {BalanceGetter}
    */
    static new(client, seed) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        const ptr1 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.balancegetter_new(ptr0, ptr1, len1);
        return BalanceGetter.__wrap(ret);
    }
    /**
    * Sets the account index
    * @param {number} index
    * @returns {BalanceGetter}
    */
    accountIndex(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.balancegetter_accountIndex(retptr, this.ptr, index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return BalanceGetter.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the address index from which to start looking for balance
    * @param {number} initial_address_index
    * @returns {BalanceGetter}
    */
    initialAddressIndex(initial_address_index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.balancegetter_initialAddressIndex(retptr, this.ptr, initial_address_index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return BalanceGetter.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the gap limit to specify how many addresses will be checked each round.
    * If gap_limit amount of addresses in a row have no balance the function will return.
    * @param {number} gap_limit
    * @returns {BalanceGetter}
    */
    gap_limit(gap_limit) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.balancegetter_gap_limit(retptr, this.ptr, gap_limit);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return BalanceGetter.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get the balance.
    * @returns {Promise<any>}
    */
    get() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.balancegetter_get(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
* Channel application instance identifier (40 Byte)
*/
export class ChannelAddress {

    static __wrap(ptr) {
        const obj = Object.create(ChannelAddress.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_channeladdress_free(ptr);
    }
    /**
    * Render the `ChannelAddress` as a 40 Byte {@link https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array|Uint8Array}
    *
    * @see ChannelAddress#hex
    * @returns {Uint8Array}
    */
    bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.channeladdress_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Render the `ChannelAddress` as a 40 Byte (80 char) hexadecimal String
    *
    * @see ChannelAddress#bytes
    * @returns {string}
    */
    hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.channeladdress_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Render the `ChannelAddress` as an exchangeable String. Currently
    * outputs the same as {@link ChannelAddress#hex}.
    *
    * @see ChannelAddress#hex
    * @see ChannelAddress.parse
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.channeladdress_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Decode a `ChannelAddress` out of a String. The string must be a 80 char long hexadecimal string.
    *
    * @see ChannelAddress#toString
    * @throws Throws error if string does not follow the expected format
    * @param {string} string
    * @returns {ChannelAddress}
    */
    static parse(string) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.channeladdress_parse(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ChannelAddress.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {ChannelAddress}
    */
    copy() {
        const ret = wasm.address_channelAddress(this.ptr);
        return ChannelAddress.__wrap(ret);
    }
}
/**
*/
export class Client {

    static __wrap(ptr) {
        const obj = Object.create(Client.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_client_free(ptr);
    }
    /**
    * Send a message to the Tangle.
    * @returns {MessageBuilder}
    */
    message() {
        const ret = wasm.client_message(this.ptr);
        return MessageBuilder.__wrap(ret);
    }
    /**
    * Get a message from the Tangle.
    * @returns {MessageGetter}
    */
    getMessage() {
        const ret = wasm.client_getAddress(this.ptr);
        return MessageGetter.__wrap(ret);
    }
    /**
    * Generate addresses.
    * @param {string} seed
    * @returns {AddressGetter}
    */
    getAddresses(seed) {
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.client_getAddresses(this.ptr, ptr0, len0);
        return AddressGetter.__wrap(ret);
    }
    /**
    * Get an unspent address.
    * @param {string} seed
    * @returns {UnspentAddressGetter}
    */
    getUnspentAddress(seed) {
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.client_getUnspentAddress(this.ptr, ptr0, len0);
        return UnspentAddressGetter.__wrap(ret);
    }
    /**
    * Get the account balance.
    * @param {string} seed
    * @returns {BalanceGetter}
    */
    getBalance(seed) {
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.client_getBalance(this.ptr, ptr0, len0);
        return BalanceGetter.__wrap(ret);
    }
    /**
    * GET /api/v1/addresses/{address} endpoint
    * @returns {GetAddressBuilder}
    */
    getAddress() {
        const ret = wasm.client_getAddress(this.ptr);
        return GetAddressBuilder.__wrap(ret);
    }
    /**
    * Get the nodeinfo.
    * @returns {Promise<any>}
    */
    getInfo() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getInfo(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get the nodeinfo.
    * @param {string} url
    * @param {string | undefined} jwt
    * @param {string | undefined} username
    * @param {string | undefined} password
    * @returns {Promise<any>}
    */
    getNodeInfo(url, jwt, username, password) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(jwt) ? 0 : passStringToWasm0(jwt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(username) ? 0 : passStringToWasm0(username, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(password) ? 0 : passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len3 = WASM_VECTOR_LEN;
            wasm.client_getNodeInfo(retptr, this.ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Gets the network related information such as network_id and min_pow_score
    * and if it's the default one, sync it first.
    * @returns {Promise<any>}
    */
    networkInfo() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_networkInfo(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Gets the network id of the node we're connecting to.
    * @returns {Promise<any>}
    */
    getNetworkId() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getNetworkId(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * returns the bech32_hrp
    * @returns {Promise<any>}
    */
    getBech32Hrp() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getBech32Hrp(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * returns the bech32_hrp
    * @returns {Promise<any>}
    */
    getMinPowScore() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getMinPowScore(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get the node health.
    * @returns {Promise<any>}
    */
    getHealth() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getHealth(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get tips.
    * @returns {Promise<any>}
    */
    getTips() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getTips(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get peers.
    * @returns {Promise<any>}
    */
    getPeers() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getPeers(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * GET /api/v1/outputs/{outputId} endpoint
    * Find an output by its transaction_id and corresponding output_index.
    * @param {string} output_id
    * @returns {Promise<any>}
    */
    getOutput(output_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(output_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.client_getOutput(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Find all messages by provided message IDs and/or indexation_keys.
    * @param {any} indexation_keys
    * @param {any} message_ids
    * @returns {Promise<any>}
    */
    findMessages(indexation_keys, message_ids) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_findMessages(retptr, this.ptr, addHeapObject(indexation_keys), addHeapObject(message_ids));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Function to find inputs from addresses for a provided amount (useful for offline signing)
    * @param {any} addresses
    * @param {BigInt} amount
    * @returns {Promise<any>}
    */
    findInputs(addresses, amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            uint64CvtShim[0] = amount;
            const low0 = u32CvtShim[0];
            const high0 = u32CvtShim[1];
            wasm.client_findInputs(retptr, this.ptr, addHeapObject(addresses), low0, high0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Find all outputs based on the requests criteria. This method will try to query multiple nodes if
    * the request amount exceeds individual node limit.
    * @param {any} outputs
    * @param {any} addresses
    * @returns {Promise<any>}
    */
    findOutputs(outputs, addresses) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_findOutputs(retptr, this.ptr, addHeapObject(outputs), addHeapObject(addresses));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Return the balance in iota for the given addresses; No seed needed to do this since we are only checking and
    * already know the addresses.
    * @param {any} addresses
    * @returns {Promise<any>}
    */
    getAddressBalances(addresses) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getAddressBalances(retptr, this.ptr, addHeapObject(addresses));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * GET /api/v1/milestones/{index} endpoint
    * Get the milestone by the given index.
    * @param {number} index
    * @returns {Promise<any>}
    */
    getMilestone(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getMilestone(retptr, this.ptr, index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * GET /api/v1/milestones/{index}/utxo-changes endpoint
    * Get the milestone by the given index.
    * @param {number} index
    * @returns {Promise<any>}
    */
    getMilestoneUtxoChanges(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getMilestoneUtxoChanges(retptr, this.ptr, index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * GET /api/v1/receipts endpoint
    * Get all receipts.
    * @returns {Promise<any>}
    */
    getReceipts() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getReceipts(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * GET /api/v1/receipts/{migratedAt} endpoint
    * Get the receipts by the given milestone index.
    * @param {number} milestone_index
    * @returns {Promise<any>}
    */
    getReceiptsMigratedAt(milestone_index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getReceiptsMigratedAt(retptr, this.ptr, milestone_index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * GET /api/v1/treasury endpoint
    * Get the treasury output.
    * @returns {Promise<any>}
    */
    getTreasury() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_getTreasury(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * GET /api/v1/transactions/{transactionId}/included-message
    * Returns the included message of the transaction.
    * @param {string} transaction_id
    * @returns {Promise<any>}
    */
    getIncludedMessage(transaction_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.client_getIncludedMessage(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Post message.
    * @param {any} message
    * @returns {Promise<any>}
    */
    postMessage(message) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_postMessage(retptr, this.ptr, addHeapObject(message));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Retries (promotes or reattaches) a message for provided message id. Message should only be
    * retried only if they are valid and haven't been confirmed for a while.
    * @param {string} message_id
    * @returns {Promise<any>}
    */
    retry(message_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.client_retry(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Only works in browser because of the timeouts
    * Retries (promotes or reattaches) a message for provided message id until it's included (referenced by a
    * milestone). Default interval is 5 seconds and max attempts is 40. Returns reattached messages
    * @param {string} message_id
    * @param {BigInt | undefined} interval
    * @param {BigInt | undefined} max_attempts
    * @returns {Promise<any>}
    */
    retryUntilIncluded(message_id, interval, max_attempts) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            uint64CvtShim[0] = isLikeNone(interval) ? BigInt(0) : interval;
            const low1 = u32CvtShim[0];
            const high1 = u32CvtShim[1];
            uint64CvtShim[0] = isLikeNone(max_attempts) ? BigInt(0) : max_attempts;
            const low2 = u32CvtShim[0];
            const high2 = u32CvtShim[1];
            wasm.client_retryUntilIncluded(retptr, this.ptr, ptr0, len0, !isLikeNone(interval), low1, high1, !isLikeNone(max_attempts), low2, high2);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Reattaches messages for provided message id. Messages can be reattached only if they are valid and haven't been
    * confirmed for a while.
    * @param {string} message_id
    * @returns {Promise<any>}
    */
    reattach(message_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.client_reattach(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Promotes a message. The method should validate if a promotion is necessary through get_message. If not, the
    * method should error out and should not allow unnecessary promotions.
    * @param {string} message_id
    * @returns {Promise<any>}
    */
    promote(message_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.client_promote(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Only works in browser because of the timeouts
    * Function to consolidate all funds from a range of addresses to the address with the lowest index in that range
    * Returns the address to which the funds got consolidated, if any were available
    * @param {string} seed
    * @param {number} account_index
    * @param {number} start_index
    * @param {number} end_index
    * @returns {Promise<any>}
    */
    consolidateFunds(seed, account_index, start_index, end_index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.client_consolidateFunds(retptr, this.ptr, ptr0, len0, account_index, start_index, end_index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Returns a parsed hex String from bech32.
    * @param {string} address
    * @returns {string}
    */
    bech32ToHex(address) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.client_bech32ToHex(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
    /**
    * Returns a parsed bech32 String from hex.
    * @param {string} address
    * @param {string | undefined} bech32
    * @returns {Promise<any>}
    */
    hexToBech32(address, bech32) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(bech32) ? 0 : passStringToWasm0(bech32, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            wasm.client_hexToBech32(retptr, this.ptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Transforms a hex encoded public key to a bech32 encoded address
    * @param {string} public_key
    * @param {string | undefined} bech32
    * @returns {Promise<any>}
    */
    hexPublicKeyToBech32Address(public_key, bech32) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(public_key, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(bech32) ? 0 : passStringToWasm0(bech32, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            wasm.client_hexPublicKeyToBech32Address(retptr, this.ptr, ptr0, len0, ptr1, len1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Checks if a String is a valid bech32 encoded address.
    * @param {string} address
    * @returns {boolean}
    */
    isAddressValid(address) {
        const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.client_isAddressValid(this.ptr, ptr0, len0);
        return ret !== 0;
    }
    /**
    * Generates a new mnemonic.
    * @returns {string}
    */
    generateMnemonic() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.client_generateMnemonic(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr0 = r0;
            var len0 = r1;
            if (r3) {
                ptr0 = 0; len0 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr0, len0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr0, len0);
        }
    }
    /**
    * Returns a hex encoded seed for a mnemonic.
    * @param {string} mnemonic
    * @returns {string}
    */
    mnemonicToHexSeed(mnemonic) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(mnemonic, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.client_mnemonicToHexSeed(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
    /**
    * Returns the message id from a provided message.
    * @param {string} message
    * @returns {string}
    */
    getMessageId(message) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(message, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.client_getMessageId(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
    /**
    * Returns the transaction id from a provided transaction payload.
    * @param {string} transaction
    * @returns {string}
    */
    getTransactionId(transaction) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(transaction, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.client_getTransactionId(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
}
/**
*/
export class ClientBuilder {

    static __wrap(ptr) {
        const obj = Object.create(ClientBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_clientbuilder_free(ptr);
    }
    /**
    * Creates an IOTA client builder.
    */
    constructor() {
        const ret = wasm.clientbuilder_new();
        return ClientBuilder.__wrap(ret);
    }
    /**
    * Adds an IOTA node by its URL.
    * @param {string} url
    * @returns {ClientBuilder}
    */
    node(url) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.clientbuilder_node(retptr, ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Adds an IOTA node by its URL to be used as primary node, with optional jwt and or basic authentication
    * @param {string} url
    * @param {string | undefined} jwt
    * @param {string | undefined} username
    * @param {string | undefined} password
    * @returns {ClientBuilder}
    */
    primaryNode(url, jwt, username, password) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(jwt) ? 0 : passStringToWasm0(jwt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(username) ? 0 : passStringToWasm0(username, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(password) ? 0 : passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len3 = WASM_VECTOR_LEN;
            wasm.clientbuilder_primaryNode(retptr, ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Adds an IOTA node by its URL to be used as primary PoW node (for remote PoW), with optional jwt and or basic
    * authentication
    * @param {string} url
    * @param {string | undefined} jwt
    * @param {string | undefined} username
    * @param {string | undefined} password
    * @returns {ClientBuilder}
    */
    primaryPowNode(url, jwt, username, password) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(jwt) ? 0 : passStringToWasm0(jwt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(username) ? 0 : passStringToWasm0(username, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(password) ? 0 : passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len3 = WASM_VECTOR_LEN;
            wasm.clientbuilder_primaryPowNode(retptr, ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Adds a permanode by its URL, with optional jwt and or basic authentication
    * @param {string} url
    * @param {string | undefined} jwt
    * @param {string | undefined} username
    * @param {string | undefined} password
    * @returns {ClientBuilder}
    */
    permanode(url, jwt, username, password) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(jwt) ? 0 : passStringToWasm0(jwt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(username) ? 0 : passStringToWasm0(username, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(password) ? 0 : passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len3 = WASM_VECTOR_LEN;
            wasm.clientbuilder_permanode(retptr, ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Adds an IOTA node by its URL with optional jwt and or basic authentication
    * @param {string} url
    * @param {string | undefined} jwt
    * @param {string | undefined} username
    * @param {string | undefined} password
    * @returns {ClientBuilder}
    */
    nodeAuth(url, jwt, username, password) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(jwt) ? 0 : passStringToWasm0(jwt, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            var ptr2 = isLikeNone(username) ? 0 : passStringToWasm0(username, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len2 = WASM_VECTOR_LEN;
            var ptr3 = isLikeNone(password) ? 0 : passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len3 = WASM_VECTOR_LEN;
            wasm.clientbuilder_nodeAuth(retptr, ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Adds a list of IOTA nodes by their URLs.
    * @param {any} urls
    * @returns {ClientBuilder}
    */
    nodes(urls) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_nodes(retptr, ptr, addHeapObject(urls));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set the node sync interval (has no effect because we can't spawn another thread in wasm to sync the nodes)
    * @param {number} value
    * @returns {ClientBuilder}
    */
    nodeSyncInterval(value) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_nodeSyncInterval(retptr, ptr, value);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Disables the node syncing process.
    * Every node will be considered healthy and ready to use.
    * @returns {ClientBuilder}
    */
    nodeSyncDisabled() {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_nodeSyncDisabled(retptr, ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Allows creating the client without nodes for offline address generation or signing
    * @returns {ClientBuilder}
    */
    offlineMode() {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_offlineMode(retptr, ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get node list from the node_pool_urls
    * @param {any} node_pool_urls
    * @returns {Promise<any>}
    */
    nodePoolUrls(node_pool_urls) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_nodePoolUrls(retptr, ptr, addHeapObject(node_pool_urls));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set if quroum should be used or not
    * @param {boolean} value
    * @returns {ClientBuilder}
    */
    quorum(value) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_quorum(retptr, ptr, value);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set amount of nodes which should be used for quorum
    * @param {number} value
    * @returns {ClientBuilder}
    */
    quorumSize(value) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_quorumSize(retptr, ptr, value);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set quorum_threshold
    * @param {number} value
    * @returns {ClientBuilder}
    */
    quorumThreshold(value) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_quorumThreshold(retptr, ptr, value);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Selects the type of network to get default nodes for it, only "testnet" is supported at the moment.
    * Nodes that don't belong to this network are ignored. Default nodes are only used when no other nodes are
    * provided.
    * @param {string} network
    * @returns {ClientBuilder}
    */
    network(network) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(network, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.clientbuilder_network(retptr, ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Since we can only have a single thread in wasm, local PoW is much slower
    * @param {boolean} value
    * @returns {ClientBuilder}
    */
    localPow(value) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_localPow(retptr, ptr, value);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets after how many seconds new tips will be requested during PoW
    * @param {number} value
    * @returns {ClientBuilder}
    */
    tipsInterval(value) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_tipsInterval(retptr, ptr, value);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the default request timeout.
    * @param {number} value
    * @returns {ClientBuilder}
    */
    requestTimeout(value) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_requestTimeout(retptr, ptr, value);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the request timeout for a specific API usage.
    * @param {string} api
    * @param {number} timeout
    * @returns {ClientBuilder}
    */
    apiTimeout(api, timeout) {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(api, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.clientbuilder_apiTimeout(retptr, ptr, ptr0, len0, timeout);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return ClientBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Build the client.
    * @returns {Promise<any>}
    */
    build() {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.clientbuilder_build(retptr, ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class Cursor {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cursor_free(ptr);
    }
}
/**
*/
export class Details {

    static __wrap(ptr) {
        const obj = Object.create(Details.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_details_free(ptr);
    }
    /**
    * @returns {MessageMetadata}
    */
    get_metadata() {
        const ret = wasm.details_get_metadata(this.ptr);
        return MessageMetadata.__wrap(ret);
    }
    /**
    * @returns {MilestoneResponse | undefined}
    */
    get_milestone() {
        const ret = wasm.details_get_milestone(this.ptr);
        return ret === 0 ? undefined : MilestoneResponse.__wrap(ret);
    }
}
/**
*/
export class GetAddressBuilder {

    static __wrap(ptr) {
        const obj = Object.create(GetAddressBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_getaddressbuilder_free(ptr);
    }
    /**
    * @param {Client} client
    * @returns {GetAddressBuilder}
    */
    static new(client) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        const ret = wasm.getaddressbuilder_new(ptr0);
        return GetAddressBuilder.__wrap(ret);
    }
    /**
    * Consume the builder and get the balance of a given Bech32 encoded address.
    * If count equals maxResults, then there might be more outputs available but those were skipped for performance
    * reasons. User should sweep the address to reduce the amount of outputs.
    * @param {string} address
    * @returns {Promise<any>}
    */
    balance(address) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.getaddressbuilder_balance(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Consume the builder and get all outputs that use a given address.
    * If count equals maxResults, then there might be more outputs available but those were skipped for performance
    * reasons. User should sweep the address to reduce the amount of outputs.
    * @param {string} address
    * @param {any} options
    * @returns {Promise<any>}
    */
    outputs(address, options) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.getaddressbuilder_outputs(retptr, this.ptr, ptr0, len0, addHeapObject(options));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class Message {

    static __wrap(ptr) {
        const obj = Object.create(Message.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_message_free(ptr);
    }
    /**
    * @returns {Message}
    */
    static default() {
        const ret = wasm.message_default();
        return Message.__wrap(ret);
    }
    /**
    * @param {string | undefined} identifier
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {Message}
    */
    static new(identifier, public_payload, masked_payload) {
        var ptr0 = isLikeNone(identifier) ? 0 : passStringToWasm0(identifier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.message_new(ptr0, len0, ptr1, len1, ptr2, len2);
        return Message.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get_identifier() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.message_get_identifier(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get_public_payload() {
        const ret = wasm.message_get_public_payload(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    get_masked_payload() {
        const ret = wasm.message_get_masked_payload(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class MessageBuilder {

    static __wrap(ptr) {
        const obj = Object.create(MessageBuilder.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_messagebuilder_free(ptr);
    }
    /**
    * @param {Client} client
    * @returns {MessageBuilder}
    */
    static new(client) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        const ret = wasm.messagebuilder_new(ptr0);
        return MessageBuilder.__wrap(ret);
    }
    /**
    * Set indexation to the builder
    * @param {Uint8Array} index
    * @returns {MessageBuilder}
    */
    index(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(index, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.messagebuilder_index(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MessageBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set data to the builder
    * @param {Uint8Array} data
    * @returns {MessageBuilder}
    */
    data(data) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.messagebuilder_data(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MessageBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the seed.
    * @param {string} seed
    * @returns {MessageBuilder}
    */
    seed(seed) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.messagebuilder_seed(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MessageBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the account index.
    * @param {number} account_index
    * @returns {MessageBuilder}
    */
    accountIndex(account_index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagebuilder_accountIndex(retptr, this.ptr, account_index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MessageBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the index of the address to start looking for balance.
    * @param {number} initial_address_index
    * @returns {MessageBuilder}
    */
    initialAddressIndex(initial_address_index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagebuilder_initialAddressIndex(retptr, this.ptr, initial_address_index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MessageBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set 1-8 custom parent message ids
    * @param {any} parents
    * @returns {MessageBuilder}
    */
    parents(parents) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagebuilder_parents(retptr, this.ptr, addHeapObject(parents));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MessageBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set a custom input(transaction output)
    * @param {string} output_id
    * @returns {MessageBuilder}
    */
    input(output_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(output_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.messagebuilder_input(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MessageBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set a custom range in which to search for addresses for custom provided inputs. Default: 0..100
    * @param {number} start
    * @param {number} end
    * @returns {MessageBuilder}
    */
    inputRange(start, end) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagebuilder_inputRange(retptr, this.ptr, start, end);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MessageBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set a transfer to the builder
    * @param {string} address
    * @param {BigInt} amount
    * @returns {MessageBuilder}
    */
    output(address, amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            uint64CvtShim[0] = amount;
            const low1 = u32CvtShim[0];
            const high1 = u32CvtShim[1];
            wasm.messagebuilder_output(retptr, this.ptr, ptr0, len0, low1, high1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MessageBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Set a dust allowance transfer to the builder, address needs to be Bech32 encoded
    * @param {string} address
    * @param {BigInt} amount
    * @returns {MessageBuilder}
    */
    dustAllowanceOutput(address, amount) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(address, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            uint64CvtShim[0] = amount;
            const low1 = u32CvtShim[0];
            const high1 = u32CvtShim[1];
            wasm.messagebuilder_dustAllowanceOutput(retptr, this.ptr, ptr0, len0, low1, high1);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MessageBuilder.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Prepare a transaction
    * @returns {Promise<any>}
    */
    prepareTransaction() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagebuilder_prepareTransaction(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sign a transaction
    * @param {any} prepared_transaction_data
    * @param {string} seed
    * @param {number | undefined} input_range_start
    * @param {number | undefined} input_range_end
    * @returns {Promise<any>}
    */
    signTransaction(prepared_transaction_data, seed, input_range_start, input_range_end) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.messagebuilder_signTransaction(retptr, this.ptr, addHeapObject(prepared_transaction_data), ptr0, len0, !isLikeNone(input_range_start), isLikeNone(input_range_start) ? 0 : input_range_start, !isLikeNone(input_range_end), isLikeNone(input_range_end) ? 0 : input_range_end);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Create a message with a provided payload
    * @param {any} payload
    * @returns {Promise<any>}
    */
    finishMessage(payload) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagebuilder_finishMessage(retptr, this.ptr, addHeapObject(payload));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Build and sumbit the message.
    * @returns {Promise<any>}
    */
    submit() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagebuilder_submit(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class MessageGetter {

    static __wrap(ptr) {
        const obj = Object.create(MessageGetter.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_messagegetter_free(ptr);
    }
    /**
    * @param {Client} client
    * @returns {MessageGetter}
    */
    static new(client) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        const ret = wasm.messagegetter_new(ptr0);
        return MessageGetter.__wrap(ret);
    }
    /**
    * Get message ids with an index.
    * @param {Uint8Array} index
    * @returns {Promise<any>}
    */
    index(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(index, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.messagegetter_index(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get a message with the message id.
    * @param {string} message_id
    * @returns {Promise<any>}
    */
    data(message_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.messagegetter_data(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get the raw message with the message id.
    * @param {string} message_id
    * @returns {Promise<any>}
    */
    raw(message_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.messagegetter_raw(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get the childrens of a message with the message id.
    * @param {string} message_id
    * @returns {Promise<any>}
    */
    children(message_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.messagegetter_children(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get the metadata of a message with the message id.
    * @param {string} message_id
    * @returns {Promise<any>}
    */
    metadata(message_id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(message_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.messagegetter_metadata(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class MessageMetadata {

    static __wrap(ptr) {
        const obj = Object.create(MessageMetadata.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_messagemetadata_free(ptr);
    }
    /**
    */
    get is_solid() {
        const ret = wasm.__wbg_get_messagemetadata_is_solid(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set is_solid(arg0) {
        wasm.__wbg_set_messagemetadata_is_solid(this.ptr, arg0);
    }
    /**
    */
    get referenced_by_milestone_index() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_messagemetadata_referenced_by_milestone_index(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number | undefined} arg0
    */
    set referenced_by_milestone_index(arg0) {
        wasm.__wbg_set_messagemetadata_referenced_by_milestone_index(this.ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
    */
    get milestone_index() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_messagemetadata_milestone_index(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return r0 === 0 ? undefined : r1 >>> 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {number | undefined} arg0
    */
    set milestone_index(arg0) {
        wasm.__wbg_set_messagemetadata_milestone_index(this.ptr, !isLikeNone(arg0), isLikeNone(arg0) ? 0 : arg0);
    }
    /**
    */
    get ledger_inclusion_state() {
        const ret = wasm.__wbg_get_messagemetadata_ledger_inclusion_state(this.ptr);
        return ret === 3 ? undefined : ret;
    }
    /**
    * @param {number | undefined} arg0
    */
    set ledger_inclusion_state(arg0) {
        wasm.__wbg_set_messagemetadata_ledger_inclusion_state(this.ptr, isLikeNone(arg0) ? 3 : arg0);
    }
    /**
    */
    get conflict_reason() {
        const ret = wasm.__wbg_get_messagemetadata_conflict_reason(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret;
    }
    /**
    * @param {number | undefined} arg0
    */
    set conflict_reason(arg0) {
        wasm.__wbg_set_messagemetadata_conflict_reason(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0);
    }
    /**
    */
    get should_promote() {
        const ret = wasm.__wbg_get_messagemetadata_should_promote(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
    * @param {boolean | undefined} arg0
    */
    set should_promote(arg0) {
        wasm.__wbg_set_messagemetadata_should_promote(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0 ? 1 : 0);
    }
    /**
    */
    get should_reattach() {
        const ret = wasm.__wbg_get_messagemetadata_should_reattach(this.ptr);
        return ret === 0xFFFFFF ? undefined : ret !== 0;
    }
    /**
    * @param {boolean | undefined} arg0
    */
    set should_reattach(arg0) {
        wasm.__wbg_set_messagemetadata_should_reattach(this.ptr, isLikeNone(arg0) ? 0xFFFFFF : arg0 ? 1 : 0);
    }
    /**
    * @returns {string}
    */
    get message_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagemetadata_message_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get get_parent_message_ids() {
        const ret = wasm.messagemetadata_get_parent_message_ids(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class MilestoneResponse {

    static __wrap(ptr) {
        const obj = Object.create(MilestoneResponse.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_milestoneresponse_free(ptr);
    }
    /**
    * Milestone index.
    */
    get index() {
        const ret = wasm.__wbg_get_milestoneresponse_index(this.ptr);
        return ret >>> 0;
    }
    /**
    * Milestone index.
    * @param {number} arg0
    */
    set index(arg0) {
        wasm.__wbg_set_milestoneresponse_index(this.ptr, arg0);
    }
    /**
    * Milestone timestamp.
    */
    get timestamp() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_milestoneresponse_timestamp(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            u32CvtShim[0] = r0;
            u32CvtShim[1] = r1;
            const n0 = uint64CvtShim[0];
            return n0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Milestone timestamp.
    * @param {BigInt} arg0
    */
    set timestamp(arg0) {
        uint64CvtShim[0] = arg0;
        const low0 = u32CvtShim[0];
        const high0 = u32CvtShim[1];
        wasm.__wbg_set_milestoneresponse_timestamp(this.ptr, low0, high0);
    }
    /**
    * @returns {string}
    */
    get message_id() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.milestoneresponse_message_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
}
/**
* Message identifier (12 Byte). Unique within a Channel.
*/
export class MsgId {

    static __wrap(ptr) {
        const obj = Object.create(MsgId.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_msgid_free(ptr);
    }
    /**
    * Render the `MsgId` as a 12 Byte {@link https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array|Uint8Array}
    *
    * @see MsgId#hex
    * @returns {Uint8Array}
    */
    bytes() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.msgid_bytes(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Render the `MsgId` as a 12 Byte (24 char) hexadecimal String
    *
    * @see MsgId#bytes
    * @returns {string}
    */
    hex() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.msgid_hex(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Render the `MsgId` as an exchangeable String. Currently
    * outputs the same as {@link MsgId#hex}.
    *
    * @see MsgId#hex
    * @see MsgId.parse
    * @returns {string}
    */
    toString() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.msgid_toString(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * Decode a `MsgId` out of a String. The string must be a 24 char long hexadecimal string.
    *
    * @see Msgid#toString
    * @throws Throws error if string does not follow the expected format
    * @param {string} string
    * @returns {MsgId}
    */
    static parse(string) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.msgid_parse(retptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return MsgId.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {MsgId}
    */
    copy() {
        const ret = wasm.msgid_copy(this.ptr);
        return MsgId.__wrap(ret);
    }
}
/**
*/
export class NextMsgAddress {

    static __wrap(ptr) {
        const obj = Object.create(NextMsgAddress.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_nextmsgaddress_free(ptr);
    }
    /**
    */
    get identifier() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_nextmsgaddress_identifier(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @param {string} arg0
    */
    set identifier(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_nextmsgaddress_identifier(this.ptr, ptr0, len0);
    }
    /**
    */
    get address() {
        const ret = wasm.__wbg_get_nextmsgaddress_address(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @param {Address} arg0
    */
    set address(arg0) {
        _assertClass(arg0, Address);
        var ptr0 = arg0.ptr;
        arg0.ptr = 0;
        wasm.__wbg_set_nextmsgaddress_address(this.ptr, ptr0);
    }
    /**
    * @param {string} identifier
    * @param {Address} address
    * @returns {NextMsgAddress}
    */
    static new(identifier, address) {
        const ptr0 = passStringToWasm0(identifier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(address, Address);
        var ptr1 = address.ptr;
        address.ptr = 0;
        const ret = wasm.nextmsgaddress_new(ptr0, len0, ptr1);
        return NextMsgAddress.__wrap(ret);
    }
}
/**
*/
export class PskIds {

    static __wrap(ptr) {
        const obj = Object.create(PskIds.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pskids_free(ptr);
    }
    /**
    * @returns {PskIds}
    */
    static new() {
        const ret = wasm.pskids_new();
        return PskIds.__wrap(ret);
    }
    /**
    * @param {string} id
    */
    add(id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.pskids_add(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Array<any>}
    */
    get_ids() {
        const ret = wasm.pskids_get_ids(this.ptr);
        return takeObject(ret);
    }
}
/**
* Collection of PublicKeys representing a set of users
*/
export class PublicKeys {

    static __wrap(ptr) {
        const obj = Object.create(PublicKeys.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_publickeys_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.publickeys_new();
        return PublicKeys.__wrap(ret);
    }
    /**
    * Add key to collection
    *
    * Key must be a valid 32 Byte public-key string in its hexadecimal representation.
    *
    * @throws Throws error if string is not a valid public key
    * @param {string} id
    */
    add(id) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.publickeys_add(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Obtain all the public-keys collected so far in an string array
    * @returns {Array<any>}
    */
    get_pks() {
        const ret = wasm.publickeys_get_pks(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class SendOptions {

    static __wrap(ptr) {
        const obj = Object.create(SendOptions.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sendoptions_free(ptr);
    }
    /**
    */
    get local_pow() {
        const ret = wasm.__wbg_get_sendoptions_local_pow(this.ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set local_pow(arg0) {
        wasm.__wbg_set_sendoptions_local_pow(this.ptr, arg0);
    }
    /**
    * @param {string} url
    * @param {boolean} local_pow
    */
    constructor(url, local_pow) {
        const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sendoptions_new(ptr0, len0, local_pow);
        return SendOptions.__wrap(ret);
    }
    /**
    * @param {string} url
    */
    set url(url) {
        const ptr0 = passStringToWasm0(url, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.sendoptions_set_url(this.ptr, ptr0, len0);
    }
    /**
    * @returns {string}
    */
    get url() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagemetadata_message_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {SendOptions}
    */
    clone() {
        const ret = wasm.sendoptions_clone(this.ptr);
        return SendOptions.__wrap(ret);
    }
}
/**
*/
export class StreamsClient {

    static __wrap(ptr) {
        const obj = Object.create(StreamsClient.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_streamsclient_free(ptr);
    }
    /**
    * @param {string} node
    * @param {SendOptions} options
    */
    constructor(node, options) {
        const ptr0 = passStringToWasm0(node, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(options, SendOptions);
        var ptr1 = options.ptr;
        options.ptr = 0;
        const ret = wasm.streamsclient_new(ptr0, len0, ptr1);
        return StreamsClient.__wrap(ret);
    }
    /**
    * @param {Client} client
    * @returns {StreamsClient}
    */
    static fromClient(client) {
        _assertClass(client, Client);
        const ret = wasm.streamsclient_fromClient(client.ptr);
        return StreamsClient.__wrap(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<any>}
    */
    get_link_details(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        const ret = wasm.streamsclient_get_link_details(ptr, link.ptr);
        return takeObject(ret);
    }
}
/**
*/
export class Subscriber {

    static __wrap(ptr) {
        const obj = Object.create(Subscriber.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_subscriber_free(ptr);
    }
    /**
    * @param {string} seed
    * @param {SendOptions} options
    */
    constructor(seed, options) {
        const ptr0 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(options, SendOptions);
        var ptr1 = options.ptr;
        options.ptr = 0;
        const ret = wasm.subscriber_new(ptr0, len0, ptr1);
        return Subscriber.__wrap(ret);
    }
    /**
    * @param {StreamsClient} client
    * @param {string} seed
    * @returns {Subscriber}
    */
    static fromClient(client, seed) {
        _assertClass(client, StreamsClient);
        var ptr0 = client.ptr;
        client.ptr = 0;
        const ptr1 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.subscriber_fromClient(ptr0, ptr1, len1);
        return Subscriber.__wrap(ret);
    }
    /**
    * @param {StreamsClient} client
    * @param {Uint8Array} bytes
    * @param {string} password
    * @returns {Subscriber}
    */
    static import(client, bytes, password) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            _assertClass(client, StreamsClient);
            var ptr0 = client.ptr;
            client.ptr = 0;
            const ptr1 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
            const len1 = WASM_VECTOR_LEN;
            const ptr2 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len2 = WASM_VECTOR_LEN;
            wasm.subscriber_import(retptr, ptr0, ptr1, len1, ptr2, len2);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return Subscriber.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Subscriber}
    */
    clone() {
        const ret = wasm.subscriber_clone(this.ptr);
        return Subscriber.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    channel_address() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_channel_address(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr0 = r0;
            var len0 = r1;
            if (r3) {
                ptr0 = 0; len0 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr0, len0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr0, len0);
        }
    }
    /**
    * @returns {string | undefined}
    */
    announcementLink() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_announcementLink(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            let v0;
            if (r0 !== 0) {
                v0 = getStringFromWasm0(r0, r1).slice();
                wasm.__wbindgen_free(r0, r1 * 1);
            }
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {StreamsClient}
    */
    get_client() {
        const ret = wasm.subscriber_get_client(this.ptr);
        return StreamsClient.__wrap(ret);
    }
    /**
    * @returns {boolean}
    */
    is_multi_branching() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_is_multi_branching(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} psk_seed_str
    * @returns {string}
    */
    store_psk(psk_seed_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(psk_seed_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.subscriber_store_psk(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr1 = r0;
            var len1 = r1;
            if (r3) {
                ptr1 = 0; len1 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr1, len1);
        }
    }
    /**
    * @returns {string}
    */
    get_public_key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_get_public_key(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr0 = r0;
            var len0 = r1;
            if (r3) {
                ptr0 = 0; len0 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr0, len0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr0, len0);
        }
    }
    /**
    * @returns {string}
    */
    author_public_key() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_author_public_key(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            var ptr0 = r0;
            var len0 = r1;
            if (r3) {
                ptr0 = 0; len0 = 0;
                throw takeObject(r2);
            }
            return getStringFromWasm0(ptr0, len0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(ptr0, len0);
        }
    }
    /**
    * @returns {boolean}
    */
    is_registered() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_is_registered(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return r0 !== 0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    unregister() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_unregister(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} password
    * @returns {Uint8Array}
    */
    export(password) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(password, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.subscriber_export(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            var v1 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {Address} link
    * @returns {Promise<void>}
    */
    receive_announcement(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.subscriber_receive_announcement(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<boolean>}
    */
    receive_keyload(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.subscriber_receive_keyload(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    receive_tagged_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.subscriber_receive_tagged_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    receive_signed_packet(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.subscriber_receive_signed_packet(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<Address>}
    */
    receive_sequence(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.subscriber_receive_sequence(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    receive_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.subscriber_receive_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} anchor_link
    * @param {number} msg_num
    * @returns {Promise<UserResponse>}
    */
    receive_msg_by_sequence_number(anchor_link, msg_num) {
        const ptr = this.__destroy_into_raw();
        _assertClass(anchor_link, Address);
        var ptr0 = anchor_link.ptr;
        anchor_link.ptr = 0;
        const ret = wasm.subscriber_receive_msg_by_sequence_number(ptr, ptr0, msg_num);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    send_subscribe(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.subscriber_send_subscribe(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    send_unsubscribe(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.subscriber_send_unsubscribe(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {Promise<UserResponse>}
    */
    send_tagged_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.subscriber_send_tagged_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {Uint8Array} public_payload
    * @param {Uint8Array} masked_payload
    * @returns {Promise<UserResponse>}
    */
    send_signed_packet(link, public_payload, masked_payload) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ptr1 = passArray8ToWasm0(public_payload, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passArray8ToWasm0(masked_payload, wasm.__wbindgen_malloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.subscriber_send_signed_packet(ptr, ptr0, ptr1, len1, ptr2, len2);
        return takeObject(ret);
    }
    /**
    * Fetch all the pending messages that the user can read so as to bring the state of the user up to date
    *
    * This is the main method to bring the user to the latest state of the channel in order to be able to
    * publish new messages to it. It makes sure that the messages are processed in topologically order
    * (ie parent messages before child messages), ensuring a consistent state regardless of the order of publication.
    *
    * @returns {number} the amount of messages processed
    * @throws Throws error if an error has happened during message retrieval.
    * @see {@link Author#fetchNextMsg} for a method that retrieves the immediately next message that the user can read
    * @see {@link Author#fetchNextMsgs} for a method that retrieves all pending messages and collects
    *      them into an Array.
    * @returns {Promise<number>}
    */
    syncState() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.subscriber_syncState(ptr);
        return takeObject(ret);
    }
    /**
    * Fetch all the pending messages that the user can read and collect them into an Array
    *
    * This is the main method to traverse the a channel forward at once.  It
    * makes sure that the messages in the Array are topologically ordered (ie
    * parent messages before child messages), ensuring a consistent state regardless
    * of the order of publication.
    *
    * @returns {UserResponse[]}
    * @throws Throws error if an error has happened during message retrieval.
    * @see {@link Author#fetchNextMsg} for a method that retrieves the immediately next message that the user can read
    * @see {@link Author#syncState} for a method that traverses all pending messages to update the state
    *      without accumulating them.
    * @returns {Promise<Array<any>>}
    */
    fetchNextMsgs() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.subscriber_fetchNextMsgs(ptr);
        return takeObject(ret);
    }
    /**
    * Fetch the immediately next message that the user can read
    *
    * This is the main method to traverse the a channel forward message by message, as it
    * makes sure that no message is returned unless its parent message in the branches tree has already
    * been returned, ensuring a consistent state regardless of the order of publication.
    *
    * Keep in mind that internally this method might have to fetch multiple messages until the correct
    * message to be returned is found.
    *
    * @throws Throws error if an error has happened during message retrieval.
    * @see {@link Author#fetchNextMsgs} for a method that retrieves all pending messages and collects
    *      them into an Array.
    * @see {@link Author#syncState} for a method that traverses all pending messages to update the state
    *      without accumulating them.
    * @returns {Promise<UserResponse | undefined>}
    */
    fetchNextMsg() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.subscriber_fetchNextMsg(ptr);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @returns {Promise<UserResponse>}
    */
    fetch_prev_msg(link) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.subscriber_fetch_prev_msg(ptr, ptr0);
        return takeObject(ret);
    }
    /**
    * @param {Address} link
    * @param {number} num_msgs
    * @returns {Promise<Array<any>>}
    */
    fetch_prev_msgs(link, num_msgs) {
        const ptr = this.__destroy_into_raw();
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        const ret = wasm.subscriber_fetch_prev_msgs(ptr, ptr0, num_msgs);
        return takeObject(ret);
    }
    /**
    * Generate the next batch of message {@link Address} to poll
    *
    * Given the set of users registered as participants of the channel and their current registered
    * sequencing position, this method generates a set of new {@link Address} to poll for new messages
    * (one for each user, represented by its identifier). However, beware that it is not recommended to
    * use this method as a means to implement message traversal, as there's no guarantee that the addresses
    * returned are the immediately next addresses to be processed. use {@link Subscriber#fetchNextMsg} instead.
    *
    * Keep in mind that in multi-branch channels, the link returned corresponds to the next sequence message.
    *
    * @see Subscriber#fetchNextMsg
    * @see Subscriber#fetchNextMsgs
    * @returns {NextMsgAddress[]}
    * @returns {Array<any>}
    */
    genNextMsgAddresses() {
        const ret = wasm.subscriber_genNextMsgAddresses(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Array<any>}
    */
    fetch_state() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_fetch_state(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    reset_state() {
        try {
            const ptr = this.__destroy_into_raw();
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.subscriber_reset_state(retptr, ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {string} pskid_str
    */
    remove_psk(pskid_str) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(pskid_str, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.subscriber_remove_psk(retptr, this.ptr, ptr0, len0);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class UnspentAddressGetter {

    static __wrap(ptr) {
        const obj = Object.create(UnspentAddressGetter.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_unspentaddressgetter_free(ptr);
    }
    /**
    * @param {Client} client
    * @param {string} seed
    * @returns {UnspentAddressGetter}
    */
    static new(client, seed) {
        _assertClass(client, Client);
        var ptr0 = client.ptr;
        client.ptr = 0;
        const ptr1 = passStringToWasm0(seed, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.unspentaddressgetter_new(ptr0, ptr1, len1);
        return UnspentAddressGetter.__wrap(ret);
    }
    /**
    * Sets the account index
    * @param {number} index
    * @returns {UnspentAddressGetter}
    */
    accountIndex(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.unspentaddressgetter_accountIndex(retptr, this.ptr, index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return UnspentAddressGetter.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Sets the index of the address to start looking for balance
    * @param {number} index
    * @returns {UnspentAddressGetter}
    */
    initialAddressIndex(index) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.unspentaddressgetter_initialAddressIndex(retptr, this.ptr, index);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return UnspentAddressGetter.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * Get an unspent address with its index.
    * @returns {Promise<any>}
    */
    get() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.unspentaddressgetter_get(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
}
/**
*/
export class UserResponse {

    static __wrap(ptr) {
        const obj = Object.create(UserResponse.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userresponse_free(ptr);
    }
    /**
    * @param {Address} link
    * @param {Address | undefined} seq_link
    * @param {Message | undefined} message
    * @returns {UserResponse}
    */
    static new(link, seq_link, message) {
        _assertClass(link, Address);
        var ptr0 = link.ptr;
        link.ptr = 0;
        let ptr1 = 0;
        if (!isLikeNone(seq_link)) {
            _assertClass(seq_link, Address);
            ptr1 = seq_link.ptr;
            seq_link.ptr = 0;
        }
        let ptr2 = 0;
        if (!isLikeNone(message)) {
            _assertClass(message, Message);
            ptr2 = message.ptr;
            message.ptr = 0;
        }
        const ret = wasm.userresponse_new(ptr0, ptr1, ptr2);
        return UserResponse.__wrap(ret);
    }
    /**
    * @param {string} link
    * @param {string | undefined} seq_link
    * @param {Message | undefined} message
    * @returns {UserResponse}
    */
    static fromStrings(link, seq_link, message) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passStringToWasm0(link, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            var ptr1 = isLikeNone(seq_link) ? 0 : passStringToWasm0(seq_link, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            let ptr2 = 0;
            if (!isLikeNone(message)) {
                _assertClass(message, Message);
                ptr2 = message.ptr;
                message.ptr = 0;
            }
            wasm.userresponse_fromStrings(retptr, ptr0, len0, ptr1, len1, ptr2);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return UserResponse.__wrap(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {UserResponse}
    */
    copy() {
        const ret = wasm.userresponse_copy(this.ptr);
        return UserResponse.__wrap(ret);
    }
    /**
    * @returns {Address}
    */
    get link() {
        const ret = wasm.userresponse_link(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @returns {Address | undefined}
    */
    get seqLink() {
        const ret = wasm.userresponse_seqLink(this.ptr);
        return ret === 0 ? undefined : Address.__wrap(ret);
    }
    /**
    * @returns {Message | undefined}
    */
    get message() {
        const ret = wasm.userresponse_message(this.ptr);
        return ret === 0 ? undefined : Message.__wrap(ret);
    }
}
/**
*/
export class UserState {

    static __wrap(ptr) {
        const obj = Object.create(UserState.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_userstate_free(ptr);
    }
    /**
    * @param {string} identifier
    * @param {Cursor} cursor
    * @returns {UserState}
    */
    static new(identifier, cursor) {
        const ptr0 = passStringToWasm0(identifier, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(cursor, Cursor);
        var ptr1 = cursor.ptr;
        cursor.ptr = 0;
        const ret = wasm.userstate_new(ptr0, len0, ptr1);
        return UserState.__wrap(ret);
    }
    /**
    * @returns {string}
    */
    get identifier() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.messagemetadata_message_id(retptr, this.ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(r0, r1);
        }
    }
    /**
    * @returns {Address}
    */
    get link() {
        const ret = wasm.userstate_link(this.ptr);
        return Address.__wrap(ret);
    }
    /**
    * @returns {number}
    */
    get seqNo() {
        const ret = wasm.userstate_seqNo(this.ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    get branchNo() {
        const ret = wasm.userstate_branchNo(this.ptr);
        return ret >>> 0;
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('streams_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_userresponse_new = function(arg0) {
        const ret = UserResponse.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_author_new = function(arg0) {
        const ret = Author.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_address_new = function(arg0) {
        const ret = Address.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_details_new = function(arg0) {
        const ret = Details.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_nextmsgaddress_new = function(arg0) {
        const ret = NextMsgAddress.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_userstate_new = function(arg0) {
        const ret = UserState.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_bigint_new = function(arg0, arg1) {
        const ret = BigInt(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_json_serialize = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = JSON.stringify(obj === undefined ? null : obj);
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_client_new = function(arg0) {
        const ret = Client.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_json_parse = function(arg0, arg1) {
        const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_clientbuilder_new = function(arg0) {
        const ret = ClientBuilder.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbg_new_693216e109162396 = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_0ddaca5d1abfb52f = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_09919627ac0992f5 = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_fetch_811d43d6bdcad5b1 = function(arg0) {
        const ret = fetch(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_654a7797990fb8db = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_fb6b088efb6bead2 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_process_70251ed1291754d5 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_versions_b23f2588cdb2ddbb = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_61b8c9a82499895d = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_static_accessor_NODE_MODULE_33b45247c55045b0 = function() {
        const ret = module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_2a93bc09fee45aca = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_2f56257a38275dbd = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_d07655bf62361f21 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_86b4b13392c7af56 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_b8c92eaac23d0d80 = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_9ad6677321a08dd8 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_static_accessor_MODULE_452b4680e8614c81 = function() {
        const ret = module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_f5521a5b85ad2542 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_dd27e6b0652b3236 = function(arg0) {
        const ret = getObject(arg0).getRandomValues;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_e57c9b75ddead065 = function(arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    };
    imports.wbg.__wbg_randomFillSync_d2ba53160aec6aba = function(arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_setTimeout_a100c5fd6f7b2032 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_89d7f088c1c45353 = function() { return handleError(function () {
        const ret = new Headers();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_append_f4f93bc73c45ee3e = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_fetch_bf56e2a9f0644e3f = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Response_ccfeb62399355bcd = function(arg0) {
        const ret = getObject(arg0) instanceof Response;
        return ret;
    };
    imports.wbg.__wbg_url_06c0f822d68d195c = function(arg0, arg1) {
        const ret = getObject(arg1).url;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_status_600fd8b881393898 = function(arg0) {
        const ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_headers_9e7f2c05a9b962ea = function(arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_arrayBuffer_5a99283a3954c850 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_text_2612fbe0b9d32220 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).text();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_now_20d2aadcf3cc17f7 = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_newwithstrandinit_fd99688f189f053e = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_94fb1279cf6afea5 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_newnoargs_e23b458e372830de = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_cabb70b365520721 = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_bf3d83fc18df496e = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_040f966faa9a72b3 = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_419afbd9b9574c4c = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iterator_4832ef1f15b0382b = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_a9cab131e3152c49 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_ae78342adc33730a = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_36359baae5a47e27 = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_40c6a90f1805aa90 = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_new_3047bf4b4f02b802 = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setname_a9e894ebb8ca8c25 = function(arg0, arg1, arg2) {
        getObject(arg0).name = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_call_3ed288a247f13ea5 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_37705eed627d5ed9 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_393(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_resolve_a9a87bdd64e9e62c = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_ce526c837d07b68f = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_842e65b843962f56 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_99737b4dcdf6f0d8 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_9b61fbbf3564c4fb = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_8e275ef40caea3a3 = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_5de1e0f82bddcd27 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_buffer_7af23f65f6c64548 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_ce1e75f0ce5f7974 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_cc9018bd6f283b6f = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_f25e869e4565d2a2 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_0acb1cf9bbaf8519 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_8f0657faca9f1422 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_da527dbd24eafb6b = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_has_ce995ec88636803d = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(getObject(arg0), getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_93b1c87ee2af852e = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_stringify_c760003feffcc1f2 = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper4122 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1067, __wbg_adapter_34);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper4813 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1264, __wbg_adapter_37);
        return addHeapObject(ret);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }



    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    wasm.__wbindgen_start();
    return wasm;
}

export default init;

