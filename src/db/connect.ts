import { MongoClient } from "../deps.ts";
import { Constants } from "../global/export.ts";

class DataBase {
  static connect = async () => {
    const client = new MongoClient();
    const mongoEnv = Constants.Mongo.connectionString;
    typeof mongoEnv != "string"
      ? (console.error("MONGO_CONNECTION_STRING REQUIERED"), Deno.exit(1))
      : await client.connect(mongoEnv).catch((e) => {
        console.error(Constants.Errors.mongoConnectionError, e);
        Deno.exit(1); //  We don't want to proceed if the DB won't connect, since it's vital for the server to function
      });
    return client;
  };
}

export { DataBase };
