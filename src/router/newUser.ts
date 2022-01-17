import { Request, Response, Snowflake } from "../deps.ts";
import { Crypto, Respond } from "../utils/utils.ts";
import { dbClient } from "../main.ts";
import { NewUserRequest, User } from "../types/types.ts";
import { Errors } from "../global/global.ts";

async function handleNewUser(req: Request, res: Response) {
  if (req.headers.get("Content-Type") != "application/json") {
    return Respond.send(
      res,
      400,
      Errors.contentTypeNotFound,
    );
  } else {
    await req
      .body({ type: "json" })
      .value.then(async (jsonBody: NewUserRequest) => {
        if (!jsonBody.username || !jsonBody.newDeviceName) {
          return Respond.send(
            res,
            400,
            Errors.usernameDeviceNameNotFound,
          );
        }

        if (jsonBody.newUserPublicKey === jsonBody.newDevicePublicKey) {
          return Respond.send(
            res,
            400,
            Errors.duplicateSignupKeyInputs,
          );
        }

        try {
          await Crypto.importPublicRSA(atob(jsonBody.newUserPublicKey)),
            await Crypto.importPublicRSA(
              atob(jsonBody.newDevicePublicKey),
            );
        } catch {
          return Respond.send(
            res,
            400,
            Errors.invalidSignupKeys,
          );
        }

        /*
        We should probally also check that the keys are in fact 4096 keys, but for now we'll trust the client.
        In theroy this isn't a huge deal, it just allows accounts to be less secure if an indivisual client so chooses
        Adding this check later on should be considered!
        --
        Another feature that should be considered is a signature proof for the initial sign up. This would generate a proof in
        which you could verify that a speciifc key has "chosen" a username. This ensures that the server did not assign an initial
        public key to a username that it did not request (And that the client sending the request actually owns the private key).
         */

        const db = dbClient.database("prism");
        const users = db.collection<User>("users");

        if (await users.findOne({ username: jsonBody.username })) {
          return Respond.send(
            res,
            400,
            Errors.existingUsername,
          );
        } else {
          await users.insertOne({
            _id: Snowflake.generate({
              epoch: new Date("July 06 2021").getTime() / 1000,
            }),
            username: jsonBody.username,
            userPublicKey: jsonBody.newUserPublicKey,
            clients: [
              {
                _id: Snowflake.generate({
                  epoch: new Date("July 06 2021").getTime() / 1000,
                }),
                name: jsonBody.newDeviceName,
                clientPublicKey: jsonBody.newDevicePublicKey,
                paperKey: false,
              },
            ],
            createdAt: Date.now(),
            tempKeys: [],
          }).then((u) => {
            res.status = 200;
            res.body = u;
          }).catch((e) => {
            console.error(e);
          });
        }
      })
      .catch((e) => {
        console.error("E:", e);
        // We could probally use the error to provide a better response message, but this should surfice for now.
        try {
          return Respond.send(
            res,
            400,
            Errors.unknownPayloadTooLarge,
          );
        } catch {
          // If an unexpected error occurs the above response fail, so we catch any possble errors to save the process from exiting.
          return;
        }
      });
  }
}

export { handleNewUser };
