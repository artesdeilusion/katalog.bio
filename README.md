# katalog.bio

Instagram satışlarınız için ürün vitrini. Ürünlerinizi paylaşın, siparişleri WhatsApp'tan alın.

## Analytics ve Cookie Yönetimi

### Google Analytics 4 (GA4) Kurulumu

1. [Google Analytics](https://analytics.google.com/) hesabı oluşturun
2. Yeni bir property oluşturun
3. Measurement ID'yi alın (G-XXXXXXXXXX formatında)
4. `src/utils/cookie-manager.ts` dosyasında `G-XXXXXXXXXX` yerine kendi ID'nizi yazın

### Cookie Consent Sistemi

Sistem GDPR uyumlu cookie consent sistemi içerir:
- **Gerekli Çerezler**: Site işlevselliği için zorunlu
- **Analytics Çerezleri**: Performans takibi için (kullanıcı onayı gerekli)
- **Fonksiyonel Çerezler**: Gelişmiş özellikler için
- **Tercih Çerezleri**: Kullanıcı ayarları için

### Özel Analytics Sistemi

Sistem otomatik olarak şu verileri takip eder (cookie onayı ile):
- **Mağaza ziyaretleri** - Toplam ürün, kategori, öne çıkan ürün sayıları
- **Ürün görüntülemeleri** - Ürün adı, açıklama, fiyat, kategori, resim sayısı
- **Ürün tıklamaları** - Detaylı ürün bilgileri ve kategori hiyerarşisi
- **Sipariş butonu tıklamaları** - Link tipi, ürün detayları, referrer
- **Aksiyon butonu tıklamaları** - Buton rengi, başlık, link
- **Arama sorguları** - Arama terimi, sonuç sayısı, kategori filtresi
- **Kategori filtreleri** - Seçilen kategori, ürün sayıları
- **Resim galerisi navigasyonu** - Resim indeksi, toplam resim, navigasyon yönü
- **Öne çıkan ürün etkileşimleri** - Highlighted ürün tıklamaları
- **Session takibi** - Kullanıcı oturum bilgileri
- **Referrer analizi** - Hangi sayfadan geldiği
- **User agent bilgileri** - Tarayıcı ve cihaz bilgileri
- **Anonim kullanıcı takibi** - Giriş yapmamış ziyaretçilerin etkileşimleri

### Analytics Dashboard

Dashboard'da `/dashboard/analytics` sayfasından tüm istatistikleri görüntüleyebilirsiniz:
- **İstatistik Kartları** - Tüm metriklerin detaylı özeti
- **En Popüler Ürünler** - Görüntüleme ve sipariş sayılarına göre
- **Son Etkileşimler** - Detaylı event bilgileri (ürün adı, fiyat, kategori, vb.)
- **Dönüşüm Oranları** - Ziyaret → Tıklama → Sipariş analizi
- **Detaylı Event Bilgileri** - Her event için tam ürün ve kategori bilgileri
- **Anonim Kullanıcı Analizi** - Giriş yapmamış ziyaretçilerin etkileşimleri

### Cookie Ayarları

Kullanıcılar footer'daki "Çerez Ayarları" linkinden tercihlerini değiştirebilir.

## Kurulum

```bash
npm install
npm run dev
```

## Özellikler

- ✅ Ürün yönetimi
- ✅ Kategori sistemi
- ✅ Çoklu resim desteği
- ✅ Özel linkler (WhatsApp, Telegram, Email, vb.)
- ✅ Mağaza görünürlük kontrolü
- ✅ Öne çıkan ürünler
- ✅ Özelleştirilebilir aksiyon butonu
- ✅ **Analytics ve tıklama takibi**
- ✅ **GDPR uyumlu cookie consent sistemi**
- ✅ Responsive tasarım

## Teknolojiler

- Next.js
- TypeScript
- Tailwind CSS
- Firebase (Firestore, Auth, Storage)
- Google Analytics 4

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
