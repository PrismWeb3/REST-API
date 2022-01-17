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
};
