export type User = {
  _id: string;
  username: string;
  user_public_key: string;
  clients: [
    {
      _id: string;
      name: string;
      client_public_key: string;
      paper_key: boolean;
    },
  ];
  created_at: number;
  temp_keys: [{
    public_key: string;
    expires_at: number;
    signed_by: string;
  }] | [];
};
