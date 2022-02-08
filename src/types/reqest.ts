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
