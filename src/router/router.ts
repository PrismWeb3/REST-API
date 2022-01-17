import { Request, Response, Router, RouterContext } from "../deps.ts";
import { handleGetUser, handleNewUser } from "./export.ts";

class Routes {
  req: Request;
  res: Response;

  constructor(
    // @ts-ignore -- RouterContext doesn't like the use of any or string for the endpoint name, since R is an ext of string.
    // This value will always be a string, and won't cause any other issues, so we can ignore the ts check for convience.
    // deno-fmt-ignore
    // deno-lint-ignore no-explicit-any
    ctx: RouterContext<any, Record<string | number, string | undefined>, Record<string, any>>,
  ) {
    this.req = ctx.request;
    this.res = ctx.response;
  }

  Root() {
    this.res.status = 200;
  }
  async NewUser() {
    await handleNewUser(this.req, this.res);
  }
  async GetUser() {
    await handleGetUser(this.req, this.res);
  }
}

const router = new Router();
router
  .get("/", (context) => {
    new Routes(context).Root();
  })
  .post("/newUser", async (context) => {
    await new Routes(context).NewUser();
  })
  .post("/getUser", async (context) => {
    await new Routes(context).GetUser();
  });

export { router };
