export const dids = {
    rootTrust: {
        did: "did:iota:tst:0x8faff1d7514eeae7fa17f66adb53d514ff85f9eb230f1aa1f9d8e943ebe3c78c",
        privateKeyDidControl: "0xd3cc37b46f5fea8863cd53bd878b5e196ef3a21d4adf6d13180292685398af6c490272beecd09f9aceb7f459b0a6cae46ae5f3e757aca5847af43d32bb48b152",
        publicKeyDidControl: "0x490272beecd09f9aceb7f459b0a6cae46ae5f3e757aca5847af43d32bb48b152",
        privateKeySign: "0x6fa50ffb05e0afe350852f9caac7e9282b3c79a5215be70c6d1cc8e06c4a3d1794299286fee7ac43990d80f68e3ac3942f291095787a43115af4c3c9fe4a53d7"
    },
    esGovernmentTAO: {
        did: "did:iota:tst:0x227d08526f19e1bfd441ff7a0994ce0b2c1ee3000d8aab8e44c58300a2b72e2d",
        privateKeyDidControl: "0xb40071c414b64db86011b7716bfeb719ec4f77adcf17f25b8076fbb5a1fb3698e710576bda504245d2fdce8f81959fffae6be51d692a19d9c63c1b0e4b737d39",
        publicKeyDidControl: "0xe710576bda504245d2fdce8f81959fffae6be51d692a19d9c63c1b0e4b737d39",
        privateKeySign: "0x7bcc4eb58f45320e2895b50d925e3b336e944f886845319fed68a8e3480646d07a8a90ca6069aa538fd94cc066139f409ecb777a7e4729531dba4d8361a4e1ed"
    },
    revenueAgencyTAO: {
        did: "did:iota:tst:0x8f3b066327c83c9c8a2fbf01e005d3407fca9c5853ca947fe4536462aa31600f",
        privateKeySign: "0x8e4c81cc8c6f2f44a72d287521b9e1fae27754755efb573b10014eca6c57cfd86a1b1a17fd41ed2d462625984a0aeb95a0798e23b71bda737d54e6523aba4b5f"
    },
    envAgencyTAO: {
        did: "did:iota:tst:0xb5eab59c42f979923818284ca14b88d4ca3d539a0f7330612416c422de303488",
        privateKeySign: "0x2a3506aa8c55f5fbfc7c077b7ce76f1d931629840b951e21037d60802cc47930e7b2f324ef4e695753ee10dd8f4cd78758141c979041549e5cfc8e4ddb6d2693"
    },
    recyclerTI: {
        did: "did:iota:tst:0x25237db769135c3053065913547cbf6482600a9646d40a978aabc017042f161f",
        privateKeySign: "0xf0d34c4f5b74bc327fbe6646fdf874f6dad9d5425e138078ef654b1144389eae55abe1926a93c39b3d18c005e0372a80a0f860370d9ec180f82f960538809cf4"
    },
    manufacturerLegalEntity: {
        did: "did:iota:tst:0x77eac1ab20a84c5ca1d3020b7eb0c1f2220eb098d0c839b9f3fd69de54807202"
    }
};

export const ebsiDids = {
    rootTrust: {
        did: "did:iota:ebsi:0x2550e39e01e8ce23eaaf35d81548edff55d5a32268128504b9e35e0ca92d488c",
        privateKeyDidControl: "0xf0f20a08e858ad051d74e78e772b41285b6bdce5de72a33ae85cf0d48ad916d84cdc26d4465c2f7add8551b0ab9061bc2187be0ed49e1452fb07fce2d5b803c6",
        publicKeyDidControl: "0x4cdc26d4465c2f7add8551b0ab9061bc2187be0ed49e1452fb07fce2d5b803c6",
        privateKeySign: "0x561bf85108e2981f8adb08a5dc939a128b646c0c0756b626a79c89e3b2128711948b5fece3c51306e656c0ffea1ad80c6c83c3e7d9df63c5cf4a14d1d87e54ec"
    },
    esGovernmentTAO: {
        did: "did:iota:ebsi:0xc0b5233ae63c25e7efaabd5563a3b78f31bfbdfff69043401cd791816c6724a4",
        privateKeyDidControl: "0x0641164310547731d006d49d3123bd3ba5cdbfaeb9478134cc00bc7eb1332d16963d3546390e043a3b3100160efb810b66ec8d3715cae8815aba3a353c7a8a5d",
        publicKeyDidControl: "0x963d3546390e043a3b3100160efb810b66ec8d3715cae8815aba3a353c7a8a5d",
        privateKeySign: "0xfa81281b92ce47bda6f7853c8009a50cb8c67e923640be1fda0ce956d16a8e20ee6a1febb607d757fac073b22f79eb6e59601946e10caf0e5a6c5d22035634ad"
    }
};

