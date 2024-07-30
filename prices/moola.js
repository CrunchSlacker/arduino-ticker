import "dotenv/config";
import { restClient } from "@polygon.io/client-js";
import { SerialPort } from "serialport";
import {
  intro,
  outro,
  text,
  spinner,
  isCancel,
  cancel,
  select,
} from "@clack/prompts";

const rest = restClient(process.env.POLYGON_API);

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
  try {
    const lastPrice = await rest.stocks.previousClose(ticker);
    return lastPrice.results[0].c;
  } catch (error) {
    return false;
  }
}

async function getUserTicker() {
  let ticker;
  let valid = false;

  while (!valid) {
    ticker = await text({
      message: "Enter a ticker: ",
      placeholder: "QQQ",
      defaultValue: "QQQ",
    });

    if (isCancel(ticker)) {
      cancel("Cancelled");
      process.exit(0);
    }

    const s = spinner();
    s.start("Validating Ticker");

    const stockInfo = await getInfo(ticker);

    if (stockInfo === false) {
      s.stop("Invalid Ticker. Please try again.");
    } else {
      valid = true;
      s.stop("Validated");
    }
  }

  return ticker;
}

async function main() {
  const ticker = await getUserTicker();

  const stockInfo = await getInfo(ticker);

  const formatedPrice = await formatPrice(stockInfo);
  const s = spinner();
  s.start("Sending Ticker");
  port.write(ticker + ": $" + formatedPrice);
  s.stop("Ticker Sent");
}

async function formatPrice(price) {
  let stockPrice = parseFloat(price).toFixed(2);

  let arrayPrice = [];

  // Pushes all numbers before "." to array
  for (let i = 0; i < stockPrice.length; i++) {
    if (stockPrice[i] !== ".") {
      arrayPrice.push(stockPrice[i]);
    } else {
      break;
    }
  }

  // Adds zeros to fill in space, example: format 00#.##
  let howManyZeros = 3 - arrayPrice.length;
  for (let i = 0; i < howManyZeros; i++) {
    arrayPrice.unshift(0);
  }

  // Returns formatted price
  return arrayPrice.join("") + stockPrice.slice(stockPrice.indexOf("."));
}

intro("Edit Ticker");

while (true) {
  await main();
  const cont = await select({
    message: "What's next?",
    options: [{value: true, label: "Change Ticker"}, {value: false, label: "Exit"}]
  })
  if (!cont) {
    outro("Goodbye");
    process.exit(0);
  }
}
