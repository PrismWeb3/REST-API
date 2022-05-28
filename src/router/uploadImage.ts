import { FormDataBody, Request, Response, Snowflake } from "../deps.ts";
import { Crypto, HTTP, IPFS, Respond } from "../utils/export.ts";
import { Image, IPFSResponse, UploadRequest, User } from "../types/export.ts";
import { Constants } from "../global/export.ts";
import { dbClient } from "../main.ts";

/*
Uploading Images Methodology:

For image uploads, we're going to use IFPS. This applies to avatar images, images sent in messages, and so on. The reason for using
IPFS is, of course, to decentralized storage (And also make our lives a little easier -- we don't have to carry the lifting for storage)
This allows images to be trustless because otherwise we could simply re-arrange data (Since there's no great way to "sign" an image)

Because of the way IPFS works, we want to ensure that images uploaded to our node are actually relevant to Prism. For this reason,
our write API & gateway are both restricted to local access (Whcih can be changed to a specific IP in prod). When a user wants to upload
an image, the process will work like this:

- User sends the image over form data to our server
  - This request will include the image, and associated metadata. This metadata will include things like a user ID (for avatar change)
    or a Channel ID (For message images). This metadata will allow us to filter down images & provide context when getting images, as
    outlined in Getting Images Methodology (See getImage.ts")

    Additionally, this metadata will include a timestamp, publicKey, and signature. It should be made VERY clear that the signature used
    in this metadata is NON TRIVIAL and DOES NOT effect user security. The signature here is, inherintly, insecure. Since the user is
    not signing any specifc image upload, the same signature could be used to submit multiple requests to this endpoint - but that's ok
    We don't actually care that much about the signature; It isn't being used to verify the user's identity. We really don't care who
    actually uploads an image, so long as that person is a Prism user -- that's what we're checking here. The entire purpose of this
    signature is to verify that the user sending this request is infact a user of our service, and therefore should be allowed to upload
    a file to our IPFS server. This is important because of the way IPFS cache's data; we don't want anyone to be able to upload via
    our api because if they do, IPFS will cache that file, which is annoying if they don't even use our service / we don't care about
    the file they uploaded.

    The included timestamp will be used to ensure the request is "new-ish". As mentioned we really don't care about the signature that
    much, it's just for our own bandwidth sake, but we will make sure the request was "supposed" to be submitted soon-ish (within 5s)
    of when it actually was. I don't think this is *really* needed, but I'm doing it anyway because it feels right & doesn't effect much else

- Our server processes the request, and uploads the image to IPFS if valid req
- Our server stores the request context (type, publicKey of uploader, & ID) along with the IPFS file hash in an image database.
  Note that the signature isn't stored anywhere, because again, we really don't care about it. Think of the signature like a rate-limit
  device of sorts, it replaces a token that auths a user as a legit prism user. We can also use this system to implement endpoint
  specific request limits in the future, so it makes sense

- Periodically, this DB will be "garbage collected". In this context, we will clear out any documents which haven't made it into a
  user tx. This means that if a user uploads an avatar, but then never actually submits an editUser request using the hash of that image
  we'll eventually clear it from our DB (This makes it so the image can't be requested later, see Getting Images Methodology)

  It might be smart to make it so replaced avatars are also removed at collection time. If the editProfile tx that signed this
  image hash into use is replaced by a new editProfile (That incl. an avatarHash), we can probally delete the old one from our DB since
  it's not in use anymore. For now though, we won't do this, since I think it might cause issued client side if the client hasn't
  fetched/verified new tx chain items yet
*/

async function handleUploadImage(req: Request, res: Response) {
  if (Respond.checkContetType(req, res, "multipart/form-data")) {
    await req
      .body({ type: "form-data" })
      .value.read({})
      .then(async (formBody: FormDataBody) => {
        try {
          JSON.parse(formBody.fields.context);
        } catch {
          return Respond.send(res, 400, Constants.Errors.invalidUploadBody);
        }
        
        const body: UploadRequest = {
          images: formBody.files,
          context: JSON.parse(formBody.fields.context),
          contextHash: formBody.fields.contextHash,
          signature: formBody.fields.signature,
        };
        
        console.log("SENT", JSON.parse(formBody.fields.data))
        // @ts-ignore
        console.log(body.images[0].filename, await Deno.openSync(body.images[0].filename).stat())
        if (
          !body.images ||
          !body.context?.id ||
          // We'll consider the request valid upto 5s after the signed timestamp
          body.context.timestamp + 5000 < new Date().getUTCMilliseconds() ||
          !body.context.type ||
          !body.context.userPublicKey ||
          !body.contextHash ||
          !body.signature ||
          (await Crypto.hash(JSON.stringify(body.context))) !=
            body.contextHash ||
          !(await Crypto.verifyRSAMessage(
            body.context.userPublicKey,
            body.contextHash,
            body.signature,
          ))
        ) {
          return Respond.send(res, 400, Constants.Errors.invalidUploadBody);
        }

        const db = dbClient.database("prism");
        const users = db.collection<User>("users");
        const images = db.collection<Image>("images");
        const user = await users.findOne({
          userPublicKey: body.context.userPublicKey,
        });
        if (!user) {
          return Respond.send(res, 400, Constants.Errors.invalidUploadBody);
        }
        switch (body.context.type) {
          case "avatar": {
            if (body.images.length > 1) {
              return Respond.send(
                res,
                400,
                Constants.Errors.unexpectedUploadImage,
              );
            }
            if (user._id != body.context.id) {
              return Respond.send(
                res,
                400,
                Constants.Errors.unexpectedUploadImage,
              );
            }
            if (!body?.images) {
              return Respond.send(
                res,
                400,
                Constants.Errors.unexpectedUploadImage,
              );
            }
            try {

              const ipfsResp = (await HTTP.post(
                Constants.IPFS.restURL,
                "/api/v0/add",
                { file: body.images[0] },
              )) as IPFSResponse;

              const image: Image = {
                _id: Snowflake.generate({
                  epoch: new Date("July 06 2021").getTime() / 1000,
                }),
                IPFSHash: ipfsResp.Hash,
                uploadedBy: user._id,
                type: body.context.type,
                contextID: body.context.id,
              };

              await images
                .insertOne(image)
                .then(() => {
                  Respond.send(res, 200, image);
                })
                .catch(() => {
                  return Respond.send(
                    res,
                    500,
                    Constants.Errors.unknownServerError,
                  );
                });
            } catch {
              return Respond.send(
                res,
                500,
                Constants.Errors.unknownUploadError,
              );
            }
            break;
          }
          case "message": {
            break;
          }
        }
      });
  }
}

export { handleUploadImage };
