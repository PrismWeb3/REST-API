export type NewUserTX = {
  id: null;
  username: string;
  name: string;
  publicKey: string; // Base-64 encoded RSA Public Key
  deviceHash: string;
  deviceSignature: string; // Signed hash of device JSON string with DEVICE PUBLIC KEY
  device: {
    id: null;
    name: string;
    publicKey: string; // Base-64 encoded RSA Public Key
  };
};
