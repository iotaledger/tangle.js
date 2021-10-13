# tangle-cli

CLI for developing applications on the Tangle

[![Github Test Workflow](https://github.com/iotaledger/tangle.js/workflows/tcli%20Test/badge.svg)](https://github.com/iotaledger/tangle.js/actions/workflows/tcli-test.yaml)
 [![npm badge](https://img.shields.io/npm/dm/%40tangle-js%2Ftangle-cli.svg)](https://www.npmjs.com/package/@tangle-js/tangle-cli)

## Installation

```
npm install -g @tangle-js/tangle-cli
```

## Run 

On the command line just run ```tcli```

## Commands

* [Decentralized Identities](#did)
* [Verifiable Credentials](#verifiable-credentials-vc)
* [Streams Channels](#channels) (Powered by IOTA Streams)
* [Tangle Indexed Messages](#tangle-messages)

```
tcli [command]

Commands:
  tcli did      DID operations
  tcli vc       VC  Operations
  tcli channel  Anchoring Channels operations
  tcli msg      Tangle message (indexation payloads) operations

Options:
  --version  Show version number                                       [boolean]
  --mainnet  IOTA Mainnet                                              [boolean]
  --devnet   IOTA devnet                                                [boolean]
  --net, -n  Node's endpoint or other IOTA network                     [string]
  --help     Show help                                                 [boolean]
```

## DID 

```
tcli did

DID Operations

Commands:
  tcli did create   DID Creation
  tcli did resolve  DID Resolution

Options:
  --version   Show version number                                      [boolean]
  --mainnet   IOTA Mainnet                                             [boolean]
  --devnet    IOTA devnet                                               [boolean]
  --net, -n   Node's endpoint or other IOTA network                     [string]
  --help      Show help                                                [boolean]
```

### DID Creation

```
tcli did create

DID Creation

Options:
  --version     Show version number                                      [boolean]
  --mainnet     IOTA Mainnet                                             [boolean]
  --devnet      IOTA devnet                                               [boolean]
  --net, -n     Node's endpoint or other IOTA network                     [string]
  --help        Show help                                                [boolean]
  --didService  List of DID services (JSON Array)                        [string]
```

### DID Resolution

```
tcli did resolve

DID Resolution

Options:
  --version   Show version number                                      [boolean]
  --mainnet   IOTA Mainnet                                             [boolean]
  --devnet    IOTA devnet                                               [boolean]
  --net, -n   Node's endpoint or other IOTA network                     [string]
  --help      Show help                                                [boolean]
  --did      DID to be resolved                              [string] [required]
```

## Verifiable Credentials (VC)

```
tcli vc

Verifiable Credential operations

Commands:
  tcli vc issue   VC issuance
  tcli vc verify  VC verification

Options:
  --version  Show version number                                       [boolean]
  --mainnet  IOTA Mainnet                                              [boolean]
  --devnet   IOTA devnet                                                [boolean]
  --net, -n  Node's endpoint or other IOTA network                     [string]
  --help     Show help                                                 [boolean]
  --method   Verification Method                             [string] [required]
```

### Issuing a VC

```
tcli vc issue

VC issuance

Options:
  --version  Show version number                                       [boolean]
  --mainnet  IOTA Mainnet                                              [boolean]
  --devnet   IOTA devnet                                                [boolean]
  --net, -n  Node's endpoint or other IOTA network                     [string]
  --help     Show help                                                 [boolean]
  --method   Verification Method                             [string] [required]
  --issuer   DID of the issuer of the VC                     [string] [required]
  --expDate  Expiration Date                                 [string] [optional]
  --secret   Secret key of the issuer                        [string] [required]
  --subject  (D)ID of the subject of the VC                  [string] [required]
  --claims   Credential claim data (As a JSON Object)        [string] [required]
  --type     Credential type                                 [string] [required]
  --id       Credential id                                              [string]
  --json     Output the credential in JSON format ready for cyp        [boolean]
```

### Verifying a VC or a VP

```
tcli vc verify

VC verification

Options:
  --version  Show version number                                       [boolean]
  --mainnet  IOTA Mainnet                                              [boolean]
  --devnet   IOTA devnet                                                [boolean]
  --net, -n  Node's endpoint or other IOTA network                     [string]
  --help     Show help                                                 [boolean]
  --vc       Verifiable Credential to be verified (As JSON)  [string] [required]
  --vp       Verifiable Presentation to be verified (As JSON)  [string] [required]
```

### Presenting a VC

```
tcli vc present

Options:
  --version  Show version number                                       [boolean]
  --devnet   IOTA Chrysalis devnet                                     [boolean]
  --mainnet  IOTA Chrysalis Mainnet                                    [boolean]
  --net, -n  Node's endpoint or other IOTA network                     [string]
  --help     Show help                                                 [boolean]
  --vc       VC to be presented                              [string] [required]
  --holder   Holder who presents the credential. By default is the credential
             subject                                                    [string]
  --method   Verification Method                             [string] [required]
  --secret   Secret key of the holder                        [string] [required]
  --id       Presentation id                                            [string]
  --type     Presentation type                                          [string]
  --json     Output the credential presentation in JSON format ready for cyp
                                                                       [boolean]
```

## Channels

Streams Channels operations (Powered by IOTA Streams)

```
Commands:
  tcli channel create   Creates a new Streams channel
  tcli channel anchor   Anchors a message to an IOTA Streams Channel
  tcli channel fetch    Fetches one message previously anchored
  tcli channel inspect  Inspects an Streams Channel, visiting all messages
                            anchored with the same seed
  tcli channel seed     Creates a new seed to be used to interact with
                            anchoring channels

Options:
  --version  Show version number                                       [boolean]
  --devnet   IOTA Chrysalis devnet                                     [boolean]
  --mainnet  IOTA Chrysalis Mainnet                                    [boolean]
  --net, -n  Node's endpoint or other IOTA network                     [string]
  --help     Show help                                                 [boolean]
````

### Channel Creation

```
tcli channel create

Creates a new Streams Channel

Options:
      --version  Show version number                                   [boolean]
      --devnet   IOTA Chrysalis devnet                                 [boolean]
      --mainnet  IOTA Chrysalis Mainnet                                [boolean]
  -n, --net      Node's endpoint or other IOTA network                  [string]
      --help     Show help                                             [boolean]
      --psk      Pre-shared keys                                        [array]
      --seed     IOTA Streams Author's seed for creating the channel    [string]
      --encrypted  Whether the channel must be encrypted or not        [boolean]
      --private    Whether the channel is private or not               [boolean]
```

### Anchor message

```
tcli channel anchor

Anchors a message to a Streams Channel

Options:
      --version      Show version number                               [boolean]
      --devnet       IOTA Chrysalis devnet                             [boolean]
      --mainnet      IOTA Chrysalis Mainnet                            [boolean]
  -n, --net          Node's endpoint or other IOTA network              [string]
      --help         Show help                                         [boolean]
      --seed         IOTA Streams Subscriber's seed to use to anchor the message
                                                             [string] [required]
      --msg          (JSON) Message content to be anchored   [string] [required]
      --channelID    ID of the Channel ('address:announceMsgID') to anchor the
                     message to                              [string] [required]
      --anchorageID  The anchorage point (message) ID to anchor the message to
                                                             [string] [required]
      --encrypted  Whether the channel must be encrypted or not        [boolean]
      --private    Whether the channel is private or not               [boolean]
```

### Fetch message

```
tcli channel fetch

Fetches one message previously anchored

Options:
      --version      Show version number                               [boolean]
      --devnet       IOTA Chrysalis devnet                             [boolean]
      --mainnet      IOTA Chrysalis Mainnet                            [boolean]
  -n, --net          Node's endpoint or other IOTA network              [string]
      --help         Show help                                         [boolean]
      --seed         IOTA Streams Subscriber's seed to fetch on the channel
                                                                         [string] 
      --psk          IOTA Streams pre-shared key to fetch on the channel [string]
      --channelID    ID of the Channel ('address:announceMsgID') from which to
                     fetch the message                       [string] [required]
      --msgID        ID of the message to be fetched                    [string]
      --anchorageID  ID of the anchorage where the message to be fetched is
                     anchored to                             [string] [required]
      --encrypted  Whether the channel must be encrypted or not        [boolean]
      --private    Whether the channel is private or not               [boolean]
```

### Inspect channel

```
tcli channel inspect

Inspects a Streams Channel, visiting all messages anchored. 

Options:
      --version    Show version number                                 [boolean]
      --devnet     IOTA Chrysalis devnet                               [boolean]
      --mainnet    IOTA Chrysalis Mainnet                              [boolean]
  -n, --net        Node's endpoint or other IOTA network                [string]
      --help       Show help                                           [boolean]
      --seed       IOTA Streams Subscriber's seed to inspect the channel [string]
      --psk        Pre-shared key used to inspect the channel            [string]
      --channelID  ID of the Channel ('address:announceMsgID') from which to
                   fetch the message                         [string] [required]
      --encrypted  Whether the channel must be encrypted or not        [boolean]
      --private    Whether the channel is private or not               [boolean]
```

## Seed generation

```
tcli channel seed

Creates a new seed to be used to interact with channels

Options:
      --version  Show version number                                   [boolean]
      --devnet   IOTA Chrysalis devnet                                 [boolean]
      --mainnet  IOTA Chrysalis Mainnet                                [boolean]
  -n, --net      Node's endpoint or other IOTA network                  [string]
      --help     Show help                                             [boolean]
      --size     Size of the seed                                       [number]
```

## Tangle Messages

```
Tangle message (indexation payloads) operations

Commands:
  tcli msg submit  Message (indexation payload) submission
  tcli msg get     Message retrieval

  Options:
  --version  Show version number                                       [boolean]
  --devnet   IOTA Chrysalis devnet                                     [boolean]
  --mainnet  IOTA Chrysalis Mainnet                                    [boolean]
  --net, -n  Node's endpoint or other IOTA network                      [string]
  --help     Show help                                                 [boolean]
```

### Submit a message (indexation payload)

```
tcli msg submit

Message (indexation payload) submission

Options:
  --version  Show version number                                       [boolean]
  --devnet   IOTA Chrysalis devnet                                     [boolean]
  --mainnet  IOTA Chrysalis Mainnet                                    [boolean]
  --net, -n  Node's endpoint or other IOTA network                      [string]
  --help     Show help                                                 [boolean]
  --msg      Message content to be submitted                 [string] [required]
  --index    Index for the message                           [string] [required]
```

### Retrieve a message

```
tcli msg get

Message retrieval

Options:
  --version  Show version number                                       [boolean]
  --devnet   IOTA Chrysalis devnet                                     [boolean]
  --mainnet  IOTA Chrysalis Mainnet                                    [boolean]
  --net, -n  Node's endpoint or other IOTA network                      [string]
  --help     Show help                                                 [boolean]
  --msgID    ID of the message to be retrieved               [string] [required]
```
