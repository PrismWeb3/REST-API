export type Image = {
  _id: string; // Snowflake
  IPFSHash: string;
  uploadedBy: string; // User Snowflake
  type: "message" | "avatar";
  contextID: string; // User | Message Channel Snowflake
};

export type IPFSResponse = {
  Name: string;
  Hash: string;
  Size: string;
};
