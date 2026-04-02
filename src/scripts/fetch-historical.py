import json
import requests
import datetime
import xml.etree.ElementTree as ET
from pathlib import Path
import sys

DATA_DIR = Path(__file__).parent.parent / "data"

CURRENCY_CODES = {
    "USD": "rates_historical_usd.json",
    "EUR": "rates_historical_eur.json",
}


def fetch_tcmb_historical(date_str):
    date_obj = datetime.datetime.strptime(date_str, "%Y%m%d")
    year_month = date_obj.strftime("%Y%m")
    url = f"https://www.tcmb.gov.tr/kurlar/{year_month}/{date_str}.xml"

    try:
        resp = requests.get(url, timeout=10, headers={
            "User-Agent": "dolareuroaltin.com/1.0 (historical data collection)"
        })
        resp.encoding = "utf-8"
        root = ET.fromstring(resp.content)

        rates = {}
        for currency in root.findall("Currency"):
            code = currency.get("CurrencyCode")
            if code not in CURRENCY_CODES:
                continue

            def safe_float(tag):
                el = currency.find(tag)
                return float(el.text) if el is not None and el.text else None

            buying = safe_float("ForexBuying")
            selling = safe_float("ForexSelling")

            if buying and selling:
                mid = round((buying + selling) / 2, 4)
                rates[code] = {
                    "buying": buying,
                    "selling": selling,
                    "mid": mid,
                }
        return rates
    except Exception as e:
        print(f"HATA - TCMB {date_str}: {e}")
        return None


def append_to_historical(currency_code, date_str, rate_data):
    filename = CURRENCY_CODES[currency_code]
    filepath = DATA_DIR / filename

    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {
            "currency": currency_code,
            "base": "TRY",
            "last_updated": date_str,
            "data": []
        }

    existing_dates = {d["date"] for d in data["data"]}

    if date_str not in existing_dates:
        new_entry = {
            "date": date_str,
            "open": rate_data["buying"],
            "high": rate_data["selling"],
            "low": rate_data["buying"],
            "close": rate_data["mid"],
        }
        data["data"].append(new_entry)
        data["data"].sort(key=lambda x: x["date"])
        data["last_updated"] = date_str

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"  + {currency_code}: {date_str} eklendi (close={rate_data['mid']})")
        return True
    else:
        print(f"  - {currency_code}: {date_str} zaten mevcut")
        return False


def main():
    today = datetime.date.today()

    if today.weekday() >= 5:
        print("Hafta sonu, tarihsel veri güncellenmez.")
        sys.exit(0)

    date_str = today.strftime("%Y%m%d")
    iso_date = today.isoformat()

    print(f"Tarihsel veri güncelleme: {iso_date}")

    rates = fetch_tcmb_historical(date_str)
    if not rates:
        print("HATA: TCMB verisi alınamadı.")
        sys.exit(1)

    for code, rate_data in rates.items():
        if code in CURRENCY_CODES:
            append_to_historical(code, iso_date, rate_data)

    print("Tarihsel veri güncelleme tamamlandı.")


if __name__ == "__main__":
    main()
