import http from "k6/http";
import { check } from "k6";
import { sleep } from "k6";

export default function () {
  const getRes = http.get("http://localhost:3000/cryptocurrencies/");
  check(getRes, {
    "GET /cryptocurrencies returns status 200": (r) => r.status === 200,
  });

  const postData = { currencyName: "bitcoin" };
  const postRes = http.post(
    "http://localhost:3000/cryptocurrencies/forecast",
    JSON.stringify(postData),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  check(postRes, {
    "POST /cryptocurrencies/forecast returns status 200": (r) =>
      r.status === 200,
  });

  sleep(1);
}
