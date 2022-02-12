export type NewUserTX = {
  id: null;
  username: string;
  name: string;
  bio: string;
  avatarHash: string;
  publicKey: string; // Base-64 encoded RSA Public Key
  deviceHash: string;
  deviceSignature: string; // Signed hash of device JSON string with DEVICE PUBLIC KEY
  device: {
    id: null;
    name: string;
    publicKey: string; // Base-64 encoded RSA Public Key
  };
};

export type EditUserTX = {
  id?: null;
  username?: string;
  userPublicKey?: string; // Base-64 encoded RSA Public Key
  newUserData: {
    username?: string;
    name?: string;
    bio?: string;
    avatarHash?: string;
  };
};
