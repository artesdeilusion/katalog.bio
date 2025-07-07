import { GetServerSideProps } from "next";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { ArrowLeft } from "lucide-react";
// import { trackEvent } from "../../../utils/analytics";

export default function ProductDetail({ user, product, categories }: { user: { customURL: string; storeName?: string; displayName?: string; phoneNumber?: string; actionButtonTitle?: string; actionButtonLink?: string; actionButtonColor?: string; uid: string }, product: { id: string; name: string; description?: string; imageUrls?: string[]; imageUrl?: string; customLink?: string; mainCategoryId?: string; subCategory1Id?: string; subCategory2Id?: string; showPrice?: boolean; price?: number }, categories: { id: string; name: string }[] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  // Get all images (support both new imageUrls array and old imageUrl)
  const allImages = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : product.imageUrl 
      ? [product.imageUrl] 
      : [];

  // Track product view (disabled for now)
  useEffect(() => {
    if (product?.id) {
      // Temporarily disabled analytics to fix product page
      console.log('Product view tracked (analytics disabled):', product.name);
    }
  }, [product?.id, product?.name]);

  if (!user || !product) {
    return <div className="text-center mt-20"><h2>Product not found</h2></div>;
  }

  const handleOrder = () => {
    const message = `Merhaba, ${product.name} hakkında bilgi almak istiyorum.`;
    
    let url = '';
    let linkType = 'unknown';
    
    if (product.customLink) {
      // Auto-detect link type from URL
      const link = product.customLink.toLowerCase();
      if (link.includes('wa.me') || link.includes('whatsapp')) {
        // WhatsApp link
        const phoneNumber = link.replace(/\D/g, '');
        url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        linkType = 'whatsapp';
      } else if (link.includes('t.me') || link.includes('telegram')) {
        // Telegram link
        const username = link.includes('@') ? link.split('@')[1] : link.split('t.me/')[1];
        url = `https://t.me/${username}`;
        linkType = 'telegram';
      } else if (link.includes('mailto:') || link.includes('@') && link.includes('.')) {
        // Email link
        const email = link.replace('mailto:', '');
        url = `mailto:${email}?subject=${encodeURIComponent(`Sipariş: ${product.name}`)}&body=${encodeURIComponent(message)}`;
        linkType = 'email';
      } else if (link.includes('yemeksepeti')) {
        // Yemeksepeti link
        url = product.customLink;
        linkType = 'yemeksepeti';
      } else if (link.includes('trendyol')) {
        // Trendyol link
        url = product.customLink;
        linkType = 'trendyol';
      } else {
        // Website or other link
        url = product.customLink;
        linkType = 'website';
      }
    } else {
      // Fallback to user's phone number
      url = `https://wa.me/${user.phoneNumber || ''}?text=${encodeURIComponent(message)}`;
      linkType = 'whatsapp_fallback';
    }
    
    // Track order button click (disabled for now)
    console.log('Order button clicked (analytics disabled):', product.name, linkType);
    
    window.open(url, '_blank');
  };

  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % allImages.length;
    setCurrentImageIndex(newIndex);
    
    // Track image navigation (disabled for now)
    console.log('Image navigation (analytics disabled):', newIndex, allImages.length);
  };

  const prevImage = () => {
    const newIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    setCurrentImageIndex(newIndex);
    
    // Track image navigation (disabled for now)
    console.log('Image navigation (analytics disabled):', newIndex, allImages.length);
  };

  return (
    <>
      <Head>
        <title>{product?.name ? `${product.name} - ${user?.storeName || user?.displayName || user?.customURL} - katalog.bio` : 'Ürün - katalog.bio'}</title>
        <meta name="description" content={product?.description || "Ürün detayları"} />
      </Head>
      <div className="min-h-screen bg-white">
        {/* Header/Navbar */}
        <div className="bg-white p-4 flex flex-col gap-2 sticky top-0 z-10 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link href={`/${user.customURL}`}>
              <button className="rounded-full p-2 hover:bg-gray-100 text-gray-600" title="Back to store">
                <span className="text-xl">
                  <ArrowLeft></ArrowLeft>
                </span>
              </button>
            </Link>
            
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
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            {/* Product Images */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
              {allImages.length > 0 ? (
                <>
                  <img 
                    src={allImages[currentImageIndex]} 
                    alt={product.name} 
                    className="object-cover w-full h-full"
                  />
                  
                  {/* Image Navigation */}
                  {allImages.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition"
                      >
                        ‹
                      </button>
                      
                      {/* Next Button */}
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70 transition"
                      >
                        ›
                      </button>
                      
                      {/* Image Counter */}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <span className="text-6xl text-gray-300">🖼️</span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        
                        // Track thumbnail click (disabled for now)
                        if (index !== currentImageIndex) {
                          console.log('Thumbnail click (analytics disabled):', index, allImages.length);
                        }
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        currentImageIndex === index 
                          ? 'border-blue-600' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Product Info */}
            <div className="p-6 space-y-4">
              {/* Product Name */}
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

              {/* Price */}
              {product.showPrice && product.price && (
                <div className="text-2xl font-bold text-black">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(Number(product.price))}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="text-gray-600 leading-relaxed">
                  {product.description}
                </div>
              )}

              {/* Order Button */}
              <button
                onClick={handleOrder}
                className="w-full bg-black text-white rounded-full py-4 text-lg font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2"
              >
                <span>
                  {(() => {
                    if (!product.customLink) return '📱';
                    const link = product.customLink.toLowerCase();
                    if (link.includes('wa.me') || link.includes('whatsapp')) return '📱';
                    if (link.includes('yemeksepeti')) return '🍕';
                    if (link.includes('trendyol')) return '🛍️';
                    if (link.includes('t.me') || link.includes('telegram')) return '📬';
                    if (link.includes('mailto:') || (link.includes('@') && link.includes('.'))) return '📧';
                    return '🌐';
                  })()}
                </span>
                {(() => {
                  if (!product.customLink) return 'Sipariş Ver';
                  const link = product.customLink.toLowerCase();
                  if (link.includes('wa.me') || link.includes('whatsapp')) return 'WhatsApp ile Sipariş Ver';
                  if (link.includes('yemeksepeti')) return 'Yemeksepeti&apos;den Sipariş Ver';
                  if (link.includes('trendyol')) return 'Trendyol&apos;dan Sipariş Ver';
                  if (link.includes('t.me') || link.includes('telegram')) return 'Telegram ile İletişim';
                  if (link.includes('mailto:') || (link.includes('@') && link.includes('.'))) return 'Email ile İletişim';
                  return 'Websitesini Ziyaret Et';
                })()}
              </button>

              {/* Additional Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <p>Bu ürün hakkında daha fazla bilgi almak için WhatsApp&apos;tan mesaj gönderin.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username, id } = context.params as { username: string; id: string };
  let user = null;
  let product = null;
  let categories: { id: string; name: string; userId: string; createdAt?: string; updatedAt?: string }[] = [];

  if (username && id) {
    // Find user by customURL
    const userQuery = query(collection(db, "users"), where("customURL", "==", username));
    const userSnap = await getDocs(userQuery);
    
    if (!userSnap.empty) {
      const userData = userSnap.docs[0].data();
      user = {
        ...userData,
        uid: userSnap.docs[0].id,
        createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : null,
        updatedAt: userData.updatedAt ? userData.updatedAt.toDate().toISOString() : null,
      } as any;

      // Check if store is visible
      if (user.isStoreVisible === false) {
        return {
          props: { user: null, product: null, categories: [] }
        };
      }

      // Get product
      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const productData = productSnap.data();
        product = {
          ...productData,
          id: productSnap.id,
          createdAt: productData.createdAt ? productData.createdAt.toDate().toISOString() : null,
          updatedAt: productData.updatedAt ? productData.updatedAt.toDate().toISOString() : null,
        };
      }

      // Get categories
      const catQuery = query(collection(db, "categories"), where("userId", "==", user.uid));
      const catSnap = await getDocs(catQuery);
      categories = catSnap.docs.map(doc => {
        const data = doc.data() as { name: string; userId: string; createdAt?: any; updatedAt?: any };
        return {
          id: doc.id,
          name: data.name,
          userId: data.userId,
          createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : undefined,
          updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : undefined,
        };
      });
    }
  }

  return {
    props: { user, product, categories },
  };
}; 