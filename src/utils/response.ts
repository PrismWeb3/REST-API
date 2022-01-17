import { Request, Response } from "../deps.ts";
import { Errors } from "../global/export.ts";
class Respond {
  static send = (res: Response, code: number, msg: string | JSON) => {
    res.status = code;
    res.body = msg + "\n";
  };

  static checkContetType = (
    req: Request,
    res: Response,
    contentType: string,
  ) => {
    if (req.headers.get("Content-Type") != contentType) {
      Respond.send(
        res,
        400,
        Errors.contentTypeNotFound,
      );
      return false;
    } else return true;
  };
}

export { Respond };
