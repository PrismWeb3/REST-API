import { Application, RateLimiter } from "./deps.ts";
import { router } from "./router/export.ts";
import { DataBase } from "./db/connect.ts";
import { IPFS } from "./utils/export.ts";
import { Events } from "./events/events.ts";

const dbClient = await DataBase.connect();
new IPFS().isOnline();

const rateLimit = RateLimiter({
  windowMs: 1000,
  max: 10,
  headers: true,
  message: "TOO MANY REQUESTS",
  statusCode: 429,
});

const app = new Application();
app.use(rateLimit);
app.use(router.routes(), router.allowedMethods());
Events.listen(app);
Deno.env.set("TZ", "UTC"); // This is vital for timestamps to uniform across host machines
await app.listen({ port: 7621 });
export { dbClient };
