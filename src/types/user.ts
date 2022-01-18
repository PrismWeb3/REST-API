import { NewUserTX } from "./export.ts";
export type User = {
  _id: string;
  username: string;
  userPublicKey: string;
  clients: [
    {
      _id: string;
      name: string;
      clientPublicKey: string;
      paperKey: boolean;
    },
  ];
  createdAt: number;
  tempKeys: [{
    publicKey: string;
    expiresAt: number;
    signedBy: string;
  }] | [];
  chain: [ChainProof];
};

export type ChainProof = {
  txHash: string; // A hash of tx
  signature: string; // Signed hash of tx JSON string, with USER PUBLIC KEY
  tx: {
    prevHash: string | null;
    type: "newUser"; // Add event types as they're created
    body: NewUserTX; // Add event types as they're created
  };
};
