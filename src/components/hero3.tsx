import { ArrowRight, Star } from "lucide-react";
import "@/styles/globals.css"
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useRouter } from "next/router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase"; // adjust path to your Firebase config

interface Hero3Props {
  heading?: string;
  description?: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
  reviews?: {
    count: number;
    avatars: {
      src: string;
      alt: string;
    }[];
    rating?: number;
  };
}

const Hero3 = ({
  heading = "Dijital vitrin senin kontrolünde",
  description = "Ürünlerini, menülerini, QR kodlarını, linklerini bir araya getir. WhatsApp&apos;tan sipariş al, Instagram&apos;dan yönlendir, dijitale geç.",

  reviews = {
    count: 200,
    rating: 5.0,
    avatars: [
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
        alt: "Avatar 1",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
        alt: "Avatar 2",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
        alt: "Avatar 3",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
        alt: "Avatar 4",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
        alt: "Avatar 5",
      },
    ],
  },
}: Hero3Props) => {
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
  

  return (
    <section className="overflow-x-hidden">
      <div className="px-4 mx-auto container max-w-screen-xl grid items-center gap-10  py-10  ">
        <div className="flex flex-col items-center text-[#260a2f] text-center       w-full">
          <h1 className="my-6   text-pretty text-3xl font-bold lg:text-4xl xl:text-5xl">
            {heading}
          </h1>
          <p className="  mb-8 max-w-xl lg:text-xl">
            {description}
          </p>
          <form onSubmit={handleSubmit} className="flex items-center bg-white rounded-2xl p-2 shadow-md mb-2 w-full max-w-sm overflow-x-auto">
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

          <div className="text-black text-sm mb-6">QR kod bas, Instagram bio&apos;ya koy, Twitter&apos;da paylaş...</div>

          <div className="mb-12 flex w-fit flex-col items-center gap-4 sm:flex-row">
            <span className="inline-flex items-center -space-x-4">
              {reviews.avatars.map((avatar, index) => (
                <Avatar key={index} className="size-12 border">
                  <AvatarImage src={avatar.src} alt={avatar.alt} />
                </Avatar>
              ))}
            </span>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className="size-5 fill-[#d0879e] text-[#d0879e]"
                  />
                ))}
                <span className="mr-1 font-semibold">
                  {reviews.rating?.toFixed(1)}
                </span>
              </div>
              <p className="text-[#260a2f] text-left font-medium">
                from {reviews.count}+ reviews
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export { Hero3 };
