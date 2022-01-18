class Errors {
  static contentTypeNotFound =
    "HEADER NOT FOUND: Content-Type: application/json";
  static usernameDeviceNameNotFound =
    "SOME REQUIERED FIELDS NOT FOUND: username, newDeviceName";
  static duplicateSignupKeyInputs =
    "DUPLICATE INPUTS: newDevicePublicKey, newUserPublicKey";
  static invalidSignupKeys =
    "SOME REQUIERED FIELDS ARE INVALID: newDevicePublicKey, newUserPublicKey; BASE64 RSA 4096 PUBLIC KEYS EXPECTED";
  static existingUsername = "USERNAME ALREADY EXISTS";
  static unknownPayloadTooLarge = "UNKNOWN REQUEST ERROR - PAYLOAD TOO LARGE?";
  static mongoConnectionError = "MONGODB CONNECTION ERROR - COULD NOT CONNECT";
  static invalidGetUserInput =
    "INVALID INPUT: id, userPublicKey, OR username REQUIERED";
  static UserNotFound = "INVALID INPUT: USER NOT FOUND";
  static invalidProof = "INVALID PROOF: SIGNED TX PROOF REQUIERED";
}

export { Errors };
