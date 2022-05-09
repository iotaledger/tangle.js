/* tslint:disable */
/* eslint-disable */
/**
*/
export function set_panic_hook(): void;
/**
* Initializes the console error panic hook for better error messages
*/
export function start(): void;
/**
*/
export enum ChannelType {
  SingleBranch,
  MultiBranch,
  SingleDepth,
}
/**
*/
export enum LedgerInclusionState {
  Conflicting,
  Included,
  NoTransaction,
}
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
  free(): void;
/**
* @param {ChannelAddress} channel_address
* @param {MsgId} msgid
*/
  constructor(channel_address: ChannelAddress, msgid: MsgId);
/**
* Generate the hash used to index the {@link Message} published in this address.
*
* Currently this hash is computed with {@link https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2|Blake2b256}.
* The returned Uint8Array contains the binary digest of the hash. To obtain the hexadecimal representation of the
* hash, use the convenience method {@link Address#toMsgIndexHex}.
* @returns {Uint8Array}
*/
  toMsgIndex(): Uint8Array;
/**
* Generate the hash used to index the {@link Message} published in this address.
*
* Currently this hash is computed with {@link https://en.wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2|Blake2b256}.
* The returned String contains the hexadecimal digest of the hash. To obtain the binary digest of the hash,
* use the method {@link Address#toMsgIndex}.
* @returns {string}
*/
  toMsgIndexHex(): string;
/**
* Render the `Address` as a colon-separated String of the hex-encoded {@link Address#channelAddress} and
* {@link Address#msgId} (`<channelAddressHex>:<msgIdHex>`) suitable for exchanging the `Address` between
* participants. To convert the String back to an `Address`, use {@link Address.parse}.
*
* @see Address.parse
* @returns {string}
*/
  toString(): string;
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
  static parse(string: string): Address;
/**
* @returns {Address}
*/
  copy(): Address;
/**
* @returns {ChannelAddress}
*/
  readonly channelAddress: ChannelAddress;
/**
* @returns {MsgId}
*/
  readonly msgId: MsgId;
}
/**
*/
export class AddressGetter {
  free(): void;
/**
* @param {Client} client
* @param {string} seed
* @returns {AddressGetter}
*/
  static new(client: Client, seed: string): AddressGetter;
/**
* Set the account index
* @param {number} index
* @returns {AddressGetter}
*/
  accountIndex(index: number): AddressGetter;
/**
* Set the address range
* @param {number} start
* @param {number} end
* @returns {AddressGetter}
*/
  range(start: number, end: number): AddressGetter;
/**
* Set the bech32 hrp
* @param {string} bech32_hrp
* @returns {AddressGetter}
*/
  bech32Hrp(bech32_hrp: string): AddressGetter;
/**
* Include internal addresses
* @returns {AddressGetter}
*/
  includeInternal(): AddressGetter;
/**
* Get the addresses.
* @returns {Promise<any>}
*/
  get(): Promise<any>;
}
/**
*/
export class Author {
  free(): void;
/**
* @param {string} seed
* @param {SendOptions} options
* @param {number} implementation
*/
  constructor(seed: string, options: SendOptions, implementation: number);
/**
* @param {StreamsClient} client
* @param {string} seed
* @param {number} implementation
* @returns {Author}
*/
  static fromClient(client: StreamsClient, seed: string, implementation: number): Author;
/**
* @param {StreamsClient} client
* @param {Uint8Array} bytes
* @param {string} password
* @returns {Author}
*/
  static import(client: StreamsClient, bytes: Uint8Array, password: string): Author;
/**
* @param {string} password
* @returns {Uint8Array}
*/
  export(password: string): Uint8Array;
/**
* @param {string} seed
* @param {Address} ann_address
* @param {number} implementation
* @param {SendOptions} options
* @returns {Promise<Author>}
*/
  static recover(seed: string, ann_address: Address, implementation: number, options: SendOptions): Promise<Author>;
/**
* @returns {Author}
*/
  clone(): Author;
/**
* @returns {string}
*/
  channel_address(): string;
/**
* @returns {string | undefined}
*/
  announcementLink(): string | undefined;
/**
* @returns {boolean}
*/
  is_multi_branching(): boolean;
/**
* @returns {StreamsClient}
*/
  get_client(): StreamsClient;
/**
* @param {string} psk_seed_str
* @returns {string}
*/
  store_psk(psk_seed_str: string): string;
/**
* @returns {string}
*/
  get_public_key(): string;
/**
* @returns {Promise<UserResponse>}
*/
  send_announce(): Promise<UserResponse>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  send_keyload_for_everyone(link: Address): Promise<UserResponse>;
/**
* @param {Address} link
* @param {PskIds} psk_ids
* @param {PublicKeys} sig_pks
* @returns {Promise<UserResponse>}
*/
  send_keyload(link: Address, psk_ids: PskIds, sig_pks: PublicKeys): Promise<UserResponse>;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {Promise<UserResponse>}
*/
  send_tagged_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): Promise<UserResponse>;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {Promise<UserResponse>}
*/
  send_signed_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): Promise<UserResponse>;
/**
* @param {Address} link_to
* @returns {Promise<void>}
*/
  receive_subscribe(link_to: Address): Promise<void>;
/**
* @param {Address} link_to
* @returns {Promise<void>}
*/
  receive_unsubscribe(link_to: Address): Promise<void>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  receive_tagged_packet(link: Address): Promise<UserResponse>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  receive_signed_packet(link: Address): Promise<UserResponse>;
/**
* @param {Address} link
* @returns {Promise<Address>}
*/
  receive_sequence(link: Address): Promise<Address>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  receive_msg(link: Address): Promise<UserResponse>;
/**
* @param {Address} anchor_link
* @param {number} msg_num
* @returns {Promise<UserResponse>}
*/
  receive_msg_by_sequence_number(anchor_link: Address, msg_num: number): Promise<UserResponse>;
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
  syncState(): Promise<number>;
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
  fetchNextMsgs(): Promise<Array<any>>;
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
  fetchNextMsg(): Promise<UserResponse | undefined>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  fetch_prev_msg(link: Address): Promise<UserResponse>;
/**
* @param {Address} link
* @param {number} num_msgs
* @returns {Promise<Array<any>>}
*/
  fetch_prev_msgs(link: Address, num_msgs: number): Promise<Array<any>>;
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
  genNextMsgAddresses(): Array<any>;
/**
* @returns {Array<any>}
*/
  fetch_state(): Array<any>;
/**
*/
  reset_state(): void;
/**
* @param {string} pk_str
*/
  store_new_subscriber(pk_str: string): void;
/**
* @param {string} pk_str
*/
  remove_subscriber(pk_str: string): void;
