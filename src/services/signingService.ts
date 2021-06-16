import { ISigningRequest } from "../models/ISigningRequest";
import { ISigningResult } from "../models/ISigningResult";

export default class SigningService {
    public static async sign(request: ISigningRequest): Promise<ISigningResult> {
        const response: ISigningResult = {
            verificationMethod: request.verificationMethod,
            signature: ""
        };

        return response;
    }
}
