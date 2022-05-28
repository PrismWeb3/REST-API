import { EditUserTX, NewUserTX, PostRequest } from "./export.ts";
export type User = {
  _id: string;
  username: string;
  userPublicKey: string;
  bio: string;
  name: string;
  avatarHash: string;
  /*
  Followers & Following will need to be greatly expanded in the future if we move to a true social graph (such as the ability to
  see who somoene is following/followed by within a client), but for now we'll just use int counts. It's my belief that client
  verifacation of mertics isn't really necessary, so for now we'll just return ints with the user object. However, it should be noted
  that following will require a signed chain tx, thus these counts could absolutely be verified & the exact users they follow
  (social graph) could be mapped, just not very easily.
  */
  followers: number;
  following: number;
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
    proofHash: string;
  }] | [];
  chain: [PostRequest<NewUserTX | EditUserTX>];
};
