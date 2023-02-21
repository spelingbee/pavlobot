import { Injectable } from "@nestjs/common";
import axios from "axios";
import * as crypto from "crypto";

function hmac(algorithm, payload, secretKey) {
  return crypto.createHmac(algorithm, secretKey).update(payload).digest("hex");
}

@Injectable()
export class AppService {
  async getHello(data): Promise<{ data: object }> {
    const nonce = new Date().getTime().toString().padStart(32, "0");
    const time = new Date().getTime();
    const payload = time + "\n" + nonce + "\n" + JSON.stringify(data) + "\n";
    const signature = hmac(
      "sha512",
      payload,
      "hx84qkbcimf4l8uewavekd9m04mnd5tdtly4jllpfdw2fmsmkklygg1o4gh1ywlt"
    ).toUpperCase();
    return await axios({
      method: "POST",
      url: "https://bpay.binanceapi.com/binancepay/openapi/v2/order",
      data,
      headers: {
        "content-type": "application/json",
        "BinancePay-Certificate-SN":
          "wu2rkpghhb2oywsylpibbbwch0uwzxpav20k71qxdl0is51l3pbdkj4b3knxeb7r",
        "BinancePay-Timestamp": time,
        "BinancePay-Nonce": nonce,
        "BinancePay-Signature": signature,
      },
    });
  }
}
