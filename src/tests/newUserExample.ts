// deno-lint-ignore-file
// This was just a quick test while there's no mobile client, so no need to lint or have ts
import { Crypto } from "../utils/crypto.ts";

const userKeypair = await crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["sign", "verify"],
);
const deviceKeypair = await crypto.subtle.generateKey(
  {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 4096,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  },
  true,
  ["sign", "verify"],
);

// @ts-ignore
function ab2str(buf) {
  // @ts-ignore
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

/*
  Export the given key and write it into the "exported-key" space.
  */
// @ts-ignore
async function exportCryptoPublicKey(key, type) {
  const exported = await crypto.subtle.exportKey(
    type === "public" ? "spki" : "pkcs8",
    key,
  );
  const exportedAsString = ab2str(exported);
  const exportedAsBase64 = btoa(exportedAsString);
  const pemExported = `-----BEGIN ${
    type === "private" ? "PRIVATE" : "PUBLIC"
  } KEY-----\n${exportedAsBase64}\n-----END ${
    type === "private" ? "PRIVATE" : "PUBLIC"
  } KEY-----`;

  return pemExported;
}

async function signRSA(
  message: string,
  privateKey: CryptoKey,
  publicKey: CryptoKey,
) {
  const enc = new TextEncoder();
  const def = new TextDecoder();
  let sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    enc.encode(message),
  );
  let encstr = btoa(ab2str(sig));
  let result = await window.crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    publicKey,
    Crypto.arrayBufferFromString(atob(encstr)),
    enc.encode(message),
  );
  console.log("VERIFY?", result);
  return encstr;
}

let unsignedDevice = {
  id: null,
  name: "HP's iPhone",
  publicKey: btoa(
    await exportCryptoPublicKey(deviceKeypair.publicKey, "public"),
  ),
};

let deviceHash = await Crypto.hash(JSON.stringify(unsignedDevice));
let unsignedTX = {
  prevHash: null,
  type: "newUser",
  body: {
    id: null,
    username: "HPaulson",
    publicKey: btoa(
      await exportCryptoPublicKey(userKeypair.publicKey, "public"),
    ),
    deviceHash: deviceHash,
    deviceSignature: await signRSA(
      deviceHash,
      deviceKeypair.privateKey,
      deviceKeypair.publicKey,
    ),
    device: unsignedDevice,
  },
};

let request = {
  username: "HPaulson",
  newUserPublicKey: btoa(
    await exportCryptoPublicKey(userKeypair.publicKey, "public"),
  ),
  newDeviceName: "HP's iPhone",
  newDevicePublicKey: btoa(
    await exportCryptoPublicKey(deviceKeypair.publicKey, "public"),
  ),
  proof: {
    txHash: await Crypto.hash(JSON.stringify(unsignedTX)),
    signature: await signRSA(
      await Crypto.hash(JSON.stringify(unsignedTX)),
      userKeypair.privateKey,
      userKeypair.publicKey,
    ),
    tx: unsignedTX,
  },
};
const enc = new TextEncoder();
Deno.writeFileSync(
  "user.pem",
  enc.encode(await exportCryptoPublicKey(userKeypair.privateKey, "private")),
);
Deno.writeFileSync(
  "device.pem",
  enc.encode(await exportCryptoPublicKey(deviceKeypair.privateKey, "private")),
);
console.log(
  await fetch("http://127.0.0.1:7621/newUser", {
    headers: new Headers({ "content-type": "application/json" }),
    method: "POST",
    body: JSON.stringify(request),
  }),
);
