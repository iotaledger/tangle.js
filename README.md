<h2 align="center">tangle.js</h2>

<p align="center">
  <a href="https://discord.iota.org/" style="text-decoration:none;"><img src="https://img.shields.io/badge/Discord-9cf.svg?logo=discord" alt="Discord"></a>
    <a href="https://iota.stackexchange.com/" style="text-decoration:none;"><img src="https://img.shields.io/badge/StackExchange-9cf.svg?logo=stackexchange" alt="StackExchange"></a>
    <a href="https://github.com/iotaledger/tangle.js/blob/master/LICENSE" style="text-decoration:none;"><img src="https://img.shields.io/github/license/iotaledger/tangle.js.svg" alt="Apache license"></a>
</p>
      
<p align="center">
  <a href="#about">About</a> ◈
  <a href="#prerequisites">Prerequisites</a> ◈
  <a href="#getting-started">Getting started</a> ◈
  <a href="#supporting-the-project">Supporting the project</a> ◈
  <a href="#joining-the-discussion">Joining the discussion</a> 
</p>

---

# About

A mono-repository that contains a collection of libraries and tools that enable Javascript developers to create applications leveraging on IOTA's Tangle. 

## Libraries

### anchors

`anchors` allows anchoring messages to the Tangle. Powered by [IOTA Streams](https://github.com/iotaledger/streams).

[README](./libs/anchors)

### ld-proofs

`ld-proofs` enables Linked Data Proofs on the Tangle. Powered by [IOTA Identity](https://github.com/iotaledger/identity.rs) and [IOTA Streams](https://github.com/iotaledger/streams). 

[README](./libs/ld-proofs)

### trail

Upcoming

## Tools

### tangle-cli

CLI for Tangle.js

[README](./tools/tangle-cli)

## Prerequisites

These libraries and tools are developed using Node.js. Please check the required node runtime and npm tool versions of each package. 

## Getting started

The README of each library or tool includes a minimal API Guide. 

### anchors

```
npm install @tangle.js/anchors
```

### ld-proofs

```
npm install @tangle.js/ld-proofs
```

### trail

Upcoming

### tangle-cli

```
npm install -g @tangle.js/tangle-cli
```

## Supporting the project

If this project has been useful to you and you feel like contributing, consider submitting a [bug report](https://github.com/iotaledger/tangle.js/issues/new), [feature request](https://github.com/iotaledger/tangle.js/issues/new) or a [pull request](https://github.com/iotaledger/tangle.js/pulls/).

See our [contributing guidelines](.github/CONTRIBUTING.md) for more information.

## Joining the discussion

If you want to get involved in the community, need help with getting set up, have any issues or just want to discuss IOTA, Distributed Ledger Technology (DLT), and IoT with other people, feel free to join our [Discord](https://discord.iota.org/).
