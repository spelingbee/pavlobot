import { Inngest } from "inngest";
import axios from "axios";
import { serve } from "inngest/next";
import { bot } from "./main";
import dayjs from "dayjs";

const inngest = new Inngest({ name: "My app" });

const myFn = inngest.createFunction(
  { name: "Weekly digest email" }, // The name of your function, used for observability.
  { cron: dayjs(new Date(+new Date() + 60000)).format("m H D MMM d") }, // The cron syntax for the function. TZ= is optional.

  async ({ event, step }) => {
    await bot.api.sendMessage(1096612971, "foo");
    const cb = async () => {
      await bot.api.sendMessage(1096612971, "foo");
      await axios({
        method: "POST",
        url:
          process.env.VERCEL_HOST + process.env.VERCEL_URL + "/checkouts/check",
      });
      await step.sleepUntil(new Date(+new Date() + 10000));
      step.run("foo" + +new Date(), () => {
        cb();
      });
    };
    step.run("foo" + +new Date(), () => {
      cb();
    });
  }
);
export default serve("My App", [myFn]);
