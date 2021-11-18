#!/usr/bin/env sh

code_block()
{
    echo "\`\`\`"
    eval $1
    echo "\`\`\`"
}

# npm run build > /dev/null

cat << EOF
## Usage

On the command line just run \`tcli\`.

* [Decentralized Identities](#did)
* [Verifiable Credentials](#verifiable-credentials-vc)
* [Streams Channels](#channels) (Powered by IOTA Streams)
* [Tangle Indexed Messages](#tangle-messages)

> For all commands you must specify at minumum `--devnet`, `--mainnet` or `--net <netId> --node <nodeUrl>`

$(code_block "npx tcli --help")

### DID

$(code_block "npx tcli did --help")

#### DID Creation

$(code_block "npx tcli did create --help")

#### DID Resolution

$(code_block "npx tcli did resolve --help")

### Verifiable Credentials (VC)

$(code_block "npx tcli vc --help")

#### Issuing a VC

$(code_block "npx tcli vc issue --help")

#### Verifying a VC or a VP

$(code_block "npx tcli vc verify --help")

#### Presenting a VC

$(code_block "npx tcli vc present --help")

### Channels

$(code_block "npx tcli channel --help")

#### Channel Creation

$(code_block "npx tcli channel create --help")

#### Anchor message

$(code_block "npx tcli channel anchor --help")

#### Fetch message

$(code_block "npx tcli channel fetch --help")

#### Inspect channel

$(code_block "npx tcli channel inspect --help")

### Seed generation

$(code_block "npx tcli channel seed --help")

### Tangle Messages

$(code_block "npx tcli msg --help")

#### Submit a message (indexation payload)

$(code_block "npx tcli msg submit --help")

#### Retrieve a message

$(code_block "npx tcli msg get --help")
EOF
