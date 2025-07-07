import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs: { q: string; a: string }[] = [
     {
      q: "katalog.bio nedir?",
      a: "katalog.bio, Instagram satışlarınız için ücretsiz dijital ürün vitrini oluşturmanızı sağlayan bir platformdur. Ürünlerinizi yükleyin, fiyatlarını belirleyin ve müşterilerinizin WhatsApp üzerinden sipariş vermesini sağlayın."
    },
    {
      q: "Nasıl başlayabilirim?",
      a: "Ücretsiz hesap oluşturun, ürünlerinizi ekleyin ve size özel katalog linkinizi alın. Bu linki Instagram bio&apos;nuzda paylaşabilir veya QR kod olarak basabilirsiniz."
    },
    {
      q: "Ücretli mi?",
      a: "Hayır! katalog.bio tamamen ücretsizdir. Temel özelliklerin tümü ücretsiz olarak kullanılabilir."
    },
    {
      q: "Müşteriler nasıl sipariş verir?",
      a: "Her ürün kartında otomatik olarak WhatsApp sipariş butonu bulunur. Müşteriler bu butona tıklayarak direkt WhatsApp&apos;tan size mesaj atabilir."
    },
    {
      q: "QR kod nasıl oluşturulur?",
      a: "Katalog sayfanız için otomatik QR kod oluşturulur. Bu QR kodu menülere, ambalajlara veya masalara ekleyebilirsiniz."
    },
    {
      q: "Hangi sektörler için uygun?",
      a: "Takı tasarımcıları, kafe/restoranlar, online butikler, danışmanlar, eğitmenler ve daha birçok sektör için uygundur."
    }
  ];
  
export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="sss" className="py-16 bg-background max-w-screen-xl mx-auto">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-lg font-medium mb-2 text-foreground">SSS'ye Hoş Geldin!</p>
          <h2 className="text-5xl font-bold mb-4 text-foreground leading-tight">
            Sıkça Sorulan<br />
            Sorular
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            katalog.bio hakkında merak ettiğiniz her şey burada. 
            Eğer aradığınız cevabı bulamazsanız, bizimle iletişime geçin.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-border rounded-lg bg-card">
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <span className="text-lg font-medium text-foreground cursor-pointer">{faq.q}</span>
                <ChevronDown
                  className={`w-6 h-6 text-muted-foreground transition-transform duration-200 ${openIndex === idx ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === idx && (
                <div className="px-6 py-4 text-muted-foreground text-base">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}