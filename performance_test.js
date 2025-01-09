import http from "k6/http";
import { check } from "k6";
import { sleep } from "k6";

export default function () {
  const getRes = http.get("http://localhost:3333/cryptocurrencies");

  check(getRes, {
    "GET /  returns status 200": (r) => r.status === 200,
  });
  let forecastPayload = JSON.stringify({
    currencyName: "BNB",
  });

  let forecastRes = http.post(
    "http://localhost:3333/cryptocurrencies/forecast",
    forecastPayload,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  check(forecastRes, {
    "POST /cryptocurrencies/forecast status is 200": (r) => r.status === 200,
    "Response contains forecasted values": (r) =>
      r.body.includes("forecastedValues"),
  });
  responseTimeTrend.add(forecastRes.timings.duration);

  let historicalRes = http.get(
    "http://localhost:3333/cryptocurrencies/historical-data?currencyName=BNB&period=month"
  );
  check(historicalRes, {
    "GET /cryptocurrencies/historical-data status is 200": (r) =>
      r.status === 200,
  });
  responseTimeTrend.add(historicalRes.timings.duration);

  sleep(1);
}
