import { Application } from "./deps.ts";
import { router } from "./router/export.ts";
import { DataBase } from "./db/connect.ts";
import { Events } from "./events/events.ts";
import { RateLimiter } from "https://deno.land/x/oak_rate_limit/mod.ts";

const dbClient = await DataBase.connect();

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
