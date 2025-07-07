import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./_app";
import Head from "next/head";
import { Feature43 } from "@/components/feature43";
import FAQ from "@/components/faq";
import { Hero3 } from "@/components/hero3";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router, mounted]);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <section>
        <Head>
          <title>katalog.bio - Instagram'dan ürünlerinizi paylaşın, siparişleri WhatsApp'tan alın</title>
          <meta name="description" content="Instagram'dan ürünlerinizi paylaşın, siparişleri WhatsApp'tan alın. Ücretsiz başlayın." />
        </Head>
        <Navbar></Navbar>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Head>
        <title>katalog.bio - Instagram'dan ürünlerinizi paylaşın, siparişleri WhatsApp'tan alın</title>
        <meta name="description" content="Instagram'dan ürünlerinizi paylaşın, siparişleri WhatsApp'tan alın. Ücretsiz başlayın." />
      </Head>
      <Navbar></Navbar>

      <section className="bg-[#ffc091] text-white">
        <Hero3></Hero3>
      </section>
      
      <motion.section 
        className="relative py-12 flex items-center justify-center px-4 bg-cover bg-center bg-gray-50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.h1 
          className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 text-5xl lg:text-8xl text-black font-bold z-20"
          variants={fadeInUp}
        >
          Her Şey
        </motion.h1>

        <motion.h1 
          className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 text-5xl lg:text-8xl text-black font-bold z-20"
          variants={fadeInUp}
        >
          Tek Linkte
        </motion.h1>

        <motion.img
          className="h-[32rem] md:h-[35rem] lg:h-[40rem] z-30"
          src="/mobile_phone.png"
          alt="Phone"
          variants={scaleIn}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white pointer-events-none" />
      </motion.section>

      {/* Carousel Section */}
      <motion.section 
        id="ozellikler" 
        className="w-full py-8"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <Carousel className="mx-auto" opts={{ loop: true }}>
          <CarouselContent> 
            <CarouselItem>
              <motion.div 
                className="flex flex-col justify-center p-6 w-full h-96 rounded-xl bg-[#FFF1F1] text-[#800B0B]"
                whileHover={{ scale: 1.0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold mb-2">Kolay Ürün <br />Ekleme 🛍️</h1>
                <p className="text-base max-w-md">
                  Ürün fotoğrafını, adını ve fiyatını gir — dakikalar içinde yayında. Teknik bilgi gerekmez.
                </p>
              </motion.div>
            </CarouselItem>

            <CarouselItem>
              <motion.div 
                className="flex flex-col justify-center p-6 w-full h-96 rounded-xl bg-[#ECFDF5] text-[#065F46]"
                whileHover={{ scale: 1.0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold mb-2">WhatsApp ile <br />Sipariş 💬</h1>
                <p className="text-base max-w-md">
                  Her ürün kartına otomatik sipariş butonu eklenir. Müşteriler doğrudan WhatsApp üzerinden sipariş verir.
                </p>
              </motion.div>
            </CarouselItem>

            <CarouselItem>
              <motion.div 
                className="flex flex-col justify-center p-6 w-full h-96 rounded-xl bg-[#FFF7E0] text-[#8D6C00]"
                whileHover={{ scale: 1.0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold mb-2">QR Kod ile <br />Erişim 🔗</h1>
                <p className="text-base max-w-md">
                  Otomatik oluşturulan QR kod sayesinde menünü veya ürünlerini masalara, ambalajlara, kartvizitlere ekleyebilirsin.
                </p>
              </motion.div>
            </CarouselItem>

            <CarouselItem>
              <motion.div 
                className="flex flex-col justify-center p-6 w-full h-96 rounded-xl bg-[#E0E7FF] text-[#3730A3]"
                whileHover={{ scale: 1.0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold mb-2">Kendi Linkinle <br />Yayında 🌐</h1>
                <p className="text-base max-w-md">
                  "katalog.bio/kullaniciadi" şeklinde kişisel bir bağlantın olur. Bu linki bio'ya koy, kartvizite bastır, paylaş!
                </p>
              </motion.div>
            </CarouselItem>

            <CarouselItem>
              <motion.div 
                className="flex flex-col justify-center p-6 w-full h-96 rounded-xl bg-[#F0F9FF] text-[#026AA2]"
                whileHover={{ scale: 1.0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold mb-2">Mobil Uyumlu <br />Tasarım 📱</h1>
                <p className="text-base max-w-md">
                  Tüm cihazlarda şık ve sade görünür. Kullanıcıların kolayca gezinebileceği modern arayüz.
                </p>
              </motion.div>
            </CarouselItem>

            <CarouselItem>
              <motion.div 
                className="flex flex-col justify-center p-6 w-full h-96 rounded-xl bg-[#FEF9F5] text-[#C2410C]"
                whileHover={{ scale: 1.0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold mb-2">Kategorilere <br />Ayırma 🗂️</h1>
                <p className="text-base max-w-md">
                  Ürünlerini erkek, kadın, çocuk, takı, içecek gibi kategorilere bölerek düzenli bir vitrin oluştur.
                </p>
              </motion.div>
            </CarouselItem>

            <CarouselItem>
              <motion.div 
                className="flex flex-col justify-center p-6 w-full h-96 rounded-xl bg-[#F3F4F6] text-[#111827]"
                whileHover={{ scale: 1.0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold mb-2">İşini Tek <br />Linkte Sun 🔗</h1>
                <p className="text-base max-w-md">
                  Kafenin menüsünü, butiğinin ürünlerini ya da danışmanlık profilini tek bağlantıda sun.
                </p>
              </motion.div>
            </CarouselItem>

            <CarouselItem>
              <motion.div 
                className="flex flex-col justify-center p-6 w-full h-96 rounded-xl bg-[#F0FDF4] text-[#15803D]"
                whileHover={{ scale: 1.0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-3xl font-bold mb-2">Ücretsiz Başla 🔓</h1>
                <p className="text-base max-w-md">
                  Ücretsiz başla, daha fazla ürün eklemek veya tema özelleştirmek istersen uygun fiyatlı paketlere geçebilirsin.
                </p>
              </motion.div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </motion.section>

      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div 
          className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8"
          variants={fadeInUp}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center md:gap-8">
            <div>
              <div className="max-w-lg md:max-w-none">
                <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  Dakikalar içinde dijital kataloğunu oluştur.
                </h2>

                <p className="mt-4 text-gray-600">
                  Ürünlerini yükle, bağlantılarını ekle ve herkese özel bir sayfa oluştur. 
                  Instagram bio'na link koyabilir, QR kod ile masalara yerleştirebilir ya da 
                  WhatsApp'tan sipariş alabilirsin. Üstelik hiçbir teknik bilgiye ihtiyacın yok.
                </p>
                <motion.a
                  href="/register"
                  className="inline-block mt-6 mb-4 bg-[#FFC091] text-[#260A2F] font-semibold px-6 py-2 rounded-full hover:bg-[#f9b37e] transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Kataloğunu Oluştur
                </motion.a>
              </div>
            </div>

            <motion.div
              variants={scaleIn}
            >
              <img
                src="/store.png"
                className="rounded-xl"
                alt=""
              />
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div 
          className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8"
          variants={fadeInUp}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center md:gap-8">
            <div>
              <div className="max-w-lg md:max-w-none">
                <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                  Her tür işletmeye, her sektöre uygun.
                </h2>

                <p className="mt-4 text-gray-600">
                  İster online butik işlet, ister kafe ya da restoran yönet... 
                  katalog.bio senin için esnek bir dijital vitrin sunar. 
                  Takı tasarımcıları, danışmanlar, eğitmenler, organizatörler... 
                  Ürünlerini veya hizmetlerini düzenli, sade ve hızlı erişilebilir bir şekilde sergile.
                </p>
              </div>
            </div>

            <motion.div 
              className="sm:order-first"
              variants={scaleIn}
            >
              <img
                src="https://images.pexels.com/photos/32822405/pexels-photo-32822405.jpeg"
                className="rounded-xl"
                alt=""
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <Feature43></Feature43>
      </motion.div>

      <motion.div
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <FAQ></FAQ>
      </motion.div>

      <Footer></Footer>
    </section>
  );
}
