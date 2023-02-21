import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import * as crypto from "crypto";
import * as process from "process";
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.headers.user && !request.headers.user_hash) {
      return true;
    }
    const initData = request.headers.user;
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");

    params.delete("hash");
    const dataCheckArr = [];
    for (const [key, value] of params) {
      dataCheckArr.push(`${key}=${value}`);
    }
    dataCheckArr.sort();
    const key = crypto
      .createHmac("sha256", "WebAppData")
      .update(process.env.BOT_TOKEN)
      .digest();
    const validateHash = crypto
      .createHmac("sha256", key)
      .update(dataCheckArr.join("\n"))
      .digest("hex");
    return validateHash === hash;
  }
}
