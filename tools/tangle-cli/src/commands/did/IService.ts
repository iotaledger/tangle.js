// Copyright 2021 IOTA Stiftung.
// SPDX-License-Identifier: Apache-2.0.
export interface IService {
    id: string;
    type: string | string[];
    serviceEndpoint: string;
}
