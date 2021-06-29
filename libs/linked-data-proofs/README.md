### Signing messages (EdDSA)

```ts
const node = "https://chrysalis-nodes.iota.org";
const did = "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP";
const signer = await IotaSigner.create(node, did);

const message = "hello";
// Method declared on the DID document
const method = "key";
// Private Key in base58
const privateKey = "privateKeybase58";

const signature = (await signer.sign(Buffer.from(message), method, privateKey)).signatureValue;
```

### Verifying messages

```ts
const request: IVerificationRequest = {
    type: "Ed25519Signature2018",
    message: "Hello",
    signatureValue,
    verificationMethod: "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP#key",
    node: "https://chrysalis-nodes.iota.org"
};

const verified = await IotaVerifier.verify(request);
```

### Linked Data Signatures generation (Ed25519 over JSON(-LD))

```ts
const node = "https://chrysalis-nodes.iota.org";
const did = "did:iota:2pu42SstXrg7uMEGHS5qkBDEJ1hrbrYtWQReMUvkCrDP";
const signer = await IotaSigner.create(node, did);

const jsonLdDocument = {
    "@context": "https://schema.org",
    "type": "Organization",
    "name": "IOTA Foundation"
};

// Obtains a Linked Data Signature
const proof = signer.signJsonLd(jsonLdDocument, method, privateKey);
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

const verified = await IotaVerifier.verifyJsonLd({
    document: signedDoc
});
```

### Linked Data Proofs generation (anchored to the Tangle)

```ts
const anchorChannel = /* Instantiate an anchoring channel */
const signer = /* Instantiate a signer */
const proofGenerator = new IotaLdProofGenerator(anchoringChannel, signer);
await proofGenerator.generate(jsonLdDocument, anchorageID)
```

### Linked Data Proofs verification

```ts
const verified = await IotaLdProofVerifier.verifyJsonLd({
    document: anchoredDoc
});
```
