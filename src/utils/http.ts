import { FormDataFile } from "../deps.ts";

class HTTP {
  static async post(
    host: string,
    route: string,
    body: {
      json?: Record<string, unknown>;
      file?: FormDataFile;
    },
  ) {
    function getBody() {
      if (body?.file?.filename) {
        const data = new FormData();
        const fileBytes = Deno.readFileSync(body.file.filename);
        const blob = new Blob([fileBytes]);
        data.append("file", blob);
        return data;
      } else if (body.json) {
        return JSON.stringify(body.json);
      }
    }

    const resp = await fetch(host + route, {
      method: "POST",
      body: await getBody(),
    });

    if (resp.ok) {
      return resp.json().catch(() => {}) as Promise<Record<string, unknown>>;
    } else {
      throw resp;
    }
  }
}

export { HTTP };
