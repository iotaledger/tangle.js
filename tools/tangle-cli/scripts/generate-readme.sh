#!/usr/bin/env sh
# QoL script to generate the usage sections of the
# README based on the current build of the tcli.
# The global options get printed for every command, 
# these should be removed before updating the README. 

code_block()
{
    echo "\`\`\`"
    eval $1
    echo "\`\`\`"
}

# Print the command help output for each command
cat << EOF

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
