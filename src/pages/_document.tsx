import { Html, Head as DocumentHead, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <DocumentHead>
        <title>katalog.bio - Instagram&apos;dan ürünlerinizi paylaşın, siparişleri WhatsApp&apos;tan alın</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Instagram&apos;dan ürünlerinizi paylaşın, siparişleri WhatsApp&apos;tan alın. Ücretsiz başlayın." />
      </DocumentHead>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
