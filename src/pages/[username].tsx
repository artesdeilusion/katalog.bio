import { GetServerSideProps } from "next";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import { Filter, FilterIcon, Home, Rows2, SlidersHorizontal, SlidersHorizontalIcon } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "../components/ui/carousel";
import { Card, CardContent } from "../components/ui/card";
import Footer from "@/components/footer";
// import { trackEvent } from "../utils/analytics";

export default function PublicProfile({ user, categories, products }: { user: any, categories: any[], products: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeMain, setActiveMain] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [filterSize, setFilterSize] = useState<string>("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterWithPrice, setFilterWithPrice] = useState(false);
  const [filterWithImage, setFilterWithImage] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Initialize state from URL parameters
  useEffect(() => {
    if (router.query.main) {
      setActiveMain(router.query.main as string);
    }
    if (router.query.search) {
      setSearch(router.query.search as string);
    }
    if (router.query.sort) {
      setSort(router.query.sort as string);
    }
  }, [router.query]);

  // Track page view (disabled for now)
  useEffect(() => {
    console.log('Store visit tracked (analytics disabled):', user?.storeName || user?.customURL);
  }, [user?.uid, router.asPath, products, categories]);

  if (!user) {
    return <div className="text-center mt-20"><h2>User not found</h2></div>;
  }

  // Check if store is visible
  if (user.isStoreVisible === false) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Store is Private</h2>
          <p className="text-gray-600">
            This store is currently not visible to the public.
          </p>
        </div>
      </div>
    );
  }

  // Main categories for dropdown
  const mainCategories = categories.filter(c => c.type === "main");
  // Sub1 categories filtered by main
  const sub1Categories = categories.filter(c => c.type === "sub1" && (!activeMain || c.parentId === activeMain));

  // Collect all sizes from products
  const allSizes = Array.from(new Set(products.flatMap(p => Array.isArray(p.sizes) ? p.sizes : []))).filter(Boolean);

  // Filter products by search, main, section, and filters
  let filteredProducts = products.filter(p => {
    const matchesSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesMain = !activeMain || p.mainCategoryId === activeMain;
    const matchesSection = !activeSection || p.subCategory1Id === activeSection;
    const matchesSize = !filterSize || (Array.isArray(p.sizes) && p.sizes.includes(filterSize));
    const matchesMinPrice = !filterMinPrice || (p.price && (typeof p.price === 'number' ? p.price : parseFloat(p.price)) >= parseFloat(filterMinPrice));
    const matchesMaxPrice = !filterMaxPrice || (p.price && (typeof p.price === 'number' ? p.price : parseFloat(p.price)) <= parseFloat(filterMaxPrice));
    const matchesWithPrice = !filterWithPrice || (p.price && p.showPrice);
    const matchesWithImage = !filterWithImage || !!((p.imageUrls && p.imageUrls.length > 0) || p.imageUrl);
    return matchesSearch && matchesMain && matchesSection && matchesSize && matchesMinPrice && matchesMaxPrice && matchesWithPrice && matchesWithImage;
  });

  // Sort products
  filteredProducts = filteredProducts.sort((a, b) => {
    if (sort === "newest") {
      return (b.createdAt || 0) > (a.createdAt || 0) ? 1 : -1;
    } else if (sort === "oldest") {
      return (a.createdAt || 0) > (b.createdAt || 0) ? 1 : -1;
    } else if (sort === "priceLow") {
      const aPrice = typeof a.price === 'number' ? a.price : parseFloat(a.price || "0");
      const bPrice = typeof b.price === 'number' ? b.price : parseFloat(b.price || "0");
      return aPrice - bPrice;
    } else if (sort === "priceHigh") {
      const aPrice = typeof a.price === 'number' ? a.price : parseFloat(a.price || "0");
      const bPrice = typeof b.price === 'number' ? b.price : parseFloat(b.price || "0");
      return bPrice - aPrice;
    }
    return 0;
  });

  // Helper for filter summary
  const filterSummary = [
    filterSize && `Size: ${filterSize}`,
    filterMinPrice && `Min ₺${filterMinPrice}`,
    filterMaxPrice && `Max ₺${filterMaxPrice}`,
    filterWithPrice && "With Price",
    filterWithImage && "With Image"
  ].filter(Boolean).join(", ");

  // Update URL when state changes
  const updateURL = (newMain: string | null, newSearch: string, newSort: string) => {
    const params = new URLSearchParams();
    if (newMain) params.set('main', newMain);
    if (newSearch) params.set('search', newSearch);
    if (newSort && newSort !== 'newest') params.set('sort', newSort);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    const currentPath = `/${user.customURL}${newURL}`;
    router.replace(currentPath, undefined, { shallow: true });
  };

  // Highlighted products for carousel (highlighted products with images, limited to 5)
  const highlightedProducts = products
    .filter(p => p.highlighted && ((p.imageUrls && p.imageUrls.length > 0) || p.imageUrl))
    .slice(0, 5);

    return (
<>
     <Head>
       <title>{user.storeName ? `${user.storeName} - katalog.bio` : `${user.displayName || user.customURL} - katalog.bio`}</title>
       <meta name="description" content={user.storeDescription || "Ürünlerimizi keşfedin"} />
     </Head>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white p-4 flex flex-col gap-2 sticky top-0 z-10 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center overflow-hidden">
            {user.storeLogoUrl ? (
              <img 
                src={user.storeLogoUrl} 
                alt="Store Logo" 
                className="w-full h-full object- p-2" 
              />
            ) : (
              <Home className="size-5 text-gray-600" />
            )}
          </div>
          <div className="flex items-center flex-row space-x-2">
            <div className="font-bold text-lg text-gray-900">{user.storeName || user.displayName || user.customURL}</div>
  
              </div>
          <div className="ml-auto flex items-center gap-2">
            {user.actionButtonTitle && user.actionButtonLink && (
              <a
                href={user.actionButtonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full text-white font-medium text-sm"
                style={{ backgroundColor: user.actionButtonColor || '#000000' }}
                onClick={() => {
                  console.log('Action button click (analytics disabled):', user?.actionButtonTitle);
                }}
              >
                {user.actionButtonTitle}
              </a>
            )}
            <button className="rounded-full p-2 hover:bg-gray-100 text-gray-600"><span className="text-xl">⋯</span></button>
          </div>
        </div>
        {/* Search bar with sort and filter buttons */}
        <div className="flex items-center gap-2 mt-2">

 <div className="  flex  gap-2 items-center">
           <select
            className=" px-1 py-2 border border-gray-300 rounded-3xl mt-0.5 text-sm bg-white text-black"
            value={activeMain || ""}
            onChange={e => {
              const newMain = e.target.value || null;
              setActiveMain(newMain);
              setActiveSection(null);
              updateURL(newMain, search, sort);
              
              // Track category filter (disabled for now)
              if (newMain) {
                const selectedCategory = mainCategories.find(c => c.id === newMain);
                console.log('Category filter (analytics disabled):', selectedCategory?.name);
              }
            }}
          >
            <option value="">All</option>
            {mainCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>    
          <input
            type="text"
            placeholder="Search any product..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            value={search}
            onChange={e => {
              const newSearch = e.target.value;
              setSearch(newSearch);
              updateURL(activeMain, newSearch, sort);
              
              // Track search query (disabled for now)
              if (newSearch) {
                const mainCategory = categories.find(c => c.id === activeMain);
                console.log('Search query (analytics disabled):', newSearch);
              }
            }}
          />
          {/* Sort button */}
          <div className="relative">
            <button
              className="rounded-full border border-gray-300 bg-white shadow-sm w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-100 transition text-gray-600"
              onClick={() => setShowSort(v => !v)}
              aria-label="Sort"
            >
              <Rows2 ></Rows2>
            </button>
            {showSort && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow z-20">
                <button className={`block w-full text-left px-4 py-2 hover:bg-gray-100 text-black ${sort === "newest" ? "font-bold" : ""}`} onClick={() => { setSort("newest"); setShowSort(false); updateURL(activeMain, search, "newest"); }}>Newest</button>
                <button className={`block w-full text-left px-4 py-2 hover:bg-gray-100 text-black ${sort === "oldest" ? "font-bold" : ""}`} onClick={() => { setSort("oldest"); setShowSort(false); updateURL(activeMain, search, "oldest"); }}>Oldest</button>
                <button className={`block w-full text-left px-4 py-2 hover:bg-gray-100 text-black ${sort === "priceLow" ? "font-bold" : ""}`} onClick={() => { setSort("priceLow"); setShowSort(false); updateURL(activeMain, search, "priceLow"); }}>Price: Low to High</button>
                <button className={`block w-full text-left px-4 py-2 hover:bg-gray-100 text-black ${sort === "priceHigh" ? "font-bold" : ""}`} onClick={() => { setSort("priceHigh"); setShowSort(false); updateURL(activeMain, search, "priceHigh"); }}>Price: High to Low</button>
              </div>
            )}
          </div>
          {/* Filter button */}
          <div className="relative">
            <button
              className="rounded-full border border-gray-300 bg-white shadow-sm w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-100 transition text-gray-600"
              onClick={() => setShowFilter(v => !v)}
              aria-label="Filter"
            >
<SlidersHorizontalIcon></SlidersHorizontalIcon>
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded shadow z-20 p-4 flex flex-col gap-3">
                
                <div className="flex gap-2">
                  <input type="number" className="rounded border border-gray-300 px-2 py-1 text-sm w-20 bg-white text-black" placeholder="Min ₺" value={filterMinPrice} onChange={e => setFilterMinPrice(e.target.value)} />
                  <input type="number" className="rounded border border-gray-300 px-2 py-1 text-sm w-20 bg-white text-black" placeholder="Max ₺" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} />
                </div>
                <label className="flex items-center gap-2 text-sm text-black">
                  <input type="checkbox" checked={filterWithPrice} onChange={e => setFilterWithPrice(e.target.checked)} /> With Price
                </label>
                <label className="flex items-center gap-2 text-sm text-black">
                  <input type="checkbox" checked={filterWithImage} onChange={e => setFilterWithImage(e.target.checked)} /> With Image
                </label>
                <button className="mt-2 rounded bg-blue-600 text-white px-4 py-2 text-sm font-semibold" onClick={() => setShowFilter(false)}>Apply</button>
              </div>
            )}
          </div>
        </div>
        {/* Horizontal scroll of sub1 categories */}
        {activeMain && sub1Categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-1">
            {sub1Categories.map(cat => (
              <Link key={cat.id} href={`/${user.customURL}/section/${cat.id}`}>
                <button
                  className={`flex flex-col items-center min-w-[64px] px-4 py-2 rounded-full border border-gray-300 bg-white text-black hover:bg-blue-600 hover:text-white transition`}
                >
                  <span className="text-xs font-medium">{cat.name}</span>
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Highlighted Products Carousel */}
      {!activeMain && highlightedProducts.length > 0 && (
        <div className="p-4">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Öne Çıkan Ürünler</h3>
  <Carousel className="w-full" opts={{ loop: true }}>
    <CarouselContent>
      {highlightedProducts.map((product, index) => (
        <CarouselItem key={product.id} className="md:basis-1/5 sm:basis-1/3 basis-4/5">
          <Link href={`/${user.customURL}/product/${product.id}`}>
            <Card className="h-full border-gray-200 bg-white flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="px-4 flex flex-col h-full">
                <div className="aspect-square mb-4 relative">
                  {(product.imageUrls && product.imageUrls.length > 0) || product.imageUrl ? (
                    <>
                      <img 
                        src={product.imageUrls?.[0] || product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Image Counter */}
                      {product.imageUrls && product.imageUrls.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          +{product.imageUrls.length - 1}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                      <span className="text-4xl text-gray-400">🖼️</span>
                    </div>
                  )}
                </div>
                <h4 className="font-semibold line-clamp-2  text-gray-900 mb-2">{product.name}</h4>
                {product.description && (
                  <p className="text-sm line-clamp-2 overflow-ellipsis text-gray-600 mb-2">{product.description}</p>
                )}
                              {product.showPrice && product.price && (
                <p className="text-lg font-bold text-black mt-auto">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(Number(product.price))}
                </p>
              )}
              </CardContent>
            </Card>
          </Link>
        </CarouselItem>
      ))}
    </CarouselContent> 
  </Carousel>
</div>
      )}

              {/* Products Grid */}
        <div className="p-4">
        {!activeMain && highlightedProducts.length > 0 && (
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    Tüm Ürünler
  </h3>
)}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <Link key={product.id} href={`/${user.customURL}/product/${product.id}`}>
              <div 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => {
                  console.log('Product click (analytics disabled):', product.name);
                }}
              >
                {/* Product Images */}
                {(product.imageUrls && product.imageUrls.length > 0) || product.imageUrl ? (
                  <div className="aspect-square relative">
                    {/* Main Image */}
                    <img 
                      src={product.imageUrls?.[0] || product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                    {/* Image Counter */}
                    {product.imageUrls && product.imageUrls.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        +{product.imageUrls.length - 1}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">🖼️</span>
                  </div>
                )}
                <div className="p-2">
                  <h3 className="font-semibold line-clamp-2 text-gray-900 mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm line-clamp-2 overflow-ellipsis text-gray-600 mb-2">{product.description}</p>
                  )}
                                  {product.showPrice && product.price && (
                  <p className="text-lg font-bold text-black">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    }).format(Number(product.price))}
                  </p>
                )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
     </div>
    
 
     <footer className=" mx-auto pt-4 pb-8 max-w-screen-xl   flex flex-col items-center text-center gap-4">
             
            <Link
  href="/register"
  className="px-3 py-2 rounded-3xl flex-row flex items-center text-base bg-[#ffc091] font-semibold text-[#260A2F]
             shadow-xl transition duration-300 transform hover:translate-x-1 hover:shadow-2xl"
