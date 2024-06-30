import "dotenv/config";
import { restClient } from "@polygon.io/client-js";
import { SerialPort } from "serialport";
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

async function getInfo() {
  const data = await rest.stocks.aggregates(
    "COST",
    "1",
    "minute",
    "2024-06-27",
    "2024-06-28",
    { sort: "desc", limit: "5" }
  );
  console.log(data);
  return { ticker: data.ticker, closePrice: data.results[0].c };
}

async function main() {
  const stockInfo = await getInfo();

  const formatedPrice = await formatPrice(stockInfo.closePrice);

  setTimeout(() => {
    port.write(
      stockInfo.ticker + ": $" + formatedPrice
    );
  }, 3000);
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
  return arrayPrice.join('') + stockPrice.slice(stockPrice.indexOf('.'));
}

main();

