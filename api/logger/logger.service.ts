import { ConsoleLogger, Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.TRANSIENT })
export class MyLogger extends ConsoleLogger {
  customLog() {
    this.log("Please feed the cat!");
  }
}
