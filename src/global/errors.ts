class Errors {
  static readonly contentTypeNotFound =
    "HEADER NOT FOUND: Content-Type: application/json";
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
}

export { Errors };
