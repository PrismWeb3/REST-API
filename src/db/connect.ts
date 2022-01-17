import { MongoClient } from "../deps.ts";

class DataBase {
  static connect = async () => {
    const client = new MongoClient();
    const mongoEnv = Deno.env.get("MONGO_CONNECTION_STRING");
    typeof mongoEnv != "string"
      ? (console.error("MONGO_CONNECTION_STRING REQUIERED"), Deno.exit(1))
      : await client.connect(mongoEnv).catch((e) => {
        console.error(e);
        console.log(mongoEnv);
      });
    return client;
  };
}

export { DataBase };
