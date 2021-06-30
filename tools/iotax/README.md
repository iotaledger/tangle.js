# iotax

CLI for Chrysalis and beyond

[![License badge](https://img.shields.io/github/license/jmcanterafonseca-iota/iotax.svg)](https://opensource.org/licenses/MIT)
[![Build badge](https://img.shields.io/travis/jmcanterafonseca-iota/iotax.svg)](https://travis-ci.org/jmcanterafonseca-iota/iotax/)
[![node badge](https://img.shields.io/node/v/%40jmcanterafonseca-iota%2Fiotax.svg)](https://www.npmjs.com/package/√)
[![npm badge](https://img.shields.io/npm/dm/%40jmcanterafonseca-iota%2Fiotax.svg)](https://www.npmjs.com/package/@jmcanterafonseca-iota/iotax)

## Installation

```
npm install -g @jmcanterafonseca-iota/iotax
```

## Run 

On the command line just run ```iotax```

## Commands

* [Decentralized Identities](#did)
* [Verifiable Credentials](#verifiable-credentials-vc)
* [Anchoring Channels](#anchoring-channels) (Powered by IOTA Streams)
* [Tangle Messages](#tangle-messages)

```
iotax [command]

Commands:
  iotax did      DID operations
  iotax vc       VC  Operations
  iotax channel  IOTA Streams Anchoring Channel operations
  iotax msg      Tangle message (indexation payloads) operations

Options:
  --version  Show version number                                       [boolean]
  --mainnet  IOTA Mainnet                                              [boolean]
  --testnet  IOTA testnet                                               [boolean]
  --comnet   IOTA Comnet                                               [boolean]
  --net, -n  Node's endpoint or other IOTA network                     [string]
  --help     Show help                                                 [boolean]
```

## DID 

```
iotax did

DID Operations

Commands:
  iotax did create   DID Creation
  iotax did resolve  DID Resolution

Options:
  --version   Show version number                                      [boolean]
  --mainnet   IOTA Mainnet                                             [boolean]
  --testnet   IOTA testnet                                              [boolean]
  --comnet    IOTA Comnet                                              [boolean]
  --net, -n   Node's endpoint or other IOTA network                     [string]
  --help      Show help                                                [boolean]
```

### DID Creation

```
iotax did create

DID Creation

Options:
  --version     Show version number                                      [boolean]
  --mainnet     IOTA Mainnet                                             [boolean]
  --testnet     IOTA testnet                                              [boolean]
  --comnet      IOTA Comnet                                              [boolean]
  --net, -n     Node's endpoint or other IOTA network                     [string]
  --help        Show help                                                [boolean]
  --didService  List of DID services (JSON Array)                        [string]
```

### DID Resolution

```
iotax did resolve

DID Resolution

Options:
  --version   Show version number                                      [boolean]
  --mainnet   IOTA Mainnet                                             [boolean]
  --testnet   IOTA testnet                                              [boolean]
  --comnet    IOTA Comnet                                              [boolean]
  --net, -n   Node's endpoint or other IOTA network                     [string]
  --help      Show help                                                [boolean]
  --did      DID to be resolved                              [string] [required]
```

## Verifiable Credentials (VC)

```
iotax vc

Verifiable Credential operations

Commands:
  iotax vc issue   VC issuance
  iotax vc verify  VC verification

Options:
  --version  Show version number                                       [boolean]
  --mainnet  IOTA Mainnet                                              [boolean]
  --testnet  IOTA testnet                                               [boolean]
  --comnet   IOTA Comnet                                               [boolean]
  --net, -n  Node's endpoint or other IOTA network                     [string]
  --help     Show help                                                 [boolean]
  --method   Verification Method                             [string] [required]
```

### Issuing a VC

```
iotax vc issue

VC issuance

Options:
  --version  Show version number                                       [boolean]
  --mainnet  IOTA Mainnet                                              [boolean]
  --testnet  IOTA testnet                                               [boolean]
  --comnet   IOTA Comnet                                               [boolean]
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
iotax vc verify

VC verification

Options:
  --version  Show version number                                       [boolean]
  --mainnet  IOTA Mainnet                                              [boolean]
  --testnet  IOTA testnet                                               [boolean]
  --comnet   IOTA Comnet                                               [boolean]
  --net, -n  Node's endpoint or other IOTA network                     [string]
  --help     Show help                                                 [boolean]
  --vc       Verifiable Credential to be verified (As JSON)  [string] [required]
  --vp       Verifiable Presentation to be verified (As JSON)  [string] [required]
```

### Presenting a VC

```
iotax vc present

Options:
  --version  Show version number                                       [boolean]
  --testnet  IOTA Chrysalis Testnet                                    [boolean]
  --mainnet  IOTA Chrysalis Mainnet                                    [boolean]
  --comnet   IOTA Comnet                                               [boolean]
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

## Anchoring Channels

Anchoring Channels operations (Powered by IOTA Streams)

```
Commands:
  iotax channel anchor  Anchors a message to an IOTA Streams Channel
  iotax channel fetch   Fetches one or more messages previously anchored to an
                        IOTA Streams Channel

Options:
  --version  Show version number                                       [boolean]
  --testnet  IOTA Chrysalis Testnet                                    [boolean]
  --mainnet  IOTA Chrysalis Mainnet                                    [boolean]
  --comnet   IOTA Comnet                                               [boolean]
  --net, -n  Node's endpoint or other IOTA network                     [string]
  --help     Show help                                                 [boolean]
````

### Anchor message

```
iotax channel anchor

Anchors a message to an IOTA Streams Channel

Options:
  --version      Show version number                                   [boolean]
  --testnet      IOTA Chrysalis Testnet                                [boolean]
  --mainnet      IOTA Chrysalis Mainnet                                [boolean]
  --comnet       IOTA Comnet                                           [boolean]
  --net, -n       Node's endpoint or other IOTA network                     [string]
  --help         Show help                                             [boolean]
  --seed, -s     IOTA Streams Channel seed                              [string]
  --msg          (JSON) Message content to be anchored       [string] [required]
  --channel      ID of the Channel ('address:announceMsgID') to anchor the
                 message to                                             [string]
  --anchorageID  The anchorage point (message) ID to anchor the message to
                                                                        [string]
```

### Fetch message(s)

```
iotax channel fetch

Fetches one or more messages previously anchored to an IOTA Streams Channel

Options:
  --version      Show version number                                   [boolean]
  --testnet      IOTA Chrysalis Testnet                                [boolean]
  --mainnet      IOTA Chrysalis Mainnet                                [boolean]
  --comnet       IOTA Comnet                                           [boolean]
  --net, -n      Node's endpoint or other IOTA network                     [string]
  --help         Show help                                             [boolean]
  --seed, -s     IOTA Streams Channel seed                              [string]
  --channel      ID of the Channel ('address:announceMsgID') from which to fetch
                 the message                                            [string]
  --msgID        ID of the message to be fetched                        [string]
  --anchorageID  ID of the anchorage where the message(s) to be fetched are
                 anchored to                                            [string]
```

## Tangle Messages

```
Tangle message (indexation payloads) operations

Commands:
  iotax msg submit  Message (indexation payload) submission
  iotax msg get     Message retrieval

  Options:
  --version  Show version number                                       [boolean]
  --testnet  IOTA Chrysalis Testnet                                    [boolean]
  --mainnet  IOTA Chrysalis Mainnet                                    [boolean]
  --comnet   IOTA Comnet                                               [boolean]
  --net, -n  Node's endpoint or other IOTA network                      [string]
  --help     Show help                                                 [boolean]
```

### Submit a message (indexation payload)

```
iotax msg submit

Message (indexation payload) submission

Options:
  --version  Show version number                                       [boolean]
  --testnet  IOTA Chrysalis Testnet                                    [boolean]
  --mainnet  IOTA Chrysalis Mainnet                                    [boolean]
  --comnet   IOTA Comnet                                               [boolean]
  --net, -n  Node's endpoint or other IOTA network                      [string]
  --help     Show help                                                 [boolean]
  --msg      Message content to be submitted                 [string] [required]
  --index    Index for the message                           [string] [required]
```

### Retrieve a message

```
iotax msg get

Message retrieval

Options:
  --version  Show version number                                       [boolean]
  --testnet  IOTA Chrysalis Testnet                                    [boolean]
  --mainnet  IOTA Chrysalis Mainnet                                    [boolean]
  --comnet   IOTA Comnet                                               [boolean]
  --net, -n  Node's endpoint or other IOTA network                      [string]
  --help     Show help                                                 [boolean]
  --msgID    ID of the message to be retrieved               [string] [required]
```
