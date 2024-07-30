import "dotenv/config";
import { restClient } from "@polygon.io/client-js";
import { SerialPort } from "serialport";
const rest = restClient(process.env.POLYGON_API);

import { intro, outro, text, confirm, spinner } from "@clack/prompts";

// Find the serial port
//   SerialPort.list().then((ports) => {
//     console.log(ports);
//   });

const port = new SerialPort({
  path: "COM4",
  baudRate: 9600,
  autoOpen: true,
});

async function getInfo(ticker) {
  const lastPrice = await rest.stocks.previousClose(ticker);
  return lastPrice.results[0].c;
}

async function getUserTicker() {
  const ticker = await text({
    message: "Enter a ticker: ",
    placeholder: "QQQ",
    defaultValue: "QQQ",
    validate(value) {
      if (value.length === 0 || value.length > 4) {
        return "Invalid Ticker";
      }
    },
  });
  return ticker;
}

async function main() {
  const ticker = await getUserTicker();

  const stockInfo = await getInfo(ticker);

  const formatedPrice = await formatPrice(stockInfo);
  const s = spinner();
  s.start("Sending Ticker");
  port.write(stockInfo.ticker + ": $" + formatedPrice);
  s.stop("Ticker Sent");
}

async function formatPrice(price) {
  let stockPrice = parseFloat(price).toFixed(2);

  let arrayPrice = [];

  //Pushes all numbers before "." to array
  for (let i = 0; i < stockPrice.length; i++) {
    if (stockPrice[i] !== ".") {
      arrayPrice.push(stockPrice[i]);
    } else {
      break;
    }
  }

  //Adds zeros to fill in space, example: format 00#.##
  let howManyZeros = 3 - arrayPrice.length;
  for (let i = 0; i < howManyZeros; i++) {
    arrayPrice.unshift(0);
  }

  //Returns formatted price
  return arrayPrice.join("") + stockPrice.slice(stockPrice.indexOf("."));
}

intro("Edit Ticker");
while (true) {
  await main();
  let cont = await confirm({ message: "Send another ticker?" });
  if (!cont) {
    outro("Goodbye");
    process.exit(0);
  }
}
