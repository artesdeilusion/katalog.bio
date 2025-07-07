 import { LoginForm } from "@/components/login-form"
 import Link from "next/link"
import Head from "next/head"

export default function LoginPage() {
  const features = [
    {
      title: "Hızlı Giriş",
      description: "Hesabına güvenli ve hızlı bir şekilde giriş yap",
      icon: "🚀",
    },
    {
      title: "Güvenli Erişim",
      description: "Verilerin her zaman güvende ve korunaklı",
      icon: "🔒",
    },
    {
      title: "Kolay Yönetim",
      description: "Kataloğunu kolayca yönet ve güncelle",
      icon: "⚡",
    },
  ]

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <Head>
        <title>Giriş Yap - katalog.bio</title>
        <meta name="description" content="Hesabınıza güvenli bir şekilde giriş yapın" />
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
            <LoginForm />
          </div>
        </div>
        
        
      </div>
      <div className="bg-gray-100 relative hidden lg:block">
        <img
          src="/images/login.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
