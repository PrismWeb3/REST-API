import { Request, Response } from "../deps.ts";
import { Constants } from "../global/export.ts";
class Respond {
  static send = (
    res: Response,
    code: number,
    msg: string | JSON | Record<string, unknown>,
  ) => {
    res.status = code;
    res.body = msg + "\n";
  };

  static checkContetType = (
    req: Request,
    res: Response,
    contentType: string,
  ) => {
    if (!req.headers.get("Content-Type")?.includes(contentType)) {
      Respond.send(
        res,
        400,
        Constants.Errors.contentTypeNotFound,
      );
      return false;
    } else return true;
  };
}

export { Respond };
