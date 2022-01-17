import { MongoClient } from "../deps.ts";
import { Errors } from "../global/errors.ts";

class DataBase {
  static connect = async () => {
    const client = new MongoClient();
    const mongoEnv = Deno.env.get("MONGO_CONNECTION_STRING");
    typeof mongoEnv != "string"
      ? (console.error("MONGO_CONNECTION_STRING REQUIERED"), Deno.exit(1))
      : await client.connect(mongoEnv).catch((e) => {
        console.error(Errors.mongoConnectionError, e);
        Deno.exit(111); //  We don't want to proceed if the DB won't connect, since it's vital for the Validator to function
      });
    return client;
  };
}

export { DataBase };
