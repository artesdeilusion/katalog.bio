import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebase";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { getUserAnalytics, getAnonymousAnalytics } from "../../utils/analytics";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../_app";
import Link from "next/link";
import { BarChart3, Eye, MousePointer, TrendingUp, Users, ShoppingCart } from "lucide-react";
import Head from "next/head";

interface AnalyticsData {
  total_events?: number;
  store_visit_count?: number;
  product_view_count?: number;
  product_click_count?: number;
  order_button_click_count?: number;
  action_button_click_count?: number;
  category_filter_count?: number;
  search_query_count?: number;
  created_at?: any;
  last_updated?: any;
}

interface ProductAnalytics {
  productId: string;
  productName: string;
  product_view_count?: number;
  product_click_count?: number;
  order_button_click_count?: number;
  total_events?: number;
}

export default function Analytics() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [topProducts, setTopProducts] = useState<ProductAnalytics[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
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
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      // Load user analytics
      const userAnalytics = await getUserAnalytics(user.uid);
      
      // Also load anonymous analytics from localStorage
      const anonymousEvents = getAnonymousAnalytics();
      
      // Combine analytics data
      const combinedAnalytics = { ...userAnalytics };
      
      // Count anonymous events by type
      anonymousEvents.forEach((event: any) => {
        const eventType = event.eventType;
        const countKey = `${eventType}_count`;
        const totalKey = 'total_events';
        
        if (!combinedAnalytics[countKey]) {
          combinedAnalytics[countKey] = 0;
        }
        if (!combinedAnalytics[totalKey]) {
          combinedAnalytics[totalKey] = 0;
        }
        
        combinedAnalytics[countKey]++;
        combinedAnalytics[totalKey]++;
      });
      
      setAnalyticsData(combinedAnalytics);

      // Load top products by views (both authenticated and anonymous)
      const productsQuery = query(
        collection(db, "productAnalytics"),
        where("userId", "in", [user.uid, `anonymous_${user.uid}`]),
        orderBy("product_view_count", "desc"),
        limit(10)
      );
      const productsSnap = await getDocs(productsQuery);
      const products = productsSnap.docs.map(doc => ({
        productId: doc.id,
        ...doc.data()
      } as ProductAnalytics));
      setTopProducts(products);

      // Load recent events (both authenticated and anonymous)
      const eventsQuery = query(
        collection(db, "analytics"),
        where("userId", "in", [user.uid, `anonymous_${user.uid}`]),
        orderBy("timestamp", "desc"),
        limit(20)
      );
      const eventsSnap = await getDocs(eventsQuery);
      const events = eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Also load anonymous events from localStorage for recent events
      const anonymousEventsForRecent = getAnonymousAnalytics();
      const allEvents = [...events, ...anonymousEventsForRecent];
      
      // Sort by timestamp (newest first)
      allEvents.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const bTime = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return bTime.getTime() - aTime.getTime();
      });
      
      setRecentEvents(allEvents.slice(0, 20));

    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    {
      title: "Toplam Ziyaret",
      value: analyticsData?.store_visit_count || 0,
      icon: Eye,
      color: "bg-blue-500",
      description: "Mağaza ziyaretleri"
    },
    {
      title: "Ürün Görüntüleme",
      value: analyticsData?.product_view_count || 0,
      icon: BarChart3,
      color: "bg-green-500",
      description: "Ürün detay sayfası görüntülemeleri"
    },
    {
      title: "Ürün Tıklama",
      value: analyticsData?.product_click_count || 0,
      icon: MousePointer,
      color: "bg-purple-500",
      description: "Ürün kartı tıklamaları"
    },
    {
      title: "Sipariş Butonu",
      value: analyticsData?.order_button_click_count || 0,
      icon: ShoppingCart,
      color: "bg-orange-500",
      description: "Sipariş butonu tıklamaları"
    },
    {
      title: "Aksiyon Butonu",
      value: analyticsData?.action_button_click_count || 0,
      icon: TrendingUp,
      color: "bg-red-500",
      description: "Aksiyon butonu tıklamaları"
    },
    {
      title: "Toplam Etkileşim",
      value: analyticsData?.total_events || 0,
      icon: Users,
      color: "bg-indigo-500",
      description: "Tüm etkileşimler"
    }
  ];

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'store_visit': return '🏪';
      case 'product_view': return '👁️';
      case 'product_click': return '🖱️';
      case 'order_button_click': return '🛒';
      case 'action_button_click': return '⚡';
      case 'category_filter': return '📂';
      case 'search_query': return '🔍';
      case 'highlighted_product_view': return '⭐';
      case 'highlighted_product_click': return '⭐';
      case 'image_gallery_navigation': return '🖼️';
      case 'price_visibility_toggle': return '💰';
      case 'link_type_click': return '🔗';
      default: return '📊';
    }
  };

  const getEventName = (eventType: string) => {
    switch (eventType) {
      case 'store_visit': return 'Mağaza Ziyareti';
      case 'product_view': return 'Ürün Görüntüleme';
      case 'product_click': return 'Ürün Tıklama';
      case 'order_button_click': return 'Sipariş Butonu';
      case 'action_button_click': return 'Aksiyon Butonu';
      case 'category_filter': return 'Kategori Filtresi';
      case 'search_query': return 'Arama Sorgusu';
      case 'highlighted_product_view': return 'Öne Çıkan Ürün Görüntüleme';
      case 'highlighted_product_click': return 'Öne Çıkan Ürün Tıklama';
      case 'image_gallery_navigation': return 'Resim Galerisi Navigasyonu';
      case 'price_visibility_toggle': return 'Fiyat Görünürlük Değişimi';
      case 'link_type_click': return 'Link Tipi Tıklama';
      default: return eventType;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Analitik - katalog.bio</title>
        <meta name="description" content="Mağaza performansınızı takip edin" />
      </Head>
      <div className="max-w-6xl mx-auto mt-10 p-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
            <p className="text-muted-foreground">Mağaza performansınızı takip edin</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button variant="outline">← Dashboard'a Dön</Button>
            </Link>
            <Button onClick={loadAnalytics} variant="secondary">Yenile</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">En Popüler Ürünler</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.productId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.product_view_count || 0} görüntüleme
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {product.order_button_click_count || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">sipariş</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Henüz ürün analitik verisi yok</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Events */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Son Etkileşimler</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl">{getEventIcon(event.eventType)}</div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{getEventName(event.eventType)}</p>
                                             <p className="text-sm text-muted-foreground">
                         {event.data?.productName && `${event.data.productName}`}
                         {event.data?.productPrice && ` • ${event.data.productPrice}${event.data.productCurrency || '₺'}`}
                         {event.data?.categoryName && ` • ${event.data.categoryName}`}
                         {event.data?.searchQuery && ` • "${event.data.searchQuery}"`}
                         {event.data?.linkType && ` • ${event.data.linkType}`}
                         {event.data?.imageIndex !== undefined && ` • Resim ${event.data.imageIndex + 1}/${event.data.totalImages}`}
                         {event.data?.navigationDirection && ` • ${event.data.navigationDirection}`}
                         {event.data?.buttonTitle && ` • ${event.data.buttonTitle}`}
                         {event.data?.searchResultsCount && ` • ${event.data.searchResultsCount} sonuç`}
                         {event.data?.filteredProductsCount && ` • ${event.data.filteredProductsCount} ürün`}
                         {event.data?.totalProducts && ` • ${event.data.totalProducts} ürün`}
                         {event.data?.highlightedProductsCount && ` • ${event.data.highlightedProductsCount} öne çıkan`}
                         {event.data?.productsWithPrice && ` • ${event.data.productsWithPrice} fiyatlı`}
                         {event.data?.productsWithImages && ` • ${event.data.productsWithImages} resimli`}
                         {event.data?.totalCategories && ` • ${event.data.totalCategories} kategori`}
                         {event.data?.productImageCount && ` • ${event.data.productImageCount} resim`}
                         {event.data?.productDescription && event.data.productDescription.length > 30 ? 
                           ` • ${event.data.productDescription.substring(0, 30)}...` : 
                           event.data?.productDescription ? ` • ${event.data.productDescription}` : ''
                         }
                         {event.data?.productHighlighted && ` • ⭐ Öne Çıkan`}
                         {event.data?.productShowPrice && ` • 💰 Fiyat Gösteriliyor`}
                         {event.data?.isHighlightedProduct && ` • ⭐ Öne Çıkan Ürün`}
                         {event.data?.referrer && event.data.referrer !== '' ? ` • Referrer: ${event.data.referrer}` : ''}
                         {event.data?.pagePath && ` • ${event.data.pagePath}`}
                         {event.data?.storeName && ` • ${event.data.storeName}`}
                         {event.data?.storeCustomURL && ` • ${event.data.storeCustomURL}`}
                         {event.data?.buttonColor && ` • Renk: ${event.data.buttonColor}`}
                         {event.data?.customLink && ` • Link: ${event.data.customLink}`}
                         {event.data?.userAgent && event.data.userAgent.length > 50 ? 
                           ` • ${event.data.userAgent.substring(0, 50)}...` : 
                           event.data?.userAgent ? ` • ${event.data.userAgent}` : ''
                         }
                         {event.data?.sessionId && ` • Session: ${event.data.sessionId}`}
                         {event.data?.timestamp && ` • ${new Date(event.data.timestamp).toLocaleString('tr-TR')}`}
                         {event.timestamp?.toDate ? 
                           ` • ${event.timestamp.toDate().toLocaleString('tr-TR')}` : 
                           ` • ${new Date().toLocaleString('tr-TR')}`
                         }
                       </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Henüz etkileşim verisi yok</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rate */}
        {analyticsData && analyticsData.product_view_count && analyticsData.order_button_click_count && (
          <Card className="border-border bg-card mt-8">
            <CardHeader>
              <CardTitle className="text-foreground">Dönüşüm Oranları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {analyticsData.product_view_count > 0 ? 
                      ((analyticsData.order_button_click_count / analyticsData.product_view_count) * 100).toFixed(1) : 0
                    }%
                  </p>
                  <p className="text-sm text-muted-foreground">Görüntüleme → Sipariş</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {(analyticsData.product_click_count || 0) > 0 ? 
                      ((analyticsData.product_view_count / (analyticsData.product_click_count || 1)) * 100).toFixed(1) : 0
                    }%
                  </p>
                  <p className="text-sm text-muted-foreground">Tıklama → Görüntüleme</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {(analyticsData.store_visit_count || 0) > 0 ? 
                      (((analyticsData.product_click_count || 0) / (analyticsData.store_visit_count || 1)) * 100).toFixed(1) : 0
                    }%
                  </p>
                  <p className="text-sm text-muted-foreground">Ziyaret → Ürün Tıklama</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 