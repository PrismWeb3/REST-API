import { ChainProof } from "./export.ts";
export type NewUserRequest = {
  username: string;
  newUserPublicKey: string; // Base64-encoded RSA Public Key PEM
  newDeviceName: string;
  newDevicePublicKey: string; // Base64-encoded RSA Public Key PEM
  proof: ChainProof;
};

export type GetUserRequest = {
  id?: string;
  userPublicKey?: string; // Base64-encoded RSA Public Key PEM
  username?: string;
};
