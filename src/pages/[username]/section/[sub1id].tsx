import { GetServerSideProps } from "next";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { ArrowBigLeft, ArrowLeft } from "lucide-react";

export default function SectionPage({ user, categories, products, mainCategory, sub1Category, sub1Categories, sub2Categories = [] }: any) {
  const router = useRouter();
  const [activeSub2, setActiveSub2] = useState<string | null>(null);

  if (!user) {
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

  // Get the main category parameter from the current URL or use the main category from props
  const mainCategoryParam = router.query.main || mainCategory?.id;

  // Filter products by sub2 if selected
  const filteredProducts = activeSub2
    ? products.filter((p: any) => p.subCategory2Id === activeSub2)
    : products;

  return (
    <>
      <Head>
        <title>{sub1Category?.name ? `${sub1Category.name} - ${user?.storeName || user?.displayName || user?.customURL} - katalog.bio` : 'Kategori - katalog.bio'}</title>
        <meta name="description" content={`${sub1Category?.name || 'Kategori'} ürünlerini keşfedin`} />
      </Head>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white shadow p-4 flex flex-col gap-2 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={mainCategoryParam ? `/${user.customURL}?main=${mainCategoryParam}` : `/${user.customURL}`}>
            <button className="rounded-full  p-2 hover:bg-gray-100  " title="Go back">
 <ArrowLeft  />
 
             </button>
          </Link>
        
          <div>
            <div className="font-bold text-lg">{user.displayName || user.customURL}</div>
             <div className="text-xs text-gray-500  ">{mainCategory?.name} / {sub1Category?.name}</div>
          </div>
        </div>
      
        {/* Sub2 category tabs */}
        {sub2Categories?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-2">
            <button
              className={`flex flex-col items-center min-w-[64px] px-4 py-2 rounded-full border ${!activeSub2 ? 'bg-black text-white' : 'bg-white text-gray-700'}  `}
              onClick={() => setActiveSub2(null)}
            >
              <span className="text-xs font-medium">All</span>
            </button>
            {sub2Categories.map((cat: any) => (
              <button
                key={cat.id}
                className={`flex flex-col items-center min-w-[64px] px-4 py-2 rounded-full border ${activeSub2 === cat.id ? 'bg-black text-white' : 'bg-white text-gray-700'}  `}
                onClick={() => setActiveSub2(cat.id)}
              >
                <span className="text-xs font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Product grid */}
      <div className="  mx-auto p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 mt-12">No products found.</div>
        ) : (
          filteredProducts.map((product: any) => (
            <Link key={product.id} href={`/${user.customURL}/product/${product.id}`}>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
                  <p className="text-lg font-bold text-blue-600">{product.price}₺</p>
                )}
              </div>
            </div>
          </Link>
          ))
        )}
      </div>
    </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username, sub1id } = context.params as { username: string, sub1id: string };
  let user = null;
  let categories: any[] = [];
  let products: any[] = [];
  let mainCategory: any = null;
  let sub1Category: any = null;
  let sub1Categories: any[] = [];
  let sub2Categories: any[] = [];
  if (username && sub1id) {
    const q = query(collection(db, "users"), where("customURL", "==", username));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const userData = snap.docs[0].data();
      user = {
        ...userData,
        uid: snap.docs[0].id,
        createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : null,
        updatedAt: userData.updatedAt ? userData.updatedAt.toDate().toISOString() : null,
      } as any;
      
      // Check if store is visible
      if (user.isStoreVisible === false) {
        return {
          props: { user: null, categories: [], products: [], mainCategory: null, sub1Category: null, sub1Categories: [], sub2Categories: [] }
        };
      }
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
      sub1Category = categories.find(c => c.id === sub1id && c.type === "sub1");
      mainCategory = categories.find(c => c.id === sub1Category?.parentId && c.type === "main");
      sub1Categories = categories.filter(c => c.type === "sub1" && c.parentId === mainCategory?.id);
      sub2Categories = categories.filter(c => c.type === "sub2" && c.parentId === sub1id);
      const prodQ = query(collection(db, "products"), where("userId", "==", user.uid), where("subCategory1Id", "==", sub1id));
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
    props: { user, categories, products, mainCategory, sub1Category, sub1Categories, sub2Categories },
  };
}; 