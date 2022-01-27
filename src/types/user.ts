import { PostReqest } from "./export.ts";
export type User = {
  _id: string;
  username: string;
  userPublicKey: string;
  bio: string;
  name: string;
  avatarHash: string;
  connections: {
    eth: {
      address: string;
      proofHash: string;
    } | null;
    deso: {
      address: string;
      proofHash: string;
    } | null;
  } | null;
  clients: [
    {
      _id: string;
      name: string;
      clientPublicKey: string;
      paperKey: boolean;
      createdAt: number;
    },
  ];
  createdAt: number;
  tempKeys: [{
    publicKey: string;
    expiresAt: number;
    signedBy: string;
  }] | [];
  chain: [PostReqest];
};
