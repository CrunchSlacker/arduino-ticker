import { restClient } from "@polygon.io/client-js";
import { SerialPort } from "serialport";
const rest = restClient("AowJMZoOhGI04pvMp3kZn4G31usP9yID");

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
    "NVDA",
    "1",
    "day",
    "2024-06-26",
    "2024-06-26"
  );

  return { ticker: data.ticker, closePrice: data.results[0].c };
}

async function main() {
  const stockInfo = await getInfo();

  setTimeout(() => {
    port.write(stockInfo.ticker + ": $" + stockInfo.closePrice.toString());
  }, 3000);
}

main();
