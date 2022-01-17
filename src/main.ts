import { Application } from "./deps.ts";
import { router } from "./router/router.ts";
import { DataBase } from "./db/connect.ts";
import { Events } from "./events/events.ts";

const dbClient = await DataBase.connect();

const app = new Application();
app.use(router.routes(), router.allowedMethods());
Events.listen(app);
Deno.env.set("TZ", "UTC"); // This is vital for timestamps to uniform across host machines
await app.listen({ port: 7621 });
export { dbClient };
