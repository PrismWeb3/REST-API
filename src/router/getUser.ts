import { dbClient } from "../main.ts";
import { Respond } from "../utils/export.ts";
import { Request, Response } from "../deps.ts";
import { Errors } from "../global/export.ts";
import { GetUserRequest, User } from "../types/export.ts";

async function handleGetUser(req: Request, res: Response) {
  if (Respond.checkContetType(req, res, "application/json")) {
    await req
      .body({ type: "json" })
      .value.then(async (jsonBody: GetUserRequest) => {
        /*
        The hierarchy of inputs shall be: ID - PublicKey - Username
        It might be worthwhile to allow for multiple inputs, such as username & publicKey, to verify that a cached username has
        has same publicKey as before. This could be useful for ensuring that the server isn't lying about who owns a username
        I think this is solved using proofs anyway, so I won't implement it now, but just leaving it here as a future thought.
        */

        const db = dbClient.database("prism");
        const users = db.collection<User>("users");
        const key = jsonBody.id
          ? "_id"
          : (jsonBody.userPublicKey
            ? "userPublicKey"
            : (jsonBody.username ? "username" : null));
        if (!key) {
          Respond.send(res, 400, Errors.invalidUserInput);
        } else {
          await users.findOne({ [key]: jsonBody[key === "_id" ? "id" : key] })
            .then((user) => {
              if (!user) return Respond.send(res, 404, Errors.UserNotFound);
              else if (
                user[key] === jsonBody[key === "_id" ? "id" : key]
              ) {
                return Respond.send(res, 200, JSON.stringify(user));
              }
            });
        }
      });
  }
}

export { handleGetUser };
