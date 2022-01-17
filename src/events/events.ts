import { Application } from "../deps.ts";

class Events {
  static listen = (app: Application) => {
    app.addEventListener("listen", ({ hostname, port, secure }) => {
      console.log(
        `Listening on: ${secure ? "https://" : "http://"}${
          hostname ??
            "localhost"
        }:${port}`,
      );
    });
  };
}

export { Events };
