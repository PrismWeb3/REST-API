import { HTTP } from "./export.ts";
import { Constants } from "../global/export.ts";
class IPFS {
  static isIPFSHash(hash: string) {
    // I'm pretty confident this is a solid regex to check format of the hash, but it should probally be tested further
    const regex =
      /^m[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}$/;
    return regex.test(hash);
  }

  async isOnline() {
    const versionEndpoint = "/api/v0/version";

    if (!Constants.IPFS.gatewayURL || !Constants.IPFS.restURL) {
      return (
        console.error("IPFS_GATEWAY_URL & IPFS_REST_URL REQUIERED"),
          Deno.exit(1)
      );
    }

    try {
      const gateway = await HTTP.post(
        Constants.IPFS.gatewayURL,
        versionEndpoint,
        {},
      );

      const rest = await HTTP.post(Constants.IPFS.restURL, versionEndpoint, {});

      if (!gateway.Version || !rest.Version) throw "";
    } catch {
      return console.error("IPFS GATEWAY OFFLINE"), Deno.exit(1);
    }
  }
}

export { IPFS };
