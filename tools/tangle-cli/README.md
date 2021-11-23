# tangle-cli

CLI for developing applications on the Tangle

[![Github Test Workflow](https://github.com/iotaledger/tangle.js/workflows/tcli%20Test/badge.svg)](https://github.com/iotaledger/tangle.js/actions/workflows/tcli-test.yaml)
 [![npm badge](https://img.shields.io/npm/dm/%40tangle-js%2Ftangle-cli.svg)](https://www.npmjs.com/package/@tangle-js/tangle-cli)

## Installation

```
npm install -g @tangle-js/tangle-cli
```

## Usage

On the command line just run `tcli`.

```
tcli [command]

Commands:
  tcli did      DID operations
  tcli vc       Verifiable Credential operations
  tcli channel  Streams Channels operations (Powered by IOTA Streams)
  tcli msg      Tangle message (indexation payloads) operations

Global Options:
  --version        Show version number                                 [boolean]
  --devnet         Default settings for IOTA Chrysalis Devnet
                   Network:   dev
                   Node:      https://api.lb-0.h.chrysalis-devnet.iota.cafe
                   Explorer:  https://explorer.iota.org/devnet
                   Permanode: -                                        [boolean]
  --mainnet        Default settings for IOTA Chrysalis Mainnet
                   Network:   main
                   Node:      https://chrysalis-nodes.iota.org
                   Explorer:  https://explorer.iota.org/mainnet
                   Permanode: https://chrysalis-chronicle.iota.org/api/mainnet/
                                                                       [boolean]
  --net, -i        Tangle network identifier                            [string]
  --node, -n       Node endpoint                                        [string]
  --explorer, -e   Tangle explorer endpoint                             [string]
  --permanode, -p  Permanode endpoint                                   [string]
  --help           Show help                                           [boolean]
```

> For all commands you must specify at minimum `--devnet`, `--mainnet` or `--net <netId> --node <nodeUrl>`

**See commands for:**
* [Decentralized Identities](#did)
* [Verifiable Credentials](#verifiable-credentials-vc)
* [Streams Channels](#channels) (Powered by IOTA Streams)
* [Tangle Indexed Messages](#tangle-messages)

### DID

```
tcli did

DID operations

Commands:
  tcli did create   DID creation
  tcli did resolve  DID resolution
```

#### DID Creation

```
tcli did create

DID creation

Options:
  --didService     List of DID services (JSON Array)                    [string]
```

#### DID Resolution

```
tcli did resolve

DID resolution

Options:
  --did            DID to be resolved                        [string] [required]
```

### Verifiable Credentials (VC)

```
tcli vc

Verifiable Credential operations

Commands:
  tcli vc issue    VC issuance
  tcli vc verify   VC / VP verification
  tcli vc present  VC presentation
```

#### Issuing a VC

```
tcli vc issue

VC issuance

Options:
  --issuer         DID of the issuer of the VC               [string] [required]
  --method         Verification Method                       [string] [required]
  --expDate        Expiration Date                                      [string]
  --secret         Secret key of the issuer                  [string] [required]
  --subject        (D)ID of the subject of the VC            [string] [required]
  --claims         Credential claim data (As a JSON Object)  [string] [required]
  --type           Credential type                                      [string]
  --id             Credential id                                        [string]
  --json           Output the credential in JSON format ready for cyp  [boolean]
```

#### Verifying a VC or a VP

```
tcli vc verify

VC / VP verification

Options:
  --vc             Verifiable Credential to be verified (As JSON)       [string]
  --vp             Verifiable Presentation to be verified (As JSON)     [string]
```

#### Presenting a VC

```
tcli vc present

VC presentation

Options:
  --vc             VC to be presented                        [string] [required]
  --holder         Holder who presents the credential. By default is the
                   credential subject                                   [string]
  --method         Verification Method                       [string] [required]
  --secret         Secret key of the holder                  [string] [required]
  --id             Presentation id                                      [string]
  --type           Presentation type                                    [string]
  --json           Output the credential presentation in JSON format ready for
                   cyp                                                 [boolean]
```

### Channels

```
tcli channel

Streams Channels operations (Powered by IOTA Streams)

Commands:
  tcli channel create   Creates a new Streams Channel
  tcli channel anchor   Anchors a message to an IOTA Streams Channel
  tcli channel fetch    Fetches one message previously anchored
  tcli channel inspect  Inspects a channel, visiting all messages
  tcli channel seed     Creates a new seed to be used to interact with channels
```

#### Channel Creation

```
tcli channel create

Creates a new Streams Channel

Options:
  --seed           IOTA Streams Author's seed for creating the channel  [string]
  --psk            Pre-shared keys                                       [array]
  --encrypted      Whether the channel must be encrypted or not        [boolean]
  --private        Whether the channel is private or not               [boolean]
```

#### Anchor message

```
tcli channel anchor

Anchors a message to an IOTA Streams Channel

Options:
  --seed           IOTA Streams Subscriber's seed to use to anchor the message
                                                             [string] [required]
  --msg            (JSON) Message content to be anchored     [string] [required]
  --channelID      ID of the Channel ('address:announceMsgID') to anchor the
                   message to                                [string] [required]
  --anchorageID    The anchorage point (message) ID to anchor the message to
                                                             [string] [required]
  --encrypted      Whether the channel must be encrypted or not        [boolean]
  --private        Whether the channel is private or not               [boolean]
```

#### Fetch message

```
tcli channel fetch

Fetches one message previously anchored

Options:
  --seed           IOTA Streams Subscriber's seed to fetch on the channel
                                                                        [string]
  --psk            IOTA Streams pre-shared key to fetch on the channel  [string]
  --channelID      ID of the Channel ('address:announceMsgID') from which to
                   fetch the message                         [string] [required]
  --msgID          ID of the message to be fetched                      [string]
  --anchorageID    ID of the anchorage where the message to be fetched is
                   anchored to                               [string] [required]
  --encrypted      Whether the channel must be encrypted or not        [boolean]
  --private        Whether the channel is private or not               [boolean]
```

#### Inspect channel

```
tcli channel inspect

Inspects a channel, visiting all messages

Options:
  --seed           IOTA Streams Subscriber's seed to inspect the channel[string]
  --psk            Pre-shared key used to inspect the channel           [string]
  --channelID      ID of the Channel ('address:announceMsgID') from which to
                   fetch the message                         [string] [required]
  --encrypted      Whether the channel must be encrypted or not        [boolean]
  --private        Whether the channel is private or not               [boolean]
```

### Seed generation

```
tcli channel seed

Creates a new seed to be used to interact with channels

Options:
  --size           Size of the seed                                     [number]
```

### Tangle Messages

```
tcli msg

Tangle message (indexation payloads) operations

Commands:
  tcli msg submit  Message (indexation payload) submission
  tcli msg get     Message retrieval
```

#### Submit a message (indexation payload)

```
tcli msg submit

Message (indexation payload) submission

Options:
  --msg            Message content to be submitted           [string] [required]
  --index          Index for the message                     [string] [required]
```

#### Retrieve a message

```
tcli msg get

Message retrieval

Options:
  --msgID          ID of the message to be retrieved         [string] [required]
```
