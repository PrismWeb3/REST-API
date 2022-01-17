export type NewUserRequest = {
  username: string;
  newUserPublicKey: string; // RSA 4096 Public Key
  newDeviceName: string;
  newDevicePublicKey: string; // RSA 4096 Public Key
};
