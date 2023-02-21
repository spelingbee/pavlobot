import { webhookCallback } from "grammy";
import axios from "axios";
import { bot } from "./main";
import { StatusEnum } from "./users/enums/status.enum";
import * as process from "process";
import { getProductInfo } from "./utils/getProductInfo";
const webAppUrl: { url: string } = {
  url: process.env.BOT_URL as string,
};
bot.api.setChatMenuButton({
  menu_button: {
    text: "Book office",
    web_app: {
      url: webAppUrl.url,
    },
    type: "web_app",
  },
});
bot.command("start", async (ctx) => {
  try {
    await ctx.reply(
      `Привет ${ctx.from.username}! \n` +
        "Спасибо что заинтересовался нашим ботом \n" +
        "по услуге аренды офиса на Бали!\n" +
        "\n" +
        "По кнопке Book Office ты можешь посмотреть \n" +
        "локации для аренды офиса.\n" +
        "\n" +
        "Мы будем расширять нашу базу офисов на всем острове\n" +
        "чтобы тебе было удобно работать в любой точке\n",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Book Office",
                web_app: {
                  url: process.env.BOT_URL,
                },
              },
            ],
          ],
        },
      }
    );
    await axios(
      process.env.VERCEL_HOST + process.env.VERCEL_URL + "/users/create",
      {
        method: "POST",
        data: {
          id: ctx.from.id,
          languageCode: ctx.from.language_code,
          firstName: ctx.from.first_name,
          lastName: ctx.from.last_name,
          username: ctx.from.username,
          botId: ctx.me.id,
        },
      }
    );
  } catch (error) {
    if (error.response) {
      if (error.response.data.message === "Такой пользователь уже существует") {
        await axios({
          method: "PATCH",
          url:
            process.env.VERCEL_HOST +
            process.env.VERCEL_URL +
            "/users/" +
            ctx.chat.id,
          data: {
            status: StatusEnum.started,
          },
        });
      }
      console.log(error.response?.data?.message || error.response);
    }
  }
});
bot.on("my_chat_member", async (ctx) => {
  if (ctx.update.my_chat_member.new_chat_member.status === "kicked") {
    await axios({
      method: "PATCH",
      url:
        process.env.VERCEL_HOST +
        process.env.VERCEL_URL +
        "/users/" +
        ctx.update.my_chat_member.chat.id,
      data: {
        status: StatusEnum.kicked,
      },
    });
  }
});
bot.on("callback_query:data", async (ctx) => {
  try {
    if (ctx.callbackQuery.data.includes("delete checkout")) {
      await axios({
        method: "DELETE",
        url:
          process.env.VERCEL_HOST +
          process.env.VERCEL_URL +
          "/checkouts/" +
          ctx.callbackQuery.data.split("#")[1],
        data: {
          status: StatusEnum.kicked,
        },
      });
      await ctx.reply("Ваша заявка была успешна удалена");
    } else if (ctx.callbackQuery.data.includes("details")) {
      const orderId = JSON.parse(ctx.callbackQuery.data.split("#")[1]);
      const order = (
        await axios({
          method: "GET",
          url:
            process.env.VERCEL_HOST +
            process.env.VERCEL_URL +
            "/orders/" +
            orderId,
          data: {
            status: StatusEnum.kicked,
          },
          params: {
            relations: JSON.stringify([
              "transaction",
              "transaction.currency",
              "category",
            ]),
          },
        })
      ).data;
      await ctx.reply(
        getProductInfo({
          startTime: new Date(order.productStartDate),
          endTime: new Date(
            +new Date(order.productStartDate) +
              +order.category.durationInMilliseconds
          ),
          name: order.category.name,
          descriptionActive: order.category.descriptionActive,
          description: order.category.description,
          address: order.category.address,
          price: `${order.transaction.amount.toFixed()} ${
            order.transaction.currency.shortName
          }`,
        })
      );
    } else if (ctx.callbackQuery.data.includes("confirm1")) {
      const checkoutId = ctx.callbackQuery.data.split("#")[1];
      await axios({
        method: "PATCH",
        url:
          process.env.VERCEL_HOST +
          process.env.VERCEL_URL +
          "/checkouts/" +
          checkoutId,
        data: {
          paid: true,
        },
      });
      await ctx.reply("Успешно подтверждено");
    }
  } catch (error) {
    if (error.response) {
      console.log(error.response.data?.message || error.response.data);
      await ctx.reply(
        "Ошибка" + error.response.data?.message || error.response.data
      );
    } else {
      await ctx.reply("Непредвиденная ошибка");
    }
  }
});
bot.command("data", async (ctx) => {
  await ctx.reply(JSON.stringify(ctx));
});
bot.command("admin", async (ctx) => {
  try {
    const user = (
      await axios({
        method: "GET",
        url:
          process.env.VERCEL_HOST +
          process.env.VERCEL_URL +
          "/users/" +
          ctx.from.id,
      })
    ).data;
    if (user.isAdmin) {
      await ctx.reply(`Привет, ${ctx.from.username}`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Admin panel",
                web_app: {
                  url: process.env.BOT_URL + "/admin-categories",
                },
              },
            ],
          ],
          resize_keyboard: true,
        },
      });
    } else {
      await ctx.reply("If you need help, please click the button below", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Contact Support",
                url: "https://t.me/OfficeHubSupportBot",
              },
            ],
          ],
        },
      });
    }
  } catch (error) {
    if (error.response) {
      console.log(error.response?.data?.message || error.response);
    }
  }
});
bot.on("message", async (ctx) => {
  try {
    await ctx.reply("If you need help, please click the button below", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Contact Support",
              url: "https://t.me/OfficeHubSupportBot",
            },
          ],
        ],
      },
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response?.data?.message || error.response);
    }
  }
});
export default webhookCallback(bot, "http");
