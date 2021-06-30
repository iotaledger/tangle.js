# Tangle Linked Data Proofs

`ld-proofs` enables Linked Data Proofs on the Tangle. Powered by [IOTA Identity](https://github.com/iotaledger/identity.rs) and [IOTA Streams](https://github.com/iotaledger/streams). 

## How it works

Aligned with the [W3C Linked Data Proofs](https://w3c-ccg.github.io/ld-proofs/) specification this library allows to generate and verify Linked Data Proofs associated to plain messages or JSON(-LD) documents. Two different kind of Linked Data Proofs can be generated:

* EdDSA (Ed25519) Signatures over plain messages
* Linked Data Signatures (`Ed25519Signature2018` for JSON-LD or `Jcs`)
* Linked Data Proofs anchored to the Tangle (using the [anchors](../anchors)) library (`Iota`). These type of proof anchors to the Tangle a Linked Data Signature together with a reference to the signed document. 

## API

### Signing plain messages (EdDSA)

```ts
// The node is optional and by default will be IF mainnet nodes
const node = "https://chrysalis-nodes.iota.org";

// The DID contains the public cryptographic materials used by the signer
const did = "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP";
const signer = await IotaSigner.create(did, node?);

// Plain message to be signed
const message = "hello";

// Method declared on the signer's concerned DID document
const method = "key";
// Private Key in base58
const privateKey = "privateKeybase58";

const options: ISigningOptions = {
    method,
    privateKey
};

const signingResult = await signer.sign(Buffer.from(message), options);
console.log("Signature: ", signingResult.signatureValue);
```

### Verifying plain messages

```ts
const options: IVerificationOptions = {
    type: "Ed25519",
    verificationMethod: "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP#key",
    // Node is optional and it is IOTA's mainnet by default
    node: "https://chrysalis-nodes.iota.org"
};

const verified = await IotaVerifier.verify(message, signatureValue, options);
```

### Linked Data Signatures generation (Ed25519 over JSON(-LD))

```ts
const did = "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP";
const signer = await IotaSigner.create(did);

const jsonLdDocument = {
    "@context": "https://schema.org",
    "type": "Organization",
    "name": "IOTA Foundation"
};

const options: ISigningOptions = {
    method,
    privateKey
};
// Obtains a Linked Data Signature
const proof = signer.signJsonLd(jsonLdDocument, options);
```

### Linked Data Signatures verification (Ed25519 over JSON(-LD) objects)

```ts
// The document includes the former document and the Linked Data Signature
const signedDoc = {
    "@context": "https://schema.org",
    "type": "Organization",
    "name": "IOTA Foundation",

    proof: {
        "proofValue": "3JTS3UaJc2aS2rxkQ1Z4GEs9HjvASnm3e2s5VT5pS8voGEBodWBBd6P7YUmq8eN92H9v1u2gmqER7Y6wXhgcywYX",
        "type": "Ed25519Signature2018",
        "verificationMethod": "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP#key",
        "proofPurpose": "dataVerification",
        "created": "2021-06-21T13:29:25.976Z"
    }
};

const verified = await IotaVerifier.verifyJsonLd(signedDoc, options?);
```

### Linked Data Proofs generation (anchored to the Tangle)

See also [anchors](../anchors) library. 

```ts
const anchorChannel = /* Instantiate an anchoring channel */
const signer = /* Instantiate a signer */
const proofGenerator = new IotaLdProofGenerator(anchoringChannel, signer);
// Generates the Linked Data Signature and anchors it to the Tangle generating 
// an Iota proof
const proof = await proofGenerator.generateLd(jsonLdDocument, anchorageID)
```

### Linked Data Proofs verification

```ts
const verified = await IotaLdProofVerifier.verifyJsonLd(anchoredDoc, options?);
```
