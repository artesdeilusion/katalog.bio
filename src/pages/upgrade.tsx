import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { useAuth } from "./_app";
import Link from "next/link";
import { ArrowLeft, Check, Star, Zap, Shield, BarChart3, Users, Globe, Crown } from "lucide-react";
import Head from "next/head";

interface UserData {
  storeName?: string;
  storeCategory?: string;
  customURL?: string;
  setupCompleted?: boolean;
  subscription?: {
    plan?: 'free' | 'pro' | 'business';
    status?: 'active' | 'inactive' | 'cancelled';
    expiresAt?: any;
  };
}

const plans = [
  {
    name: "Ücretsiz",
    price: "0₺",
    period: "aylık",
    description: "Bireysel kullanıcılar için temel özellikler",
    features: [
      "Sınırsız ürün ekleme",
      "Temel analitikler",
      "Özel URL",
      "E-posta desteği",
      "Mobil uyumlu tasarım",
    ],
    limitations: [
      "Reklam gösterimi",
      "Sınırlı tema seçenekleri",
      "Temel özellikler",
    ],
    buttonText: "Mevcut Plan",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "29₺",
    period: "aylık",
    description: "Küçük işletmeler için gelişmiş özellikler",
    features: [
      "Ücretsiz planın tüm özellikleri",
      "Reklamsız deneyim",
      "Gelişmiş analitikler",
      "Özel temalar",
      "Öncelikli destek",
      "Sosyal medya entegrasyonu",
      "QR kod oluşturma",
      "İçe/dışa aktarma",
    ],
    limitations: [],
    buttonText: "Pro'ya Yükselt",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Business",
    price: "99₺",
    period: "aylık",
    description: "Büyük işletmeler için kurumsal çözümler",
    features: [
      "Pro planın tüm özellikleri",
      "Çoklu kullanıcı desteği",
      "API erişimi",
      "Özel entegrasyonlar",
      "7/24 öncelikli destek",
      "Gelişmiş güvenlik",
      "Beyaz etiket çözümü",
      "Özel eğitim",
    ],
    limitations: [],
    buttonText: "Business'a Yükselt",
    buttonVariant: "default" as const,
    popular: false,
  },
];

const features = [
  {
    icon: Zap,
    title: "Hızlı Kurulum",
    description: "Dakikalar içinde mağazanızı oluşturun ve yayına alın",
  },
  {
    icon: Shield,
    title: "Güvenli Altyapı",
    description: "SSL sertifikası ve güvenli ödeme sistemleri",
  },
  {
    icon: BarChart3,
    title: "Detaylı Analitikler",
    description: "Ziyaretçi davranışlarını ve satış performansınızı takip edin",
  },
  {
    icon: Users,
    title: "Müşteri Yönetimi",
    description: "Müşteri verilerinizi organize edin ve iletişim kurun",
  },
  {
    icon: Globe,
    title: "Çoklu Dil Desteği",
    description: "Uluslararası müşterilerinize hizmet verin",
  },
  {
    icon: Crown,
    title: "Premium Destek",
    description: "7/24 öncelikli teknik destek ve danışmanlık",
  },
];

export default function UpgradePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const { userData: authUserData } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleUpgrade = (planName: string) => {
    // This would integrate with a payment processor like Stripe
    alert(`${planName} planına yükseltme işlemi başlatılacak. Ödeme sistemi entegrasyonu gereklidir.`);
  };

  const getCurrentPlan = () => {
    return userData?.subscription?.plan || 'free';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Premium'a Yükselt - katalog.bio</title>
        <meta name="description" content="İşinizi büyütmek için premium özellikleri keşfedin. Pro ve Business planları ile daha fazla müşteriye ulaşın." />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="border-b border-border">
            <div className="max-w-6xl mx-auto px-4 py-6">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Geri Dön
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Premium'a Yükselt</h1>
                  <p className="text-muted-foreground">İşinizi büyütmek için premium özellikleri keşfedin</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                İşinizi Bir Üst Seviyeye Taşıyın
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Premium özelliklerle mağazanızı daha profesyonel hale getirin, 
                daha fazla müşteriye ulaşın ve satışlarınızı artırın.
              </p>
            </div>

            {/* Current Plan Status */}
            {userData && (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Mevcut Planınız</h3>
                      <p className="text-muted-foreground">
                        {getCurrentPlan() === 'free' ? 'Ücretsiz Plan' : 
                         getCurrentPlan() === 'pro' ? 'Pro Plan' : 'Business Plan'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Durum</p>
                      <p className="font-semibold text-green-600">
                        {userData.subscription?.status === 'active' ? 'Aktif' : 'Aktif'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pricing Plans */}
            <div className="grid gap-6 md:grid-cols-3 mb-12">
              {plans.map((plan, index) => (
                <Card 
                  key={plan.name} 
                  className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                        En Popüler
                      </span>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      {plan.name}
                      {plan.popular && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                    </CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                      {plan.limitations.map((limitation, limitationIndex) => (
                        <div key={limitationIndex} className="flex items-center gap-2 text-muted-foreground">
                          <div className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{limitation}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={plan.buttonVariant}
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={getCurrentPlan() === plan.name.toLowerCase()}
                    >
                      {getCurrentPlan() === plan.name.toLowerCase() ? "Mevcut Plan" : plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Grid */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-center mb-8">Premium Özellikler</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Sık Sorulan Sorular</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Plan değişikliği yapabilir miyim?</h4>
                  <p className="text-sm text-muted-foreground">
                    Evet, istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. 
                    Değişiklikler bir sonraki fatura döneminde geçerli olur.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">İptal edebilir miyim?</h4>
                  <p className="text-sm text-muted-foreground">
                    Evet, premium aboneliğinizi istediğiniz zaman iptal edebilirsiniz. 
                    İptal sonrası ücretsiz plana geri dönersiniz.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ödeme güvenli mi?</h4>
                  <p className="text-sm text-muted-foreground">
                    Tüm ödemeler SSL şifreleme ile korunur ve güvenli ödeme sistemleri kullanılır.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <div className="text-center mt-12">
              <h3 className="text-2xl font-bold mb-4">Hemen Başlayın</h3>
              <p className="text-muted-foreground mb-6">
                Premium özelliklerle mağazanızı büyütmeye başlayın
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard'a Dön</Button>
                </Link>
                <Button onClick={() => handleUpgrade('Pro')}>
                  Pro'ya Yükselt
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 