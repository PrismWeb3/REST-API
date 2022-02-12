class IPFS {
  static isIPFSHash(hash: string) {
    // I'm pretty confident this is a solid regex to check format of the hash, but it should probally be tested further
    const regex =
      /^m[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}$/;
    return regex.test(hash);
  }
}

export { IPFS };
