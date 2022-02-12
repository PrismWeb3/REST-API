import { Request, Response, Snowflake } from "../deps.ts";
import { Crypto, IPFS, Respond } from "../utils/export.ts";
import { dbClient } from "../main.ts";
import { NewUserTX, PostRequest, User } from "../types/export.ts";
import { Errors } from "../global/export.ts";

async function handleNewUser(req: Request, res: Response) {
  if (Respond.checkContetType(req, res, "application/json")) {
    await req
      .body({ type: "json" })
      .value.then(async (jsonBody: PostRequest<NewUserTX>) => {
        if (jsonBody.tx.type != "newUser") {
          return Respond.send(res, 400, Errors.invalidProof);
        }

        // We should also add a check to ensure the username is actually valid (> 4 chars, no spaces, whatever)
        // This isnt implemented anywhere as of yet (i.e should be added here, and in editUser)

        if (!jsonBody.tx.body?.username || !jsonBody.tx.body.device.name) {
          return Respond.send(res, 400, Errors.usernameDeviceNameNotFound);
        }

        if (jsonBody.tx.body.publicKey === jsonBody.tx.body.device.publicKey) {
          return Respond.send(res, 400, Errors.duplicateSignupKeyInputs);
        }

        try {
          await Crypto.importPublicRSA(atob(jsonBody.tx.body.publicKey)),
            await Crypto.importPublicRSA(
              atob(jsonBody.tx.body.device.publicKey),
            );
        } catch {
          return Respond.send(res, 400, Errors.invalidSignupKeys);
        }

        /*
        We should probally also check that the keys are in fact 4096 keys, but for now we'll trust the client.
        In theroy this isn't a huge deal, it just allows accounts to be less secure if an indivisual client so chooses
        Adding this check later on should be considered!

        Some other checks to be added:
        - Username length
        - Name format/length
        - Bio length
        */

        if (
          !jsonBody.tx ||
          !jsonBody.tx.body.username ||
          IPFS.isIPFSHash(jsonBody.tx.body.avatarHash) ||
          !jsonBody.tx.body.name ||
          jsonBody.tx.prevHash != null ||
          jsonBody.tx.body.id ||
          jsonBody.txHash != (await Crypto.hash(JSON.stringify(jsonBody.tx))) ||
          !(await Crypto.verifyRSAMessage(
            jsonBody.tx.body.publicKey,
            jsonBody.txHash,
            jsonBody.signature,
          )) ||
          !(await Crypto.verifyRSAMessage(
            jsonBody.tx.body.device.publicKey,
            jsonBody.tx.body.deviceHash,
            jsonBody.tx.body.deviceSignature,
          ))
        ) {
          return Respond.send(res, 400, Errors.invalidProof);
        }
        const db = dbClient.database("prism");
        const users = db.collection<User>("users");

        if (
          await users.findOne({
            $or: [
              // This querey should be changed to case insensitive. You can't have "@user" & "@USER" both exist

              { username: jsonBody.tx.body.username },
              { userPublicKey: jsonBody.tx.body.publicKey },
              // I don't think it's necisary to ensure client public key's are unique, so we won't check for dupes here.
            ],
          })
        ) {
          return Respond.send(res, 400, Errors.existingUsername);
        } else {
          const newUser: User = {
            _id: Snowflake.generate({
              epoch: new Date("July 06 2021").getTime() / 1000,
            }),
            username: jsonBody.tx.body.username,
            userPublicKey: jsonBody.tx.body.publicKey,
            connections: null,
            followers: 0,
            following: 0,
            bio: jsonBody.tx.body.bio || "", // If they passed null or undefined, we'll just default an empty string
            name: jsonBody.tx.body.name,
            avatarHash: jsonBody.tx.body.avatarHash,
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
          };
          await users
            .insertOne(newUser)
            .catch((e) => {
              console.error(e);
            })
            .then((_) => {
              res.status = 200;
              res.body = newUser;
            });
        }
      })
      .catch((_) => {
        // We could probally use the error to provide a better response message, but this should surfice for now.
        try {
          return Respond.send(res, 400, Errors.invalidJsonBody);
        } catch {
          // If an unexpected error occurs the above response fail, so we catch any possble errors to save the process from exiting.
          return;
        }
      });
  }
}

export { handleNewUser };
