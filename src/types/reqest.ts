import { FormDataFile } from "../deps.ts";
export type GetUserRequest = {
  id?: string;
  userPublicKey?: string; // Base64-encoded RSA Public Key PEM
  username?: string;
};
export type PostRequest<Body> = {
  txHash: string; // A hash of tx
  signature: string; // Signed hash of tx JSON string, with USER PUBLIC KEY
  tx: {
    prevHash: string | null;
    type: "newUser" | "editUser"; // Add event types as they're created
    body: Body; // Add event types as they're created
  };
};

export type UploadRequest = {
  images: FormDataFile[] | undefined;
  contextHash: string; // Hash of context JSON string
  context: {
    timestamp: number; // Unix timestamp in MS, ALWAYS USE UTC!!
    type: "avatar" | "message";
    id: string; // ID of User (avatar) or Message Channel; This just makes it easier to filter down when requesting getImage
    userPublicKey: string; // PublicKey of User (who sent the message / changed avatar); Used to verify signature
  } | undefined;
  signature: string; // Signed contextHash; This is just used to ensure the request comes from a valid Prism user
};
