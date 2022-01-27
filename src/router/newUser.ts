import { Request, Response, Snowflake } from "../deps.ts";
import { Crypto, Respond } from "../utils/export.ts";
import { dbClient } from "../main.ts";
import { PostReqest, User } from "../types/export.ts";
import { Errors } from "../global/export.ts";

async function handleNewUser(req: Request, res: Response) {
  if (Respond.checkContetType(req, res, "application/json")) {
    await req
      .body({ type: "json" })
      .value.then(async (jsonBody: PostReqest) => {
        if (!jsonBody.tx.body.username || !jsonBody.tx.body.device.name) {
          return Respond.send(
            res,
            400,
            Errors.usernameDeviceNameNotFound,
          );
        }

        if (jsonBody.tx.body.publicKey === jsonBody.tx.body.device.publicKey) {
          return Respond.send(
            res,
            400,
            Errors.duplicateSignupKeyInputs,
          );
        }

        try {
          await Crypto.importPublicRSA(atob(jsonBody.tx.body.publicKey)),
            await Crypto.importPublicRSA(
              atob(jsonBody.tx.body.device.publicKey),
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
        if (
          !jsonBody.tx || !jsonBody.tx.body.username ||
          !jsonBody.tx.body.name || jsonBody.tx.type != "newUser" ||
          jsonBody.tx.prevHash != null || jsonBody.tx.body.id ||
          jsonBody.txHash !=
            await Crypto.hash(JSON.stringify(jsonBody.tx)) ||
          !await Crypto.verifyRSAMessage(
            jsonBody.tx.body.publicKey,
            jsonBody.txHash,
            jsonBody.signature,
          ) ||
          !await Crypto.verifyRSAMessage(
            jsonBody.tx.body.device.publicKey,
            jsonBody.tx.body.deviceHash,
            jsonBody.tx.body.deviceSignature,
          )
        ) {
          return Respond.send(
            res,
            400,
            Errors.invalidProof,
          );
        }
        const db = dbClient.database("prism");
        const users = db.collection<User>("users");

        if (await users.findOne({ username: jsonBody.tx.body.username })) {
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
            username: jsonBody.tx.body.username,
            userPublicKey: jsonBody.tx.body.publicKey,
            connections: null,
            bio: "",
            name: jsonBody.tx.body.name,
            avatarHash: "QmdXgbfR8pFxE11t1yCdomNWtgz8EaNKr5rqXYeBj1uwcS",
            clients: [
              {
                _id: Snowflake.generate({
                  epoch: new Date("July 06 2021").getTime() / 1000,
                }),
                name: jsonBody.tx.body.device.name,
                clientPublicKey: jsonBody.tx.body.device.publicKey,
                paperKey: false,
                createdAt: Date.now(),
              },
            ],
            createdAt: Date.now(),
            tempKeys: [],
            chain: [jsonBody],
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
            Errors.invalidJsonBody,
          );
        } catch {
          // If an unexpected error occurs the above response fail, so we catch any possble errors to save the process from exiting.
          return;
        }
      });
  }
}

export { handleNewUser };
