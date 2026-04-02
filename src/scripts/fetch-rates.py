import json
import requests
import datetime
import xml.etree.ElementTree as ET
from pathlib import Path
import os
import sys

DATA_FILE = Path(__file__).parent.parent / "data" / "rates_current.json"

CURRENCY_MAP = {
    "USD": {"name_tr": "Amerikan Doları", "symbol": "$", "flag": "🇺🇸"},
    "EUR": {"name_tr": "Euro", "symbol": "€", "flag": "🇪🇺"},
    "GBP": {"name_tr": "İngiliz Sterlini", "symbol": "£", "flag": "🇬🇧"},
    "CHF": {"name_tr": "İsviçre Frangı", "symbol": "₣", "flag": "🇨🇭"},
    "SAR": {"name_tr": "Suudi Arabistan Riyali", "symbol": "﷼", "flag": "🇸🇦"},
    "JPY": {"name_tr": "Japon Yeni", "symbol": "¥", "flag": "🇯🇵"},
    "AUD": {"name_tr": "Avustralya Doları", "symbol": "A$", "flag": "🇦🇺"},
    "CAD": {"name_tr": "Kanada Doları", "symbol": "C$", "flag": "🇨🇦"},
}

GOLD_GRAM_PER_OZ = 31.1035

TURKISH_MONTHS = {
    "January": "Ocak", "February": "Şubat", "March": "Mart",
    "April": "Nisan", "May": "Mayıs", "June": "Haziran",
    "July": "Temmuz", "August": "Ağustos", "September": "Eylül",
    "October": "Ekim", "November": "Kasım", "December": "Aralık"
}


def fetch_tcmb():
    try:
        url = "https://www.tcmb.gov.tr/kurlar/today.xml"
        resp = requests.get(url, timeout=10, headers={
            "User-Agent": "dolareuroaltin.com/1.0 (data collection)"
        })
        resp.encoding = "utf-8"
        root = ET.fromstring(resp.content)

        rates = {}
        for currency in root.findall("Currency"):
            code = currency.get("CurrencyCode")
            if code not in CURRENCY_MAP:
                continue

            def safe_float(tag):
                el = currency.find(tag)
                return float(el.text) if el is not None and el.text else None

            forex_buying = safe_float("ForexBuying")
            forex_selling = safe_float("ForexSelling")

            if not forex_buying or not forex_selling:
                continue

            mid = round((forex_buying + forex_selling) / 2, 4)
            rates[code] = {
                "code": code,
                **CURRENCY_MAP[code],
                "buying": forex_buying,
                "selling": forex_selling,
                "mid": mid,
            }
        return rates
    except Exception as e:
        print(f"HATA - TCMB API: {e}")
        return None


def fetch_gold_try(usd_try_rate):
    try:
        api_key = os.environ.get("GOLDAPI_KEY", "")
        if api_key:
            resp = requests.get(
                "https://www.goldapi.io/api/XAU/USD",
                headers={"x-access-token": api_key},
                timeout=10
            )
            data = resp.json()
            xau_usd = data.get("price", 3126.00)
        else:
            resp = requests.get(
                "https://metals.live/api/spot",
                timeout=10
            )
            data = resp.json()
            xau_usd = float(data.get("gold", 3126.00))

        xau_try = xau_usd * usd_try_rate
        gram_try = xau_try / GOLD_GRAM_PER_OZ

        return {
            "xau_usd": round(xau_usd, 2),
            "gram_try": round(gram_try, 2),
            "ceyrek_try": round(gram_try * 1.646, 2),
            "yarim_try": round(gram_try * 3.292, 2),
            "tam_try": round(gram_try * 6.584, 2),
            "ata_try": round(gram_try * 6.872, 2),
            "bilezik14_try": round(gram_try * 0.585, 2),
            "bilezik18_try": round(gram_try * 0.750, 2),
        }
    except Exception as e:
        print(f"UYARI - Altın fiyatı çekilemedi: {e}")
        return None


