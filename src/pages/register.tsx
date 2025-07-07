import { GalleryVerticalEnd } from "lucide-react";
import { RegisterForm } from "@/components/register-form";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Head from "next/head";

export default function RegisterPage() {
  const benefits = [
    {
      title: "Ücretsiz Başla",
      description: "Hemen ücretsiz hesap oluştur ve kataloğunu yayınla",
      icon: "🎉",
    },
    {
      title: "Hızlı Kurulum",
      description: "Dakikalar içinde profesyonel kataloğunu oluştur",
      icon: "⚡",
    },
    {
      title: "7/24 Destek",
      description: "Her zaman yanındayız, sorularını yanıtlamaya hazırız",
      icon: "💬",
    },
  ]

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <Head>
        <title>Kayıt Ol - katalog.bio</title>
        <meta name="description" content="Ücretsiz hesap oluşturun ve kataloğunuzu yönetmeye başlayın" />
      </Head>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link className='flex items-center'  href="/">
            <div className="bg-primary rounded-lg w-9 h-9 flex items-center justify-center mr-2 min-w-9">
              <img src="/logo_light.svg" alt="Logo" width={28} height={28} />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">katalog.bio</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="bg-gray-100 relative hidden lg:block">
        <img
          src="/images/register.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
} 