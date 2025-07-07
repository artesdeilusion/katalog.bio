import { ArrowRight } from "lucide-react";
 import "@/styles/globals.css"
 import { useState } from "react";
import { useRouter } from "next/router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase"; // adjust path to your Firebase config
import Link from "next/link";

export default function Footer() {

  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (!username) return;
  
    setChecking(true);
  
    try {
      const usersRef = collection(db, "users"); // your users collection
      const q = query(usersRef, where("customURL", "==", username));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // Username already exists
        setError("Bu kullanıcı adı zaten kullanılıyor.");
        setChecking(false);
        return;
      }
  
      // Username is available, redirect to register
      router.push(`/register?username=${encodeURIComponent(username)}`);
    } catch (err) {
      console.error(err);
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
      setChecking(false);
    }
  };
return(

  <footer className="bg-white border-t border-gray-100">
  <div className="mx-auto max-w-screen-xl px-4  ">
    <div className="lg:grid lg:grid-cols-2">
      <div
        className="border-b border-gray-100 py-8 lg:order-last lg:border-s lg:border-b-0 lg:py-16 lg:ps-16"
      >
       
        <div className="mt-8 space-y-4 lg:mt-0">
          <span className="hidden h-1 w-10 rounded-sm bg-[#ffc091] lg:block"></span>

          <div>
            <h2 className="text-3xl font-bold text-gray-900">Kendi Dijital Kataloğunu <br />Hemen Oluştur
            </h2>

            <p className="mt-4 max-w-lg text-gray-500">
            Müşterilerine ürünlerini, menünü veya hizmetlerini tek linkle sun. Üstelik tamamen mobil uyumlu, hızlı ve kolay kurulumla!


            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center bg-white rounded-2xl p-2 shadow-lg mb-2 w-full max-w-sm overflow-x-auto">
            <div className="bg-[#ffc091] rounded-lg w-9 h-9 flex items-center justify-center mr-2 min-w-9">
              <img src="/logo.svg" alt="Logo" width={28} height={28} />
            </div>
            <span className="text-[#222] font-medium text-[20px] mr-1 whitespace-nowrap">katalog.bio/</span>
            <input
              type="text"
              placeholder="kullanıcıadı"
              value={username}
              onChange={e => {
                const value = e.target.value.toLowerCase();
                  
                // Only allow lowercase letters, numbers, dots, and underscores
                const allowedChars = /^[a-z0-9._]*$/.test(value);
              
                // Disallow consecutive dots (..) but allow single dots
                const noConsecutiveDots = !/\.{2,}/.test(value);
              
                // Allow up to 3 underscores in a row
                const validUnderscores = !/_{4,}/.test(value);
              
                // Only check edge rules if the value is longer than 1 character
                const noEdgeDots = value.length <= 1 || !/^[._]$/.test(value);
 
                if (allowedChars && noConsecutiveDots && validUnderscores && noEdgeDots) {
              setUsername(value);
                }
              }}
              
              className="border-none outline-none text-[20px] bg-transparent   sm:w-40 px-0 py-1 min-w-0"
            />
            <button type="submit" className="bg-[#FFC091] border-none ml-2 cursor-pointer rounded-lg px-4 py-1.5 text-[#260A2F] font-semibold text-lg shadow-md transition hover:bg-[#ffb36b] disabled:opacity-60" disabled={checking}>
              <ArrowRight></ArrowRight>
            </button>
          </form>
          {error && <div className="text-white mt-1 bg-red-500 px-3 py-1 rounded-lg mb-2">{error}</div>}

        </div>
      </div>

      <div className="py-8 lg:py-16 lg:pe-16">
        <div className="    lg:block">
        <div className="flex-shrink-0 flex   items-center">
            <Link className='flex items-center'  href="/">
            <div className="bg-primary rounded-lg w-9 h-9 flex items-center justify-center mr-2 min-w-9">
              <img src="/logo_light.svg" alt="Logo" width={28} height={28} />
            </div>
              <span className="font-bold text-xl tracking-tight text-black">katalog.bio</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="font-medium text-gray-900">Sayfalar</p>

            <ul className="mt-6 space-y-4 text-sm">
              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">Ana Sayfa</a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75"> Dashboard </a>
              </li>

              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75"> Stores </a>
              </li>
 
            </ul>
          </div>

          <div>
            <p className="font-medium text-gray-900">Şirket</p>

            <ul className="mt-6 space-y-4 text-sm">


            <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75"> Destek </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75"> Kariyer </a>
              </li>
              <li>
                <a href="#" className="text-gray-700 transition hover:opacity-75">info@artesdeilusion.com</a>
              </li>
              
            </ul>
          </div>

      
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8">
          <ul className="flex flex-wrap gap-4 text-xs">
            <li>
              <a href="#" className="text-gray-500 transition hover:opacity-75"> Şartlar ve Koşullar </a>
            </li>

            <li>
              <a href="#" className="text-gray-500 transition hover:opacity-75"> Gizlilik Politikası </a>
            </li>

            <li>
              <a href="#" className="text-gray-500 transition hover:opacity-75"> Çerezler </a>
            </li>
          </ul>

          <p className="mt-8 text-xs text-gray-500">&copy; 2025. <span><a className="hover:underline" href="https://www.artesdeilusion.com/" target="_blank">Artes de Ilusion.</a></span> Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  </div>
</footer>
)
}