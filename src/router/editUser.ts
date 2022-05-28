import { Request, Response } from "../deps.ts";
import { Crypto, Respond } from "../utils/export.ts";
import { dbClient } from "../main.ts";
import { EditUserTX, PostRequest, User } from "../types/export.ts";
import { Constants } from "../global/export.ts";

async function handleEditUser(req: Request, res: Response) {
  if (Respond.checkContetType(req, res, "application/json")) {
    await req
      .body({ type: "json" })
      .value.then(async (jsonBody: PostRequest<EditUserTX>) => {
        if (jsonBody.tx.type != "editUser") {
          return Respond.send(res, 400, Constants.Errors.invalidProof);
        }

        const db = dbClient.database("prism");
        const users = db.collection<User>("users");

        // It might be worthwhile using regex for Username check so you could search for @USER and get @user (similar to newUser)
        // but I don't think this is needed for now

        const key = jsonBody.tx.body.id
          ? "_id"
          : jsonBody.tx.body.userPublicKey
          ? "userPublicKey"
          : jsonBody.tx.body.username
          ? "username"
          : null;

        if (!key) {
          Respond.send(res, 400, Constants.Errors.invalidUserInput);
        } else {
          await users.findOne({
            [key]: jsonBody.tx.body[key === "_id" ? "id" : key],
          })
            .then(async (user) => {
              // Admittedly, we throw invalidProof for a LOT of dif. situations in this endpoint & others. It's probally smart to add
              // additional more specific errors to improve dev flow, otherwise this could get annoying for 3rd party engineers

              if (!user) {
                return Respond.send(res, 404, Constants.Errors.UserNotFound);
              } else if (
                user[key] === jsonBody.tx.body[key === "_id" ? "id" : key]
              ) {
                if (
                  await Crypto.hash(JSON.stringify(jsonBody.tx)) !=
                    jsonBody.txHash
                ) {
                  return Respond.send(
                    res,
                    400,
                    Constants.Errors.invalidProof,
                  );
                }

                if (
                  !await Crypto.verifyRSAMessage(
                    user.userPublicKey,
                    jsonBody.txHash,
                    jsonBody.signature,
                  )
                ) {
                  return Respond.send(
                    res,
                    400,
                    Constants.Errors.invalidProof,
                  );
                }

                // ONCE IPFS: Validate that avatarHash is a valid uploaded image

                // Check to ensure all data about the user is valid. While only ONE OF id, publicKey, OR username is required,
                // we'll want to make sure all is valid if more than one is passed anyway

                if (
                  jsonBody.tx.body.userPublicKey &&
                  (user.userPublicKey != jsonBody.tx.body.userPublicKey)
                ) {
                  return Respond.send(
                    res,
                    400,
                    Constants.Errors.invalidProof,
                  );
                }

                if (
                  jsonBody.tx.body.username &&
                  (user.username != jsonBody.tx.body.username)
                ) {
                  return Respond.send(
                    res,
                    400,
                    Constants.Errors.invalidProof,
                  );
                }

                if (jsonBody.tx.body.id && (user._id != jsonBody.tx.body.id)) {
                  return Respond.send(
                    res,
                    400,
                    Constants.Errors.invalidProof,
                  );
                }

                if (
                  user.chain[user.chain.length - 1].txHash !=
                    jsonBody.tx.prevHash
                ) {
                  return Respond.send(
                    res,
                    400,
                    Constants.Errors.invalidProof,
                  );
                }

                const newUser = await users.updateOne({
                  // We probally only need to use ID here, but we'll use all 3 identifiers just to be safe & ensure the user hasen't
                  // changed by some other endpoint or action. We also want to ensure that the proof chain is unchanged since we got
                  // the request (This might already be done since we verify prevHash, but it doesn't hurt)

                  _id: user._id,
                  userPublicKey: user.userPublicKey,
                  username: user.username,
                  chain: user.chain,
                }, {
                  $set: jsonBody.tx.body.newUserData,
                  $push: {
                    // @ts-ignore TS doesn't like the type of $push chain, but this is perfectly valid
                    chain: jsonBody,
                  },
                });

                // We send back invalidProof because it's likely the case the user has changed, thus making the req proof no longer valid
                if (!newUser) {
                  return Respond.send(
                    res,
                    400,
                    Constants.Errors.invalidProof,
                  );
                } else {
                  const merge = { ...user, ...jsonBody.tx.body.newUserData };
                  res.status = 200;
                  res.body = merge;
                }
              } else {
                // This should never happen, but handle with 500 just incase
                return Respond.send(
                  res,
                  500,
                  Constants.Errors.unknownServerError,
                );
              }
            });
        }
      });
  }
}

export { handleEditUser };