>
<div className="bg-[#260a2f]   rounded-3xl w-9 h-9 flex items-center justify-center mr-2 min-w-9">
              <img src="/logo_light.svg" alt="Logo" width={25} height={25} />
            </div>
Kendi Dijital Kataloğunu Oluştur
</Link>

            <div className="flex gap-4 text-sm text-gray-600">
              <button 
                onClick={() => {
                  // Reset cookie consent to show banner again
                  localStorage.removeItem('cookieConsent');
                  localStorage.removeItem('cookieSettings');
                  window.location.reload();
                }}
                className="hover:text-gray-900 transition"
              >
                Çerez Ayarları
              </button>
              <span>•</span>
              <Link href="/privacy" className="hover:text-gray-900 transition">
                Gizlilik Politikası
              </Link>
            </div>
</footer>
 </>    
     
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const username = context.params?.username as string;
  let user = null;
  let categories: any[] = [];
  let products: any[] = [];
  if (username) {
    const q = query(collection(db, "users"), where("customURL", "==", username));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const userData = snap.docs[0].data();
      user = {
        ...userData,
        uid: snap.docs[0].id,
        createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : null,
        updatedAt: userData.updatedAt ? userData.updatedAt.toDate().toISOString() : null,
      };
      // Fetch categories and products for this user
      const catQ = query(collection(db, "categories"), where("userId", "==", user.uid));
      const catSnap = await getDocs(catQ);
      categories = catSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
          updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
        };
      });
      const prodQ = query(collection(db, "products"), where("userId", "==", user.uid));
      const prodSnap = await getDocs(prodQ);
      products = prodSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
          updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
        };
      });
    }
  }
  return {
    props: { user, categories, products },
  };
}; 