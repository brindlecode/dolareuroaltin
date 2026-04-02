# dolareuroaltin.com

Dolar, Euro, Altın ve diğer döviz kurlarının güncel fiyatlarını gösteren ultra hızlı statik web sitesi.

## 🚀 Özellikler

- **Gerçek zamanlı veri**: TCMB resmi kurları + altın + kripto
- **Statik SSG**: Astro 4.x ile build time'da üretilen sayfalar
- **Sıfır sunucu maliyeti**: GitHub Actions + Netlify
- **SEO odaklı**: Schema.org, sitemap, dinamik meta etiketler
- **Mobil öncelikli**: Responsive Tailwind CSS tasarımı
- **Performans**: LCP < 1.5s hedefi, minimum JS

## 📦 Kurulum

```bash
npm install
npm run dev
```

## 🏗️ Mimari

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  TCMB API   │────▶│ GitHub Actions│────▶│  JSON    │
│  Gold API   │     │  (saatlik)    │     │  dosyaları│
│  CoinGecko  │     └──────────────┘     └────┬─────┘
└─────────────┘                                │
                                               ▼
┌─────────────┐     ┌──────────────┐     ┌──────────┐
│  Kullanıcı  │◀────│   Netlify    │◀────│   Astro  │
│  (tarayıcı) │     │   (hosting)  │     │   build  │
└─────────────┘     └──────────────┘     └──────────┘
```

## 📁 Proje Yapısı

```
dolareuroaltin/
├── src/
│   ├── components/     # Astro bileşenleri
│   ├── data/          # JSON veri dosyaları
│   ├── layouts/       # Sayfa düzenleri
│   ├── pages/         # Rotalar
│   ├── scripts/       # Python veri çekme scriptleri
│   ├── styles/        # Global CSS
│   └── utils/         # Yardımcı fonksiyonlar
├── public/            # Statik dosyalar
├── .github/workflows/ # GitHub Actions
├── astro.config.mjs
├── tailwind.config.mjs
└── netlify.toml
```

## 🔄 Veri Güncelleme

GitHub Actions saatte bir çalışır:
- `update-rates.yml`: TCMB + altın + kripto kurlarını çeker
- `update-historical.yml`: Günlük kapanış verilerini tarihsel dosyalara ekler

Her commit Netlify rebuild tetikler.

## 📄 Sayfalar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Tüm kurlar, grafikler, araçlar |
| Dolar Kuru | `/dolar-kuru` | USD/TRY odaklı |
| Euro Kuru | `/euro-kuru` | EUR/TRY odaklı |
| Altın Fiyatı | `/altin-fiyati` | Tüm altın türleri |
| Sterlin Kuru | `/sterlin-kuru` | GBP/TRY |
| Döviz Çevirici | `/doviz-cevirici` | TL ↔ Döviz |
| Geçmişte Alsaydım | `/gecmisteAlsaydim` | Yatırım hesaplayıcı |
| TCMB Faiz Kararı | `/tcmb-faiz-karari` | Faiz takvimi |
| Enflasyon | `/enflasyon` | TÜFE verileri |

## 🛠️ Teknolojiler

- **Astro 4.x** — SSG framework
- **Tailwind CSS** — Utility-first CSS
- **Chart.js** — Grafik kütüphanesi
- **Python** — Veri çekme scriptleri
- **GitHub Actions** — Otomasyon
- **Netlify** — Hosting + CDN

## 💰 Gelir Modeli

- Google AdSense (finans nişi = yüksek CPC)
- Kripto borsa affiliate (Binance TR, Paribu, BtcTurk)
- Döviz transfer affiliate (Wise)

## 📝 Lisans

MIT