def fetch_crypto(usd_try_rate):
    try:
        resp = requests.get(
            "https://api.coingecko.com/api/v3/simple/price"
            "?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true",
            timeout=10
        )
        data = resp.json()
        btc_usd = data["bitcoin"]["usd"]
        eth_usd = data["ethereum"]["usd"]
        return {
            "BTC": {
                "name_tr": "Bitcoin",
                "symbol": "₿",
                "price_usd": btc_usd,
                "price_try": round(btc_usd * usd_try_rate, 2),
                "change_pct": round(data["bitcoin"].get("usd_24h_change", 0), 2),
                "direction": "up" if data["bitcoin"].get("usd_24h_change", 0) >= 0 else "down"
            },
            "ETH": {
                "name_tr": "Ethereum",
                "price_usd": eth_usd,
                "price_try": round(eth_usd * usd_try_rate, 2),
                "change_pct": round(data["ethereum"].get("usd_24h_change", 0), 2),
                "direction": "up" if data["ethereum"].get("usd_24h_change", 0) >= 0 else "down"
            }
        }
    except Exception as e:
        print(f"UYARI - Kripto verisi çekilemedi: {e}")
        return {}


def calculate_changes(new_rates, current_data):
    if not current_data:
        return new_rates

    for code, rate in new_rates.items():
        prev = current_data.get("rates", {}).get(code, {})
        prev_close = prev.get("prev_close", prev.get("mid", rate["mid"]))
        change = round(rate["mid"] - prev_close, 4)
        change_pct = round((change / prev_close) * 100, 2) if prev_close else 0

        rate["change_daily"] = change
        rate["change_pct"] = change_pct
        rate["direction"] = "up" if change >= 0 else "down"
        rate["prev_close"] = prev_close
        rate["open"] = prev.get("open", prev_close)
        rate["high"] = max(prev.get("high", rate["mid"]), rate["mid"])
        rate["low"] = min(prev.get("low", rate["mid"]), rate["mid"])

    return new_rates


def main():
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=3)))

    if now.weekday() >= 5:
        print("Hafta sonu, TCMB kurları güncellenmez. Çıkılıyor.")
        sys.exit(0)

    current_data = None
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            current_data = json.load(f)

    new_rates = fetch_tcmb()
    if not new_rates:
        print("HATA: TCMB verisi alınamadı, mevcut veri korunuyor.")
        sys.exit(1)

    new_rates = calculate_changes(new_rates, current_data)

    usd_try = new_rates.get("USD", {}).get("mid", 38.50)

    gold_data = fetch_gold_try(usd_try)
    crypto_data = fetch_crypto(usd_try)

    gold_json = {}
    if gold_data:
        prev_gold = current_data.get("gold", {}) if current_data else {}

        gold_items = [
            ("gram", "Gram Altın", gold_data["gram_try"]),
            ("ceyrek", "Çeyrek Altın", gold_data["ceyrek_try"]),
            ("yarim", "Yarım Altın", gold_data["yarim_try"]),
            ("tam", "Tam Altın (Cumhuriyet)", gold_data["tam_try"]),
            ("ata", "Ata Altın", gold_data["ata_try"]),
            ("bilezik_14", "14 Ayar Bilezik", gold_data["bilezik14_try"]),
            ("bilezik_18", "18 Ayar Bilezik", gold_data["bilezik18_try"]),
        ]

        for key, name, price in gold_items:
            prev_price = prev_gold.get(key, {}).get("mid", price)
            change = round(price - prev_price, 2)
            change_pct = round((change / prev_price) * 100, 2) if prev_price else 0
            gold_json[key] = {
                "name_tr": name,
                "buying": round(price * 0.998, 2),
                "selling": round(price * 1.002, 2),
                "mid": price,
                "change_daily": change,
                "change_pct": change_pct,
                "direction": "up" if change >= 0 else "down",
                "prev_close": prev_price,
                "open": prev_price,
                "high": max(prev_gold.get(key, {}).get("high", price), price),
                "low": min(prev_gold.get(key, {}).get("low", price), price),
            }

        gold_json["xau_usd"] = {
            "name_tr": "Uluslararası Altın (ons)",
            "unit": "USD/ons",
            "mid": gold_data["xau_usd"],
            "buying": gold_data["xau_usd"] - 0.50,
            "selling": gold_data["xau_usd"] + 0.50,
            "change_daily": 0,
            "change_pct": 0,
            "direction": "up"
        }

    month_tr = TURKISH_MONTHS.get(now.strftime("%B"), now.strftime("%B"))
    display = f"{now.day} {month_tr} {now.year}, {now.strftime('%H:%M')}"

    output = {
        "last_updated": now.isoformat(),
        "last_updated_display": display,
        "source": "TCMB + GoldAPI",
        "rates": new_rates,
        "gold": gold_json,
        "crypto": crypto_data
    }

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Güncellendi: USD={usd_try:.4f} | EUR={new_rates.get('EUR',{}).get('mid','?')} | "
          f"Gram Altın={gold_json.get('gram',{}).get('mid','?') if gold_json else '?'}")


if __name__ == "__main__":
    main()
