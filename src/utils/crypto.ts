class Crypto {
  static arrayBufferFromString(str: string) {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  static importPublicRSA(pem: string) {
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pem.substring(
      pemHeader.length,
      pem.length - pemFooter.length,
    );
    const binaryDerString = atob(pemContents);
    const binaryDer = this.arrayBufferFromString(binaryDerString);
    return crypto.subtle.importKey(
      "spki",
      binaryDer,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      true,
      ["verify"],
    );
  }

  static hash(input: string) {
    const utf8 = new TextEncoder().encode(input);
    return crypto.subtle.digest("SHA-256", utf8).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, "0"))
        .join("");
      return hashHex;
    });
  }

  static async verifyRSAMessage(
    publicKey: string,
    message: string,
    signature: string,
  ) {
    const decodedSignature = atob(signature);
    const decodedPublicKey = await this.importPublicRSA(atob(publicKey));

    const enc = new TextEncoder();
    const result = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      decodedPublicKey,
      this.arrayBufferFromString(decodedSignature),
      enc.encode(message),
    );
    return result;
  }
}

export { Crypto };
