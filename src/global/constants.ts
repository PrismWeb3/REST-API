class Constants {
  static Errors = class {
    static contentTypeNotFound = "INVALID HEADER: Content-Type";
    static readonly usernameDeviceNameNotFound =
      "SOME REQUIERED FIELDS NOT FOUND: username, newDeviceName";
    static readonly duplicateSignupKeyInputs =
      "DUPLICATE INPUTS: newDevicePublicKey, newUserPublicKey";
    static readonly invalidSignupKeys =
      "SOME REQUIERED FIELDS ARE INVALID: newDevicePublicKey, newUserPublicKey; BASE64 RSA 4096 PUBLIC KEYS EXPECTED";
    static readonly existingUsername = "USERNAME OR PUBLIC KEY ALREADY EXISTS";
    static readonly invalidJsonBody =
      "COULD NOT PARSE JSON BODY: INVALID SYNTAX OR PAYLOAD";
    static readonly mongoConnectionError =
      "MONGODB CONNECTION ERROR - COULD NOT CONNECT";
    static readonly invalidUserInput =
      "INVALID INPUT: id, userPublicKey, OR username REQUIERED";
    static readonly UserNotFound = "INVALID INPUT: USER NOT FOUND";
    static readonly invalidProof = "INVALID PROOF: SIGNED TX PROOF REQUIERED";
    static readonly unknownServerError = "UNKNOWN SERVER ERROR";
    static readonly invalidUploadBody =
      "INVALID UPLOAD BODY: VALID signature, image, & context REQUIERED";
    static readonly unexpectedUploadImage =
      "UNEXPECTED INPUT: TYPE avatar EXPECTED ONLY ONE IMAGE FILE";
    static readonly unknownUploadError = "UNKNOWN IPFS UPLOAD ERROR";
  };

  static IPFS = class {
    static readonly gatewayURL = Deno.env.get("IPFS_GATEWAY_URL") as string;
    static readonly restURL = Deno.env.get("IPFS_REST_URL") as string;
  };

  static Mongo = class {
    static readonly connectionString = Deno.env.get(
      "MONGO_CONNECTION_STRING",
    ) as string;
  };
}

export { Constants };