/**
* @param {string} pskid_str
*/
  remove_psk(pskid_str: string): void;
}
/**
*/
export class BalanceGetter {
  free(): void;
/**
* @param {Client} client
* @param {string} seed
* @returns {BalanceGetter}
*/
  static new(client: Client, seed: string): BalanceGetter;
/**
* Sets the account index
* @param {number} index
* @returns {BalanceGetter}
*/
  accountIndex(index: number): BalanceGetter;
/**
* Sets the address index from which to start looking for balance
* @param {number} initial_address_index
* @returns {BalanceGetter}
*/
  initialAddressIndex(initial_address_index: number): BalanceGetter;
/**
* Sets the gap limit to specify how many addresses will be checked each round.
* If gap_limit amount of addresses in a row have no balance the function will return.
* @param {number} gap_limit
* @returns {BalanceGetter}
*/
  gap_limit(gap_limit: number): BalanceGetter;
/**
* Get the balance.
* @returns {Promise<any>}
*/
  get(): Promise<any>;
}
/**
* Channel application instance identifier (40 Byte)
*/
export class ChannelAddress {
  free(): void;
/**
* Render the `ChannelAddress` as a 40 Byte {@link https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array|Uint8Array}
*
* @see ChannelAddress#hex
* @returns {Uint8Array}
*/
  bytes(): Uint8Array;
/**
* Render the `ChannelAddress` as a 40 Byte (80 char) hexadecimal String
*
* @see ChannelAddress#bytes
* @returns {string}
*/
  hex(): string;
/**
* Render the `ChannelAddress` as an exchangeable String. Currently
* outputs the same as {@link ChannelAddress#hex}.
*
* @see ChannelAddress#hex
* @see ChannelAddress.parse
* @returns {string}
*/
  toString(): string;
/**
* Decode a `ChannelAddress` out of a String. The string must be a 80 char long hexadecimal string.
*
* @see ChannelAddress#toString
* @throws Throws error if string does not follow the expected format
* @param {string} string
* @returns {ChannelAddress}
*/
  static parse(string: string): ChannelAddress;
/**
* @returns {ChannelAddress}
*/
  copy(): ChannelAddress;
}
/**
*/
export class Client {
  free(): void;
/**
* Send a message to the Tangle.
* @returns {MessageBuilder}
*/
  message(): MessageBuilder;
/**
* Get a message from the Tangle.
* @returns {MessageGetter}
*/
  getMessage(): MessageGetter;
/**
* Generate addresses.
* @param {string} seed
* @returns {AddressGetter}
*/
  getAddresses(seed: string): AddressGetter;
/**
* Get an unspent address.
* @param {string} seed
* @returns {UnspentAddressGetter}
*/
  getUnspentAddress(seed: string): UnspentAddressGetter;
/**
* Get the account balance.
* @param {string} seed
* @returns {BalanceGetter}
*/
  getBalance(seed: string): BalanceGetter;
/**
* GET /api/v1/addresses/{address} endpoint
* @returns {GetAddressBuilder}
*/
  getAddress(): GetAddressBuilder;
/**
* Get the nodeinfo.
* @returns {Promise<any>}
*/
  getInfo(): Promise<any>;
/**
* Get the nodeinfo.
* @param {string} url
* @param {string | undefined} jwt
* @param {string | undefined} username
* @param {string | undefined} password
* @returns {Promise<any>}
*/
  getNodeInfo(url: string, jwt?: string, username?: string, password?: string): Promise<any>;
/**
* Gets the network related information such as network_id and min_pow_score
* and if it's the default one, sync it first.
* @returns {Promise<any>}
*/
  networkInfo(): Promise<any>;
/**
* Gets the network id of the node we're connecting to.
* @returns {Promise<any>}
*/
  getNetworkId(): Promise<any>;
/**
* returns the bech32_hrp
* @returns {Promise<any>}
*/
  getBech32Hrp(): Promise<any>;
/**
* returns the bech32_hrp
* @returns {Promise<any>}
*/
  getMinPowScore(): Promise<any>;
/**
* Get the node health.
* @returns {Promise<any>}
*/
  getHealth(): Promise<any>;
/**
* Get tips.
* @returns {Promise<any>}
*/
  getTips(): Promise<any>;
/**
* Get peers.
* @returns {Promise<any>}
*/
  getPeers(): Promise<any>;
/**
* GET /api/v1/outputs/{outputId} endpoint
* Find an output by its transaction_id and corresponding output_index.
* @param {string} output_id
* @returns {Promise<any>}
*/
  getOutput(output_id: string): Promise<any>;
/**
* Find all messages by provided message IDs and/or indexation_keys.
* @param {any} indexation_keys
* @param {any} message_ids
* @returns {Promise<any>}
*/
  findMessages(indexation_keys: any, message_ids: any): Promise<any>;
/**
* Function to find inputs from addresses for a provided amount (useful for offline signing)
* @param {any} addresses
* @param {BigInt} amount
* @returns {Promise<any>}
*/
  findInputs(addresses: any, amount: BigInt): Promise<any>;
/**
* Find all outputs based on the requests criteria. This method will try to query multiple nodes if
* the request amount exceeds individual node limit.
* @param {any} outputs
* @param {any} addresses
* @returns {Promise<any>}
*/
  findOutputs(outputs: any, addresses: any): Promise<any>;
/**
* Return the balance in iota for the given addresses; No seed needed to do this since we are only checking and
* already know the addresses.
* @param {any} addresses
* @returns {Promise<any>}
*/
  getAddressBalances(addresses: any): Promise<any>;
/**
* GET /api/v1/milestones/{index} endpoint
* Get the milestone by the given index.
* @param {number} index
* @returns {Promise<any>}
*/
  getMilestone(index: number): Promise<any>;
/**
* GET /api/v1/milestones/{index}/utxo-changes endpoint
* Get the milestone by the given index.
* @param {number} index
* @returns {Promise<any>}
*/
  getMilestoneUtxoChanges(index: number): Promise<any>;
/**
* GET /api/v1/receipts endpoint
* Get all receipts.
* @returns {Promise<any>}
*/
  getReceipts(): Promise<any>;
/**
* GET /api/v1/receipts/{migratedAt} endpoint
* Get the receipts by the given milestone index.
* @param {number} milestone_index
* @returns {Promise<any>}
*/
  getReceiptsMigratedAt(milestone_index: number): Promise<any>;
/**
* GET /api/v1/treasury endpoint
* Get the treasury output.
* @returns {Promise<any>}
*/
  getTreasury(): Promise<any>;
/**
* GET /api/v1/transactions/{transactionId}/included-message
* Returns the included message of the transaction.
* @param {string} transaction_id
* @returns {Promise<any>}
*/
  getIncludedMessage(transaction_id: string): Promise<any>;
/**
* Post message.
* @param {any} message
* @returns {Promise<any>}
*/
  postMessage(message: any): Promise<any>;
/**
* Retries (promotes or reattaches) a message for provided message id. Message should only be
* retried only if they are valid and haven't been confirmed for a while.
* @param {string} message_id
* @returns {Promise<any>}
*/
  retry(message_id: string): Promise<any>;
/**
* Only works in browser because of the timeouts
* Retries (promotes or reattaches) a message for provided message id until it's included (referenced by a
* milestone). Default interval is 5 seconds and max attempts is 40. Returns reattached messages
* @param {string} message_id
* @param {BigInt | undefined} interval
* @param {BigInt | undefined} max_attempts
* @returns {Promise<any>}
*/
  retryUntilIncluded(message_id: string, interval?: BigInt, max_attempts?: BigInt): Promise<any>;
/**
* Reattaches messages for provided message id. Messages can be reattached only if they are valid and haven't been
* confirmed for a while.
* @param {string} message_id
* @returns {Promise<any>}
*/
  reattach(message_id: string): Promise<any>;
/**
* Promotes a message. The method should validate if a promotion is necessary through get_message. If not, the
* method should error out and should not allow unnecessary promotions.
* @param {string} message_id
* @returns {Promise<any>}
*/
  promote(message_id: string): Promise<any>;
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
  consolidateFunds(seed: string, account_index: number, start_index: number, end_index: number): Promise<any>;
/**
* Returns a parsed hex String from bech32.
* @param {string} address
* @returns {string}
*/
  bech32ToHex(address: string): string;
/**
* Returns a parsed bech32 String from hex.
* @param {string} address
* @param {string | undefined} bech32
* @returns {Promise<any>}
*/
  hexToBech32(address: string, bech32?: string): Promise<any>;
/**
* Transforms a hex encoded public key to a bech32 encoded address
* @param {string} public_key
* @param {string | undefined} bech32
* @returns {Promise<any>}
*/
  hexPublicKeyToBech32Address(public_key: string, bech32?: string): Promise<any>;
/**
* Checks if a String is a valid bech32 encoded address.
* @param {string} address
* @returns {boolean}
*/
  isAddressValid(address: string): boolean;
/**
* Generates a new mnemonic.
* @returns {string}
*/
  generateMnemonic(): string;
/**
* Returns a hex encoded seed for a mnemonic.
* @param {string} mnemonic
* @returns {string}
*/
  mnemonicToHexSeed(mnemonic: string): string;
/**
* Returns the message id from a provided message.
* @param {string} message
* @returns {string}
*/
  getMessageId(message: string): string;
/**
* Returns the transaction id from a provided transaction payload.
* @param {string} transaction
* @returns {string}
*/
  getTransactionId(transaction: string): string;
}
/**
*/
export class ClientBuilder {
  free(): void;
/**
* Creates an IOTA client builder.
*/
  constructor();
/**
* Adds an IOTA node by its URL.
* @param {string} url
* @returns {ClientBuilder}
*/
  node(url: string): ClientBuilder;
/**
* Adds an IOTA node by its URL to be used as primary node, with optional jwt and or basic authentication
* @param {string} url
* @param {string | undefined} jwt
* @param {string | undefined} username
* @param {string | undefined} password
* @returns {ClientBuilder}
*/
  primaryNode(url: string, jwt?: string, username?: string, password?: string): ClientBuilder;
/**
* Adds an IOTA node by its URL to be used as primary PoW node (for remote PoW), with optional jwt and or basic
* authentication
* @param {string} url
* @param {string | undefined} jwt
* @param {string | undefined} username
* @param {string | undefined} password
* @returns {ClientBuilder}
*/
  primaryPowNode(url: string, jwt?: string, username?: string, password?: string): ClientBuilder;
/**
* Adds a permanode by its URL, with optional jwt and or basic authentication
* @param {string} url
* @param {string | undefined} jwt
* @param {string | undefined} username
* @param {string | undefined} password
* @returns {ClientBuilder}
*/
  permanode(url: string, jwt?: string, username?: string, password?: string): ClientBuilder;
/**
* Adds an IOTA node by its URL with optional jwt and or basic authentication
* @param {string} url
* @param {string | undefined} jwt
* @param {string | undefined} username
* @param {string | undefined} password
* @returns {ClientBuilder}
*/
  nodeAuth(url: string, jwt?: string, username?: string, password?: string): ClientBuilder;
/**
* Adds a list of IOTA nodes by their URLs.
* @param {any} urls
* @returns {ClientBuilder}
*/
  nodes(urls: any): ClientBuilder;
/**
* Set the node sync interval (has no effect because we can't spawn another thread in wasm to sync the nodes)
* @param {number} value
* @returns {ClientBuilder}
*/
  nodeSyncInterval(value: number): ClientBuilder;
/**
* Disables the node syncing process.
* Every node will be considered healthy and ready to use.
* @returns {ClientBuilder}
*/
  nodeSyncDisabled(): ClientBuilder;
/**
* Allows creating the client without nodes for offline address generation or signing
* @returns {ClientBuilder}
*/
  offlineMode(): ClientBuilder;
/**
* Get node list from the node_pool_urls
* @param {any} node_pool_urls
* @returns {Promise<any>}
*/
  nodePoolUrls(node_pool_urls: any): Promise<any>;
/**
* Set if quroum should be used or not
* @param {boolean} value
* @returns {ClientBuilder}
*/
  quorum(value: boolean): ClientBuilder;
/**
* Set amount of nodes which should be used for quorum
* @param {number} value
* @returns {ClientBuilder}
*/
  quorumSize(value: number): ClientBuilder;
/**
* Set quorum_threshold
* @param {number} value
* @returns {ClientBuilder}
*/
  quorumThreshold(value: number): ClientBuilder;
/**
* Selects the type of network to get default nodes for it, only "testnet" is supported at the moment.
* Nodes that don't belong to this network are ignored. Default nodes are only used when no other nodes are
* provided.
* @param {string} network
* @returns {ClientBuilder}
*/
  network(network: string): ClientBuilder;
/**
* Since we can only have a single thread in wasm, local PoW is much slower
* @param {boolean} value
* @returns {ClientBuilder}
*/
  localPow(value: boolean): ClientBuilder;
/**
* Sets after how many seconds new tips will be requested during PoW
* @param {number} value
* @returns {ClientBuilder}
*/
  tipsInterval(value: number): ClientBuilder;
/**
* Sets the default request timeout.
* @param {number} value
* @returns {ClientBuilder}
*/
  requestTimeout(value: number): ClientBuilder;
/**
* Sets the request timeout for a specific API usage.
* @param {string} api
* @param {number} timeout
* @returns {ClientBuilder}
*/
  apiTimeout(api: string, timeout: number): ClientBuilder;
/**
* Build the client.
* @returns {Promise<any>}
*/
  build(): Promise<any>;
}
/**
*/
export class Cursor {
  free(): void;
}
/**
*/
export class Details {
  free(): void;
/**
* @returns {MessageMetadata}
*/
  get_metadata(): MessageMetadata;
/**
* @returns {MilestoneResponse | undefined}
*/
  get_milestone(): MilestoneResponse | undefined;
}
/**
*/
export class GetAddressBuilder {
  free(): void;
/**
* @param {Client} client
* @returns {GetAddressBuilder}
*/
  static new(client: Client): GetAddressBuilder;
/**
* Consume the builder and get the balance of a given Bech32 encoded address.
* If count equals maxResults, then there might be more outputs available but those were skipped for performance
* reasons. User should sweep the address to reduce the amount of outputs.
* @param {string} address
* @returns {Promise<any>}
*/
  balance(address: string): Promise<any>;
/**
* Consume the builder and get all outputs that use a given address.
* If count equals maxResults, then there might be more outputs available but those were skipped for performance
* reasons. User should sweep the address to reduce the amount of outputs.
* @param {string} address
* @param {any} options
* @returns {Promise<any>}
*/
  outputs(address: string, options: any): Promise<any>;
}
/**
*/
export class Message {
  free(): void;
/**
* @returns {Message}
*/
  static default(): Message;
/**
* @param {string | undefined} identifier
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {Message}
*/
  static new(identifier: string | undefined, public_payload: Uint8Array, masked_payload: Uint8Array): Message;
/**
* @returns {string}
*/
  get_identifier(): string;
/**
* @returns {Array<any>}
*/
  get_public_payload(): Array<any>;
/**
* @returns {Array<any>}
*/
  get_masked_payload(): Array<any>;
}
/**
*/
export class MessageBuilder {
  free(): void;
/**
* @param {Client} client
* @returns {MessageBuilder}
*/
  static new(client: Client): MessageBuilder;
/**
* Set indexation to the builder
* @param {Uint8Array} index
* @returns {MessageBuilder}
*/
  index(index: Uint8Array): MessageBuilder;
/**
* Set data to the builder
* @param {Uint8Array} data
* @returns {MessageBuilder}
*/
  data(data: Uint8Array): MessageBuilder;
/**
* Sets the seed.
* @param {string} seed
* @returns {MessageBuilder}
*/
  seed(seed: string): MessageBuilder;
/**
* Sets the account index.
* @param {number} account_index
* @returns {MessageBuilder}
*/
  accountIndex(account_index: number): MessageBuilder;
/**
* Sets the index of the address to start looking for balance.
* @param {number} initial_address_index
* @returns {MessageBuilder}
*/
  initialAddressIndex(initial_address_index: number): MessageBuilder;
/**
* Set 1-8 custom parent message ids
* @param {any} parents
* @returns {MessageBuilder}
*/
  parents(parents: any): MessageBuilder;
/**
* Set a custom input(transaction output)
* @param {string} output_id
* @returns {MessageBuilder}
*/
  input(output_id: string): MessageBuilder;
/**
* Set a custom range in which to search for addresses for custom provided inputs. Default: 0..100
* @param {number} start
* @param {number} end
* @returns {MessageBuilder}
*/
  inputRange(start: number, end: number): MessageBuilder;
/**
* Set a transfer to the builder
* @param {string} address
* @param {BigInt} amount
* @returns {MessageBuilder}
*/
  output(address: string, amount: BigInt): MessageBuilder;
/**
* Set a dust allowance transfer to the builder, address needs to be Bech32 encoded
* @param {string} address
* @param {BigInt} amount
* @returns {MessageBuilder}
*/
  dustAllowanceOutput(address: string, amount: BigInt): MessageBuilder;
/**
* Prepare a transaction
* @returns {Promise<any>}
*/
  prepareTransaction(): Promise<any>;
/**
* Sign a transaction
* @param {any} prepared_transaction_data
* @param {string} seed
* @param {number | undefined} input_range_start
* @param {number | undefined} input_range_end
* @returns {Promise<any>}
*/
  signTransaction(prepared_transaction_data: any, seed: string, input_range_start?: number, input_range_end?: number): Promise<any>;
/**
* Create a message with a provided payload
* @param {any} payload
* @returns {Promise<any>}
*/
  finishMessage(payload: any): Promise<any>;
/**
* Build and sumbit the message.
* @returns {Promise<any>}
*/
  submit(): Promise<any>;
}
/**
*/
export class MessageGetter {
  free(): void;
/**
* @param {Client} client
* @returns {MessageGetter}
*/
  static new(client: Client): MessageGetter;
/**
* Get message ids with an index.
* @param {Uint8Array} index
* @returns {Promise<any>}
*/
  index(index: Uint8Array): Promise<any>;
/**
* Get a message with the message id.
* @param {string} message_id
* @returns {Promise<any>}
*/
  data(message_id: string): Promise<any>;
/**
* Get the raw message with the message id.
* @param {string} message_id
* @returns {Promise<any>}
*/
  raw(message_id: string): Promise<any>;
/**
* Get the childrens of a message with the message id.
* @param {string} message_id
* @returns {Promise<any>}
*/
  children(message_id: string): Promise<any>;
/**
* Get the metadata of a message with the message id.
* @param {string} message_id
* @returns {Promise<any>}
*/
  metadata(message_id: string): Promise<any>;
}
/**
*/
export class MessageMetadata {
  free(): void;
/**
*/
  conflict_reason?: number;
/**
* @returns {Array<any>}
*/
  readonly get_parent_message_ids: Array<any>;
/**
*/
  is_solid: boolean;
/**
*/
  ledger_inclusion_state?: number;
/**
* @returns {string}
*/
  readonly message_id: string;
/**
*/
  milestone_index?: number;
/**
*/
  referenced_by_milestone_index?: number;
/**
*/
  should_promote?: boolean;
/**
*/
  should_reattach?: boolean;
}
/**
*/
export class MilestoneResponse {
  free(): void;
/**
* Milestone index.
*/
  index: number;
/**
* @returns {string}
*/
  readonly message_id: string;
/**
* Milestone timestamp.
*/
  timestamp: BigInt;
}
/**
* Message identifier (12 Byte). Unique within a Channel.
*/
export class MsgId {
  free(): void;
/**
* Render the `MsgId` as a 12 Byte {@link https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array|Uint8Array}
*
* @see MsgId#hex
* @returns {Uint8Array}
*/
  bytes(): Uint8Array;
/**
* Render the `MsgId` as a 12 Byte (24 char) hexadecimal String
*
* @see MsgId#bytes
* @returns {string}
*/
  hex(): string;
/**
* Render the `MsgId` as an exchangeable String. Currently
* outputs the same as {@link MsgId#hex}.
*
* @see MsgId#hex
* @see MsgId.parse
* @returns {string}
*/
  toString(): string;
/**
* Decode a `MsgId` out of a String. The string must be a 24 char long hexadecimal string.
*
* @see Msgid#toString
* @throws Throws error if string does not follow the expected format
* @param {string} string
* @returns {MsgId}
*/
  static parse(string: string): MsgId;
/**
* @returns {MsgId}
*/
  copy(): MsgId;
}
/**
*/
export class NextMsgAddress {
  free(): void;
/**
* @param {string} identifier
* @param {Address} address
* @returns {NextMsgAddress}
*/
  static new(identifier: string, address: Address): NextMsgAddress;
/**
*/
  address: Address;
/**
*/
  identifier: string;
}
/**
*/
export class PskIds {
  free(): void;
/**
* @returns {PskIds}
*/
  static new(): PskIds;
/**
* @param {string} id
*/
  add(id: string): void;
/**
* @returns {Array<any>}
*/
  get_ids(): Array<any>;
}
/**
* Collection of PublicKeys representing a set of users
*/
export class PublicKeys {
  free(): void;
/**
*/
  constructor();
/**
* Add key to collection   
*
* Key must be a valid 32 Byte public-key string in its hexadecimal representation.
*
* @throws Throws error if string is not a valid public key
* @param {string} id
*/
  add(id: string): void;
/**
* Obtain all the public-keys collected so far in an string array
* @returns {Array<any>}
*/
  get_pks(): Array<any>;
}
/**
*/
export class SendOptions {
  free(): void;
/**
* @param {string} url
* @param {boolean} local_pow
*/
  constructor(url: string, local_pow: boolean);
/**
* @returns {SendOptions}
*/
  clone(): SendOptions;
/**
*/
  local_pow: boolean;
/**
* @returns {string}
*/
  url: string;
}
/**
*/
export class StreamsClient {
  free(): void;
/**
* @param {string} node
* @param {SendOptions} options
*/
  constructor(node: string, options: SendOptions);
/**
* @param {Client} client
* @returns {StreamsClient}
*/
  static fromClient(client: Client): StreamsClient;
/**
* @param {Address} link
* @returns {Promise<any>}
*/
  get_link_details(link: Address): Promise<any>;
}
/**
*/
export class Subscriber {
  free(): void;
/**
* @param {string} seed
* @param {SendOptions} options
*/
  constructor(seed: string, options: SendOptions);
/**
* @param {StreamsClient} client
* @param {string} seed
* @returns {Subscriber}
*/
  static fromClient(client: StreamsClient, seed: string): Subscriber;
/**
* @param {StreamsClient} client
* @param {Uint8Array} bytes
* @param {string} password
* @returns {Subscriber}
*/
  static import(client: StreamsClient, bytes: Uint8Array, password: string): Subscriber;
/**
* @returns {Subscriber}
*/
  clone(): Subscriber;
/**
* @returns {string}
*/
  channel_address(): string;
/**
* @returns {string | undefined}
*/
  announcementLink(): string | undefined;
/**
* @returns {StreamsClient}
*/
  get_client(): StreamsClient;
/**
* @returns {boolean}
*/
  is_multi_branching(): boolean;
/**
* @param {string} psk_seed_str
* @returns {string}
*/
  store_psk(psk_seed_str: string): string;
/**
* @returns {string}
*/
  get_public_key(): string;
/**
* @returns {string}
*/
  author_public_key(): string;
/**
* @returns {boolean}
*/
  is_registered(): boolean;
/**
*/
  unregister(): void;
/**
* @param {string} password
* @returns {Uint8Array}
*/
  export(password: string): Uint8Array;
/**
* @param {Address} link
* @returns {Promise<void>}
*/
  receive_announcement(link: Address): Promise<void>;
/**
* @param {Address} link
* @returns {Promise<boolean>}
*/
  receive_keyload(link: Address): Promise<boolean>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  receive_tagged_packet(link: Address): Promise<UserResponse>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  receive_signed_packet(link: Address): Promise<UserResponse>;
/**
* @param {Address} link
* @returns {Promise<Address>}
*/
  receive_sequence(link: Address): Promise<Address>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  receive_msg(link: Address): Promise<UserResponse>;
/**
* @param {Address} anchor_link
* @param {number} msg_num
* @returns {Promise<UserResponse>}
*/
  receive_msg_by_sequence_number(anchor_link: Address, msg_num: number): Promise<UserResponse>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  send_subscribe(link: Address): Promise<UserResponse>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  send_unsubscribe(link: Address): Promise<UserResponse>;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {Promise<UserResponse>}
*/
  send_tagged_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): Promise<UserResponse>;
