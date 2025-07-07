import {
  BatteryCharging,
  FolderKanban,
  GitPullRequest,
  IdCard,
  Layers,
  Presentation,
  RadioTower,
  ShoppingBag,
  SquareKanban,
  UserCog,
  UtensilsCrossed,
  WandSparkles,
} from "lucide-react";

interface Reason {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Feature43Props {
  heading?: string;
  reasons?: Reason[];
}

const Feature43 = ({
  heading = "Nerelerde Kullanılır?",
  reasons = [
  {
    title: "Butikler & Moda Satıcıları",
    description:
      "Ürünlerini sergileyip Instagram'dan gelen müşterilere WhatsApp üzerinden sipariş alabilirler.",
    icon: <ShoppingBag className="size-6" />,
  },
  {
    title: "Kafeler & Restoranlar",
    description:
      "QR kodla masa üstüne koyulan menüler sayesinde menü güncellemek artık saniyeler sürüyor.",
    icon: <UtensilsCrossed className="size-6" />,
  },
  {
    title: "El Yapımı Ürün Üreticileri",
    description:
      "Takı, sabun, mum gibi el emeği ürünlerini kolayca sergileyip sipariş alabilirler.",
    icon: <WandSparkles className="size-6" />,
  },
  {
    title: "Freelancer & Danışmanlar",
    description:
      "Hizmetlerini, linklerini, sosyal medya profillerini tek bir katalogda toplayabilirler.",
    icon: <UserCog className="size-6" />,
  },
  {
    title: "Eğitmenler & Kurs Verenler",
    description:
      "Kurs linkleri, eğitim içerikleri ve iletişim bilgileri tek bir dijital sayfada toplanabilir.",
    icon: <Presentation className="size-6" />,
  },
  {
    title: "Portföyünü Kolayca Sergilemek İsteyenler",
    description:
      "Emlak ofisleri, galericiler ve danışmanlar; ilanlarını tek bir bağlantıda paylaşabilir.",
    icon: <FolderKanban className="size-6" />,
  }
  
]
}: Feature43Props) => {
  return (
    <section  className="py-20 max-w-screen-xl mx-auto px-4">
      <div className=" ">
        <div className="mb-10  ">
          <h2 className="mb-2   text-left text-5xl font-bold  ">
          <span className="text-[#d0879e] block">katalog.bio</span>   {heading}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, i) => (
            <div key={i} className="flex border p-8 rounded-2xl flex-col">
              <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-accent">
                {reason.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold">{reason.title}</h3>
              <p className="text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Feature43 };