export const ebsiDidsJwk = {
    rootTrust: {
        did: "did:iota:tst:0xefeed3f8d9beb66f5ce47642f3eb32a8585ab682f96b9da2be7fa49b1933ef9e",
        privateKeyDidControl: "0x3b76dc6580975782bdee1deca7127caf4e2eba35081688035d0e7c805f1aeeb4c06dbaa2546fd9f3faf555337b11bc384991bcab0498874b01f39a31b0f526f2",
        publicKeyDidControl: "0xc06dbaa2546fd9f3faf555337b11bc384991bcab0498874b01f39a31b0f526f2",
        privateKeySign: {
            "kid": "did:iota:tst:0xefeed3f8d9beb66f5ce47642f3eb32a8585ab682f96b9da2be7fa49b1933ef9e#sign-1",
            "use": "sig",
            "alg": "ES256",
            "kty": "EC",
            "x": "mRj7FhQ9XSssxvqQK-vSS6EqjS8vDJ4yQbeH1S-0iwg",
            "y": "Y7vnSC_YBd2cz6neP1P5UwNKOxM2VuQjFtnqCeg37GE",
            "crv": "P-256",
            "d": "YGEi9qi5m1HRJWjxeRR6LhDdh3eSWM3xntGwImX1oIM"
        }
    },
    esGovernmentTAO: {
        did: "did:iota:tst:0x43e8de0883631604887805c6d7b96a6f4e728fd889e95feec8ad77acb8c785f0",
        privateKeyDidControl: "0x0e5a81e730d09045029fa0c03d293d6cd16941498c4a0a72c43d1813917904a6077a2d55cb32db7dacee0d1d407964c76fce373e4ff0b33dfc6a7dc8920d67b8",
        publicKeyDidControl: "0x077a2d55cb32db7dacee0d1d407964c76fce373e4ff0b33dfc6a7dc8920d67b8",
        privateKeySign: {
            "kid": "did:iota:tst:0x43e8de0883631604887805c6d7b96a6f4e728fd889e95feec8ad77acb8c785f0#sign-1",
            "use": "sig",
            "alg": "ES256",
            "kty": "EC",
            "x": "ehop5tvu0M7VGg2KsYPwozpb-ma4nmk131qMOzyuwA4",
            "y": "bMIX8jpgJDgfujyFBGwOhUctrVy2x1rHn74Iv_yPCMM",
            "crv": "P-256",
            "d": "SAEt1GgiZrc3IoKYrgPMwI7uXu11eF1vKo-zH3F3xM8"
        }
    },
    revenueAgencyTAO: {
        did: "did:iota:tst:0xc5f0c16656242b4e1f54dff58ebccc6373af0c8c976315d2eae2e77c1db7ab43",
        privateKeyDidControl: "0xd5c5daaa78cf1172f3df2942ef56c4fcf1cd8b1152b3e5e8b56da1c45104a064bfee0a3d93aae2f25aa8ebc84bc2dd4df7e9077b170bc45548d00f5dbff68d54",
        publicKeyDidControl: "0xbfee0a3d93aae2f25aa8ebc84bc2dd4df7e9077b170bc45548d00f5dbff68d54",
        privateKeySign: {
            "kid": "did:iota:tst:0xc5f0c16656242b4e1f54dff58ebccc6373af0c8c976315d2eae2e77c1db7ab43#sign-1",
            "use": "sig",
            "alg": "ES256",
            "kty": "EC",
            "x": "LepDRweiPs-GXXJVuqrfcVjHxqvh87PhorSBD4gQYiQ",
            "y": "8rWKQybzD4XAgZxi_NzAizh4x4GOpaU7T8qPJ3poC7M",
            "crv": "P-256",
            "d": "2zrT-WPElcQUsexabdQzr4cubXHjQf7sPAbbfY92h6o"
        }
    }
};