/**
* @param {Address} link
* @param {Uint8Array} public_payload
* @param {Uint8Array} masked_payload
* @returns {Promise<UserResponse>}
*/
  send_signed_packet(link: Address, public_payload: Uint8Array, masked_payload: Uint8Array): Promise<UserResponse>;
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
  syncState(): Promise<number>;
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
  fetchNextMsgs(): Promise<Array<any>>;
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
  fetchNextMsg(): Promise<UserResponse | undefined>;
/**
* @param {Address} link
* @returns {Promise<UserResponse>}
*/
  fetch_prev_msg(link: Address): Promise<UserResponse>;
/**
* @param {Address} link
* @param {number} num_msgs
* @returns {Promise<Array<any>>}
*/
  fetch_prev_msgs(link: Address, num_msgs: number): Promise<Array<any>>;
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
  genNextMsgAddresses(): Array<any>;
/**
* @returns {Array<any>}
*/
  fetch_state(): Array<any>;
/**
*/
  reset_state(): void;
/**
* @param {string} pskid_str
*/
  remove_psk(pskid_str: string): void;
}
/**
*/
export class UnspentAddressGetter {
  free(): void;
/**
* @param {Client} client
* @param {string} seed
* @returns {UnspentAddressGetter}
*/
  static new(client: Client, seed: string): UnspentAddressGetter;
/**
* Sets the account index
* @param {number} index
* @returns {UnspentAddressGetter}
*/
  accountIndex(index: number): UnspentAddressGetter;
/**
* Sets the index of the address to start looking for balance
* @param {number} index
* @returns {UnspentAddressGetter}
*/
  initialAddressIndex(index: number): UnspentAddressGetter;
/**
* Get an unspent address with its index.
* @returns {Promise<any>}
*/
  get(): Promise<any>;
}
/**
*/
export class UserResponse {
  free(): void;
/**
* @param {Address} link
* @param {Address | undefined} seq_link
* @param {Message | undefined} message
* @returns {UserResponse}
*/
  static new(link: Address, seq_link?: Address, message?: Message): UserResponse;
/**
* @param {string} link
* @param {string | undefined} seq_link
* @param {Message | undefined} message
* @returns {UserResponse}
*/
  static fromStrings(link: string, seq_link?: string, message?: Message): UserResponse;
/**
* @returns {UserResponse}
*/
  copy(): UserResponse;
/**
* @returns {Address}
*/
  readonly link: Address;
/**
* @returns {Message | undefined}
*/
  readonly message: Message | undefined;
/**
* @returns {Address | undefined}
*/
  readonly seqLink: Address | undefined;
}
/**
*/
export class UserState {
  free(): void;
/**
* @param {string} identifier
* @param {Cursor} cursor
* @returns {UserState}
*/
  static new(identifier: string, cursor: Cursor): UserState;
/**
* @returns {number}
*/
  readonly branchNo: number;
/**
* @returns {string}
*/
  readonly identifier: string;
/**
* @returns {Address}
*/
  readonly link: Address;
/**
* @returns {number}
*/
  readonly seqNo: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_author_free: (a: number) => void;
  readonly author_new: (a: number, b: number, c: number, d: number) => number;
  readonly author_fromClient: (a: number, b: number, c: number, d: number) => number;
  readonly author_import: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly author_export: (a: number, b: number, c: number, d: number) => void;
  readonly author_recover: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly author_clone: (a: number) => number;
  readonly author_channel_address: (a: number, b: number) => void;
  readonly author_announcementLink: (a: number, b: number) => void;
  readonly author_is_multi_branching: (a: number, b: number) => void;
  readonly author_get_client: (a: number) => number;
  readonly author_store_psk: (a: number, b: number, c: number, d: number) => void;
  readonly author_get_public_key: (a: number, b: number) => void;
  readonly author_send_announce: (a: number) => number;
  readonly author_send_keyload_for_everyone: (a: number, b: number) => number;
  readonly author_send_keyload: (a: number, b: number, c: number, d: number) => number;
  readonly author_send_tagged_packet: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly author_send_signed_packet: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly author_receive_subscribe: (a: number, b: number) => number;
  readonly author_receive_unsubscribe: (a: number, b: number) => number;
  readonly author_receive_tagged_packet: (a: number, b: number) => number;
  readonly author_receive_signed_packet: (a: number, b: number) => number;
  readonly author_receive_sequence: (a: number, b: number) => number;
  readonly author_receive_msg: (a: number, b: number) => number;
  readonly author_receive_msg_by_sequence_number: (a: number, b: number, c: number) => number;
  readonly author_syncState: (a: number) => number;
  readonly author_fetchNextMsgs: (a: number) => number;
  readonly author_fetchNextMsg: (a: number) => number;
  readonly author_fetch_prev_msg: (a: number, b: number) => number;
  readonly author_fetch_prev_msgs: (a: number, b: number, c: number) => number;
  readonly author_genNextMsgAddresses: (a: number) => number;
  readonly author_fetch_state: (a: number, b: number) => void;
  readonly author_reset_state: (a: number, b: number) => void;
  readonly author_store_new_subscriber: (a: number, b: number, c: number, d: number) => void;
  readonly author_remove_subscriber: (a: number, b: number, c: number, d: number) => void;
  readonly author_remove_psk: (a: number, b: number, c: number, d: number) => void;
  readonly __wbg_streamsclient_free: (a: number) => void;
  readonly streamsclient_new: (a: number, b: number, c: number) => number;
  readonly streamsclient_fromClient: (a: number) => number;
  readonly streamsclient_get_link_details: (a: number, b: number) => number;
  readonly __wbg_sendoptions_free: (a: number) => void;
  readonly __wbg_get_sendoptions_local_pow: (a: number) => number;
  readonly __wbg_set_sendoptions_local_pow: (a: number, b: number) => void;
  readonly sendoptions_new: (a: number, b: number, c: number) => number;
  readonly sendoptions_set_url: (a: number, b: number, c: number) => void;
  readonly sendoptions_clone: (a: number) => number;
  readonly __wbg_address_free: (a: number) => void;
  readonly address_new: (a: number, b: number) => number;
  readonly address_channelAddress: (a: number) => number;
  readonly address_msgId: (a: number) => number;
  readonly address_toMsgIndex: (a: number, b: number) => void;
  readonly address_toMsgIndexHex: (a: number, b: number) => void;
  readonly address_toString: (a: number, b: number) => void;
  readonly address_parse: (a: number, b: number, c: number) => void;
  readonly address_copy: (a: number) => number;
  readonly __wbg_channeladdress_free: (a: number) => void;
  readonly channeladdress_bytes: (a: number, b: number) => void;
  readonly channeladdress_hex: (a: number, b: number) => void;
  readonly channeladdress_toString: (a: number, b: number) => void;
  readonly channeladdress_parse: (a: number, b: number, c: number) => void;
  readonly __wbg_msgid_free: (a: number) => void;
  readonly msgid_bytes: (a: number, b: number) => void;
  readonly msgid_hex: (a: number, b: number) => void;
  readonly msgid_toString: (a: number, b: number) => void;
  readonly msgid_parse: (a: number, b: number, c: number) => void;
  readonly msgid_copy: (a: number) => number;
  readonly __wbg_userresponse_free: (a: number) => void;
  readonly __wbg_nextmsgaddress_free: (a: number) => void;
  readonly __wbg_get_nextmsgaddress_identifier: (a: number, b: number) => void;
  readonly __wbg_set_nextmsgaddress_identifier: (a: number, b: number, c: number) => void;
  readonly __wbg_get_nextmsgaddress_address: (a: number) => number;
  readonly __wbg_set_nextmsgaddress_address: (a: number, b: number) => void;
  readonly __wbg_userstate_free: (a: number) => void;
  readonly __wbg_cursor_free: (a: number) => void;
  readonly userstate_new: (a: number, b: number, c: number) => number;
  readonly userstate_link: (a: number) => number;
  readonly userstate_seqNo: (a: number) => number;
  readonly userstate_branchNo: (a: number) => number;
  readonly __wbg_pskids_free: (a: number) => void;
  readonly pskids_new: () => number;
  readonly pskids_add: (a: number, b: number, c: number, d: number) => void;
  readonly pskids_get_ids: (a: number) => number;
  readonly __wbg_publickeys_free: (a: number) => void;
  readonly publickeys_new: () => number;
  readonly publickeys_add: (a: number, b: number, c: number, d: number) => void;
  readonly publickeys_get_pks: (a: number) => number;
  readonly __wbg_message_free: (a: number) => void;
  readonly message_default: () => number;
  readonly message_new: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly message_get_identifier: (a: number, b: number) => void;
  readonly message_get_public_payload: (a: number) => number;
  readonly message_get_masked_payload: (a: number) => number;
  readonly nextmsgaddress_new: (a: number, b: number, c: number) => number;
  readonly userresponse_new: (a: number, b: number, c: number) => number;
  readonly userresponse_fromStrings: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly userresponse_copy: (a: number) => number;
  readonly userresponse_link: (a: number) => number;
  readonly userresponse_seqLink: (a: number) => number;
  readonly userresponse_message: (a: number) => number;
  readonly __wbg_details_free: (a: number) => void;
  readonly details_get_metadata: (a: number) => number;
  readonly details_get_milestone: (a: number) => number;
  readonly __wbg_messagemetadata_free: (a: number) => void;
  readonly __wbg_get_messagemetadata_is_solid: (a: number) => number;
  readonly __wbg_set_messagemetadata_is_solid: (a: number, b: number) => void;
  readonly __wbg_get_messagemetadata_referenced_by_milestone_index: (a: number, b: number) => void;
  readonly __wbg_set_messagemetadata_referenced_by_milestone_index: (a: number, b: number, c: number) => void;
  readonly __wbg_get_messagemetadata_milestone_index: (a: number, b: number) => void;
  readonly __wbg_set_messagemetadata_milestone_index: (a: number, b: number, c: number) => void;
  readonly __wbg_get_messagemetadata_ledger_inclusion_state: (a: number) => number;
  readonly __wbg_set_messagemetadata_ledger_inclusion_state: (a: number, b: number) => void;
  readonly __wbg_get_messagemetadata_conflict_reason: (a: number) => number;
  readonly __wbg_set_messagemetadata_conflict_reason: (a: number, b: number) => void;
  readonly __wbg_get_messagemetadata_should_promote: (a: number) => number;
  readonly __wbg_set_messagemetadata_should_promote: (a: number, b: number) => void;
  readonly __wbg_get_messagemetadata_should_reattach: (a: number) => number;
  readonly __wbg_set_messagemetadata_should_reattach: (a: number, b: number) => void;
  readonly messagemetadata_message_id: (a: number, b: number) => void;
  readonly messagemetadata_get_parent_message_ids: (a: number) => number;
  readonly __wbg_milestoneresponse_free: (a: number) => void;
  readonly __wbg_get_milestoneresponse_index: (a: number) => number;
  readonly __wbg_set_milestoneresponse_index: (a: number, b: number) => void;
  readonly __wbg_get_milestoneresponse_timestamp: (a: number, b: number) => void;
  readonly __wbg_set_milestoneresponse_timestamp: (a: number, b: number, c: number) => void;
  readonly milestoneresponse_message_id: (a: number, b: number) => void;
  readonly channeladdress_copy: (a: number) => number;
  readonly userstate_identifier: (a: number, b: number) => void;
  readonly sendoptions_url: (a: number, b: number) => void;
  readonly __wbg_subscriber_free: (a: number) => void;
  readonly subscriber_new: (a: number, b: number, c: number) => number;
  readonly subscriber_fromClient: (a: number, b: number, c: number) => number;
  readonly subscriber_import: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly subscriber_clone: (a: number) => number;
  readonly subscriber_channel_address: (a: number, b: number) => void;
  readonly subscriber_announcementLink: (a: number, b: number) => void;
  readonly subscriber_get_client: (a: number) => number;
  readonly subscriber_is_multi_branching: (a: number, b: number) => void;
  readonly subscriber_store_psk: (a: number, b: number, c: number, d: number) => void;
  readonly subscriber_get_public_key: (a: number, b: number) => void;
  readonly subscriber_author_public_key: (a: number, b: number) => void;
  readonly subscriber_is_registered: (a: number, b: number) => void;
  readonly subscriber_unregister: (a: number, b: number) => void;
  readonly subscriber_export: (a: number, b: number, c: number, d: number) => void;
  readonly subscriber_receive_announcement: (a: number, b: number) => number;
  readonly subscriber_receive_keyload: (a: number, b: number) => number;
  readonly subscriber_receive_tagged_packet: (a: number, b: number) => number;
  readonly subscriber_receive_signed_packet: (a: number, b: number) => number;
  readonly subscriber_receive_sequence: (a: number, b: number) => number;
  readonly subscriber_receive_msg: (a: number, b: number) => number;
  readonly subscriber_receive_msg_by_sequence_number: (a: number, b: number, c: number) => number;
  readonly subscriber_send_subscribe: (a: number, b: number) => number;
  readonly subscriber_send_unsubscribe: (a: number, b: number) => number;
  readonly subscriber_send_tagged_packet: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly subscriber_send_signed_packet: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly subscriber_syncState: (a: number) => number;
  readonly subscriber_fetchNextMsgs: (a: number) => number;
  readonly subscriber_fetchNextMsg: (a: number) => number;
  readonly subscriber_fetch_prev_msg: (a: number, b: number) => number;
  readonly subscriber_fetch_prev_msgs: (a: number, b: number, c: number) => number;
  readonly subscriber_genNextMsgAddresses: (a: number) => number;
  readonly subscriber_fetch_state: (a: number, b: number) => void;
  readonly subscriber_reset_state: (a: number, b: number) => void;
  readonly subscriber_remove_psk: (a: number, b: number, c: number, d: number) => void;
  readonly set_panic_hook: () => void;
  readonly __wbg_addressgetter_free: (a: number) => void;
  readonly addressgetter_new: (a: number, b: number, c: number) => number;
  readonly addressgetter_accountIndex: (a: number, b: number, c: number) => void;
  readonly addressgetter_range: (a: number, b: number, c: number, d: number) => void;
  readonly addressgetter_bech32Hrp: (a: number, b: number, c: number, d: number) => void;
  readonly addressgetter_includeInternal: (a: number, b: number) => void;
  readonly addressgetter_get: (a: number, b: number) => void;
  readonly __wbg_messagegetter_free: (a: number) => void;
  readonly messagegetter_new: (a: number) => number;
  readonly messagegetter_index: (a: number, b: number, c: number, d: number) => void;
  readonly messagegetter_data: (a: number, b: number, c: number, d: number) => void;
  readonly messagegetter_raw: (a: number, b: number, c: number, d: number) => void;
  readonly messagegetter_children: (a: number, b: number, c: number, d: number) => void;
  readonly messagegetter_metadata: (a: number, b: number, c: number, d: number) => void;
  readonly __wbg_client_free: (a: number) => void;
  readonly client_message: (a: number) => number;
  readonly client_getAddresses: (a: number, b: number, c: number) => number;
  readonly client_getUnspentAddress: (a: number, b: number, c: number) => number;
  readonly client_getBalance: (a: number, b: number, c: number) => number;
  readonly client_getAddress: (a: number) => number;
  readonly client_getInfo: (a: number, b: number) => void;
  readonly client_getNodeInfo: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly client_networkInfo: (a: number, b: number) => void;
  readonly client_getNetworkId: (a: number, b: number) => void;
  readonly client_getBech32Hrp: (a: number, b: number) => void;
  readonly client_getMinPowScore: (a: number, b: number) => void;
  readonly client_getHealth: (a: number, b: number) => void;
  readonly client_getTips: (a: number, b: number) => void;
  readonly client_getPeers: (a: number, b: number) => void;
  readonly client_getOutput: (a: number, b: number, c: number, d: number) => void;
  readonly client_findMessages: (a: number, b: number, c: number, d: number) => void;
  readonly client_findInputs: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly client_findOutputs: (a: number, b: number, c: number, d: number) => void;
  readonly client_getAddressBalances: (a: number, b: number, c: number) => void;
  readonly client_getMilestone: (a: number, b: number, c: number) => void;
  readonly client_getMilestoneUtxoChanges: (a: number, b: number, c: number) => void;
  readonly client_getReceipts: (a: number, b: number) => void;
  readonly client_getReceiptsMigratedAt: (a: number, b: number, c: number) => void;
  readonly client_getTreasury: (a: number, b: number) => void;
  readonly client_getIncludedMessage: (a: number, b: number, c: number, d: number) => void;
  readonly client_postMessage: (a: number, b: number, c: number) => void;
  readonly client_retry: (a: number, b: number, c: number, d: number) => void;
  readonly client_retryUntilIncluded: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly client_reattach: (a: number, b: number, c: number, d: number) => void;
  readonly client_promote: (a: number, b: number, c: number, d: number) => void;
  readonly client_consolidateFunds: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
  readonly client_bech32ToHex: (a: number, b: number, c: number, d: number) => void;
  readonly client_hexToBech32: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly client_hexPublicKeyToBech32Address: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly client_isAddressValid: (a: number, b: number, c: number) => number;
  readonly client_generateMnemonic: (a: number, b: number) => void;
  readonly client_mnemonicToHexSeed: (a: number, b: number, c: number, d: number) => void;
  readonly client_getMessageId: (a: number, b: number, c: number, d: number) => void;
  readonly client_getTransactionId: (a: number, b: number, c: number, d: number) => void;
  readonly client_getMessage: (a: number) => number;
  readonly __wbg_getaddressbuilder_free: (a: number) => void;
  readonly getaddressbuilder_new: (a: number) => number;
  readonly getaddressbuilder_balance: (a: number, b: number, c: number, d: number) => void;
  readonly getaddressbuilder_outputs: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly start: () => void;
  readonly __wbg_balancegetter_free: (a: number) => void;
  readonly balancegetter_new: (a: number, b: number, c: number) => number;
  readonly balancegetter_accountIndex: (a: number, b: number, c: number) => void;
  readonly balancegetter_initialAddressIndex: (a: number, b: number, c: number) => void;
  readonly balancegetter_gap_limit: (a: number, b: number, c: number) => void;
  readonly balancegetter_get: (a: number, b: number) => void;
  readonly __wbg_clientbuilder_free: (a: number) => void;
  readonly clientbuilder_new: () => number;
  readonly clientbuilder_node: (a: number, b: number, c: number, d: number) => void;
  readonly clientbuilder_primaryNode: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly clientbuilder_primaryPowNode: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly clientbuilder_permanode: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly clientbuilder_nodeAuth: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => void;
  readonly clientbuilder_nodes: (a: number, b: number, c: number) => void;
  readonly clientbuilder_nodeSyncInterval: (a: number, b: number, c: number) => void;
  readonly clientbuilder_nodeSyncDisabled: (a: number, b: number) => void;
  readonly clientbuilder_offlineMode: (a: number, b: number) => void;
  readonly clientbuilder_nodePoolUrls: (a: number, b: number, c: number) => void;
  readonly clientbuilder_quorum: (a: number, b: number, c: number) => void;
  readonly clientbuilder_quorumSize: (a: number, b: number, c: number) => void;
  readonly clientbuilder_quorumThreshold: (a: number, b: number, c: number) => void;
  readonly clientbuilder_network: (a: number, b: number, c: number, d: number) => void;
  readonly clientbuilder_localPow: (a: number, b: number, c: number) => void;
  readonly clientbuilder_tipsInterval: (a: number, b: number, c: number) => void;
  readonly clientbuilder_requestTimeout: (a: number, b: number, c: number) => void;
  readonly clientbuilder_apiTimeout: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly clientbuilder_build: (a: number, b: number) => void;
  readonly __wbg_unspentaddressgetter_free: (a: number) => void;
  readonly unspentaddressgetter_new: (a: number, b: number, c: number) => number;
  readonly unspentaddressgetter_accountIndex: (a: number, b: number, c: number) => void;
  readonly unspentaddressgetter_initialAddressIndex: (a: number, b: number, c: number) => void;
  readonly unspentaddressgetter_get: (a: number, b: number) => void;
  readonly __wbg_messagebuilder_free: (a: number) => void;
  readonly messagebuilder_new: (a: number) => number;
  readonly messagebuilder_index: (a: number, b: number, c: number, d: number) => void;
  readonly messagebuilder_data: (a: number, b: number, c: number, d: number) => void;
  readonly messagebuilder_seed: (a: number, b: number, c: number, d: number) => void;
  readonly messagebuilder_accountIndex: (a: number, b: number, c: number) => void;
  readonly messagebuilder_initialAddressIndex: (a: number, b: number, c: number) => void;
  readonly messagebuilder_parents: (a: number, b: number, c: number) => void;
  readonly messagebuilder_input: (a: number, b: number, c: number, d: number) => void;
  readonly messagebuilder_inputRange: (a: number, b: number, c: number, d: number) => void;
  readonly messagebuilder_output: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly messagebuilder_dustAllowanceOutput: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
  readonly messagebuilder_prepareTransaction: (a: number, b: number) => void;
  readonly messagebuilder_signTransaction: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
  readonly messagebuilder_finishMessage: (a: number, b: number, c: number) => void;
  readonly messagebuilder_submit: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h45c87d7cad3bb951: (a: number, b: number, c: number) => void;
  readonly _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hd67b012b38ff8c15: (a: number, b: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h943e05907d25c2a8: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_start: () => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
