import dayjs from "dayjs";

interface productInfo {
  startTime: Date;
  endTime: Date;
  name: string;
  descriptionActive: boolean;
  description?: string;
  address: string;
  price: string;
}
export const getProductInfo = (data: productInfo) => {
  return (
    `📆Дата начала: ${dayjs(data.startTime).format("DD.MM.YY | HH:mm ")}\n` +
    `🏁Дата конца: ${dayjs(data.endTime).format("DD.MM.YY | HH:mm ")}\n\n` +
    `💼Офис: ${data.name}\n` +
    `${data.descriptionActive ? "Описание: " + data.description + "\n" : ""}` +
    `\n💵Цена: ${data.price}\n` +
    `🏳️Адрес: ${data.address}\n`
  );
};
