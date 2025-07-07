import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { CustomURLDialog } from "../../components/custom-url-dialog";
import { useAuth } from "../_app";
import Link from "next/link";
import React from "react";
import { Share } from "lucide-react";
import Head from "next/head";

interface Category {
  id: string;
  name: string;
  type: "main" | "sub1" | "sub2";
  parentId?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  currency?: string;
  price?: string | number;
  showPrice?: boolean;
  highlighted?: boolean;
  mainCategoryId?: string;
  subCategory1Id?: string;
  subCategory2Id?: string;
  imageUrl?: string;
  customLink?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [customURL, setCustomURL] = useState("");
  const [showCustomURLDialog, setShowCustomURLDialog] = useState(false);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [dialogChecked, setDialogChecked] = useState(false);
  const [showShareDropdown, setShowShareDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [selectedMainCat, setSelectedMainCat] = useState<string | null>(null);
  const [selectedSub1Cat, setSelectedSub1Cat] = useState<string | null>(null);
  const [selectedSub2Cat, setSelectedSub2Cat] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<null | 'share' | 'account'>(null);
  const router = useRouter();
  const { userData: authUserData } = useAuth();
  const shareDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

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
      setDataLoading(true);
      const fetchData = async () => {
        // Fetch user data first to check setup status
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setSetupCompleted(data.setupCompleted || false);
          setCustomURL(data.customURL || "");
          if (data.setupCompleted) {
            setShowCustomURLDialog(false);
          } else if (!data.customURL && !data.storeName && !data.storeCategory) {
            setShowCustomURLDialog(true);
          } else {
            setShowCustomURLDialog(false);
          }
          setDialogChecked(true);
        }
        // Always fetch categories and products
        const catQ = query(collection(db, "categories"), where("userId", "==", user.uid));
        const catSnap = await getDocs(catQ);
        const cats: Category[] = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(cats);
        const prodQ = query(collection(db, "products"), where("userId", "==", user.uid));
        const prodSnap = await getDocs(prodQ);
        const prods: Product[] = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(prods);
        setDataLoading(false);
      };
      fetchData();
    }
  }, [user, setupCompleted]);

  // Responsive dropdown close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        shareDropdownRef.current &&
        !shareDropdownRef.current.contains(e.target as Node)
      ) {
        setShowShareDropdown(false);
      }
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(e.target as Node)
      ) {
        setShowAccountDropdown(false);
      }
    }
    if (showShareDropdown || showAccountDropdown) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showShareDropdown, showAccountDropdown]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  // Store URL
  const storeUrl = customURL ? `${window.location.origin}/${customURL}` : "";

  // Share actions
  const handleCopy = async () => {
    if (storeUrl) {
      await navigator.clipboard.writeText(storeUrl);
      alert("Store link copied!");
    }
  };
  const handleWebShare = () => {
    if (navigator.share && storeUrl) {
      navigator.share({
        title: userData?.storeName || "My Store",
        url: storeUrl,
      });
    } else {
      alert("Web Share API not supported on this device.");
    }
  };

  // Setup progress calculation
  let setupProgress = 0;
  let isSetupComplete = false;
  if (userData) {
    if (userData.setupCompleted) {
      setupProgress = 100;
      isSetupComplete = true;
    } else {
      let steps = 1; // Store Info
      if (categories.length > 0) steps++;
      if (products.length > 0) steps++;
      setupProgress = Math.round((steps / 3) * 100);
      
      // Auto-complete setup if all steps are done
      if (setupProgress === 100 && userData.customURL && userData.storeName) {
        isSetupComplete = true;
      }
    }
  }

  // Helper to get subcategories
  const getSubCategories = (parentId: string, type: 'sub1' | 'sub2') =>
    categories.filter(c => c.type === type && c.parentId === parentId);

  // Compute filtered products based on selected category layer
  let filteredProducts = products;
  if (selectedSub2Cat) {
    filteredProducts = products.filter(p => p.subCategory2Id === selectedSub2Cat);
  } else if (selectedSub1Cat) {
    filteredProducts = products.filter(p => p.subCategory1Id === selectedSub1Cat);
  } else if (selectedMainCat) {
    filteredProducts = products.filter(p => p.mainCategoryId === selectedMainCat);
  }

  // Helper to get current selection label
  const getCurrentCategoryLabel = () => {
    if (selectedSub2Cat) {
      const cat = categories.find(c => c.id === selectedSub2Cat);
      return cat ? cat.name : 'Select Category';
    } else if (selectedSub1Cat) {
      const cat = categories.find(c => c.id === selectedSub1Cat);
      return cat ? cat.name : 'Select Category';
    } else if (selectedMainCat) {
      const cat = categories.find(c => c.id === selectedMainCat);
      return cat ? cat.name : 'Select Category';
    }
    return 'All Categories';
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    }
    if (catDropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [catDropdownOpen]);

  // Responsive grid classes
  const gridClasses =
    "grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full";

  // Mobile menu logic
  const handleMobileMenu = () => setMobileMenuOpen((v) => !v);

  // Add this useEffect to close dropdowns when mobile menu closes
  useEffect(() => {
    if (!mobileMenuOpen) {
      setShowShareDropdown(false);
      setShowAccountDropdown(false);
    }
  }, [mobileMenuOpen]);

  const toggleDropdown = (key: 'share' | 'account') => {
    setActiveDropdown(prev => (prev === key ? null : key));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard - katalog.bio</title>
        <meta name="description" content="Kataloğunuzu yönetin ve ürünlerinizi düzenleyin" />
      </Head>
      <nav className="bg-white border-b border-gray-200 py-2 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto sm:px-4 px-2 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              className="sm:hidden p-2 rounded hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label="Open menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-gray-900">Admin Panel</span>
              <div className="h-6 w-px bg-gray-300"></div>
              {/* Store Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isSetupComplete 
                    ? (userData?.isStoreVisible === false ? 'bg-red-500' : 'bg-green-500')
                    : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-900">
                  {isSetupComplete 
                    ? (userData?.isStoreVisible === false ? 'Store Private' : 'Store Live')
                    : 'Setup Required'
                  }
                </span>
                {!isSetupComplete && (
                  <span className="text-xs text-gray-600">
                    ({setupProgress}% complete)
                  </span>
                )}
                
              </div>
              
             
            </div>
          </div>

          {/* Right - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            
            
            {/* Share */}
            <div className="relative">

              <Button variant="secondary" onClick={() => toggleDropdown("share")}> 
                <Share className="w-5 h-5"></Share>
                Share
                <svg className="ml-1 w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              {activeDropdown === "share" && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-50">
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => customURL && window.open(`/${customURL}`, "_blank")}>Open My Store</button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleCopy}>Copy Store Link</button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleWebShare}>Share My Store</button>
                </div>
              )}
            </div>

            {/* Edit */}
            <Link href="/dashboard/edit-shop">
              <Button variant="outline">Edit My Store</Button>
            </Link>

            {/* Account */}
            <div className="relative">
              <Button variant="outline" onClick={() => toggleDropdown("account")}> 
                <svg className="w-5 h-5 mr-1 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20c0-2.2 3.6-4 6-4s6 1.8 6 4" />
                </svg>
                Account
                <svg className="ml-1 w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              {activeDropdown === "account" && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-50">
                  <Link href="/account"><button className="w-full text-left px-4 py-2 hover:bg-gray-100">My Account</button></Link>
                   <Link href="/upgrade"><button className="w-full text-left px-4 py-2 hover:bg-gray-100">Upgrade</button></Link>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute left-0 top-full w-full bg-white border-b border-gray-200 flex flex-col z-50 animate-fade-in">
           
            
            {/* Share Toggle */}
            <button className="px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between" onClick={() => toggleDropdown("share")}> 
              <span>Share</span>
              <svg className={`ml-2 w-4 h-4 transition-transform ${activeDropdown === 'share' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeDropdown === "share" && (
              <div className="pl-4 border-t border-gray-200">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setActiveDropdown(null); customURL && window.open(`/${customURL}`, "_blank"); }}>Open My Store</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setActiveDropdown(null); handleCopy(); }}>Copy Store Link</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setActiveDropdown(null); handleWebShare(); }}>Share My Store</button>
              </div>
            )}

            {/* Edit */}
            <Link href="/dashboard/edit-shop">
              <button className="px-4 py-2 text-left hover:bg-gray-100 w-full">Edit My Store</button>
            </Link>

            {/* Account Toggle */}
            <button className="px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between" onClick={() => toggleDropdown("account")}> 
              <span>Account</span>
              <svg className={`ml-2 w-4 h-4 transition-transform ${activeDropdown === 'account' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeDropdown === "account" && (
              <div className="pl-4 border-t border-gray-200">
                <Link href="/account"> <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => setActiveDropdown(null)}>My Account</button></Link>
                 <Link href="/upgrade"><button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => setActiveDropdown(null)}>Upgrade</button></Link>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setActiveDropdown(null); handleLogout(); }}>Logout</button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Store Setup Progress Banner */}
      {userData && !isSetupComplete && (
        <div className="mx-4">
          <div className="max-w-screen-xl mx-auto mt-6 mb-4 p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-medium text-gray-900">Store Setup Progress</span>
              <span className="text-xs text-gray-600">{setupProgress}% Complete</span>
            </div>
            <div className="w-full sm:w-64 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${setupProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-screen-xl mx-auto mt-6 px-4 pb-4">
        {/* Layered Category Filter Dropdown and Manage Categories */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-center sm:justify-end">

          <h2 className="text-2xl font-bold text-gray-900 w-full text-left">Products</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto items-center justify-center sm:justify-start">
              {/* Single Dropdown Button for Category Filter */}
              <div className="relative w-full sm:w-auto" ref={catDropdownRef}>
                <Button
                  variant="outline"
                  onClick={() => setCatDropdownOpen(v => !v)}
                  className="w-full   sm:min-w-[180px] sm:w-auto justify-between"
                >
                  <span>{getCurrentCategoryLabel()}</span>
                  <svg className="ml-2 w-4 h-4 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                </Button>
                {catDropdownOpen && (
                  <>
                    {/* Mobile: vertical, indented list */}
                    <div className="absolute left-0 mt-2 w-full bg-white border border-gray-300 rounded shadow-lg z-40 animate-fade-in p-2 max-w-xs overflow-y-auto max-h-[60vh] sm:hidden">
                      {/* All option */}
                      <button
                        className={`w-full text-left px-2 py-2 rounded hover:bg-gray-100 ${!selectedMainCat && !selectedSub1Cat && !selectedSub2Cat ? 'bg-gray-100' : ''}`}
                        onClick={() => {
                          setSelectedMainCat(null);
                          setSelectedSub1Cat(null);
                          setSelectedSub2Cat(null);
                          setCatDropdownOpen(false);
                        }}
                      >
                        All Categories
                      </button>
                      {/* Main categories and their children, indented */}
                      {categories.filter(c => c.type === 'main').map(main => (
                        <React.Fragment key={main.id}>
                          <button
                            className={`w-full text-left px-2 py-2 rounded hover:bg-muted ${selectedMainCat === main.id && !selectedSub1Cat && !selectedSub2Cat ? 'bg-muted' : ''}`}
                            onClick={() => {
                              setSelectedMainCat(main.id);
                              setSelectedSub1Cat(null);
                              setSelectedSub2Cat(null);
                              setCatDropdownOpen(false);
                            }}
                          >
                            {main.name}
                          </button>
                          {/* Sub1 categories */}
                          {getSubCategories(main.id, 'sub1').map(sub1 => (
                            <React.Fragment key={sub1.id}>
                              <button
                                className={`w-full text-left pl-6 pr-2 py-2 rounded hover:bg-muted ${selectedSub1Cat === sub1.id && !selectedSub2Cat ? 'bg-muted' : ''}`}
                                onClick={() => {
                                  setSelectedMainCat(main.id);
                                  setSelectedSub1Cat(sub1.id);
                                  setSelectedSub2Cat(null);
                                  setCatDropdownOpen(false);
                                }}
                              >
                                {sub1.name}
                              </button>
                              {/* Sub2 categories */}
                              {getSubCategories(sub1.id, 'sub2').map(sub2 => (
                                <button
                                  key={sub2.id}
                                  className={`w-full text-left pl-12 pr-2 py-2 rounded hover:bg-muted ${selectedSub2Cat === sub2.id ? 'bg-muted' : ''}`}
                                  onClick={() => {
                                    setSelectedMainCat(main.id);
                                    setSelectedSub1Cat(sub1.id);
                                    setSelectedSub2Cat(sub2.id);
                                    setCatDropdownOpen(false);
                                  }}
                                >
                                  {sub2.name}
                                </button>
                              ))}
                            </React.Fragment>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                    {/* Desktop: keep current menu */}
                    <div className="absolute left-0 mt-2 w-64 bg-card border border-border rounded shadow-lg z-40 animate-fade-in p-2 max-w-[95vw] hidden sm:block">
                      {/* All option */}
                      <button
                        className={`w-full text-left px-3 py-2 rounded hover:bg-muted ${!selectedMainCat && !selectedSub1Cat && !selectedSub2Cat ? 'bg-muted' : ''}`}
                        onClick={() => {
                          setSelectedMainCat(null);
                          setSelectedSub1Cat(null);
                          setSelectedSub2Cat(null);
                          setCatDropdownOpen(false);
                        }}
                      >
                        All Categories
                      </button>
                      {/* Main categories */}
                      {categories.filter(c => c.type === 'main').map(main => (
                        <div key={main.id} className="group relative">
                          <button
                            className={`w-full text-left px-3 py-2 rounded hover:bg-muted flex items-center justify-between ${selectedMainCat === main.id && !selectedSub1Cat && !selectedSub2Cat ? 'bg-muted' : ''}`}
                            onClick={() => {
                              setSelectedMainCat(main.id);
                              setSelectedSub1Cat(null);
                              setSelectedSub2Cat(null);
                            }}
                            onMouseEnter={() => setSelectedMainCat(main.id)}
                          >
                            {main.name}
                            {getSubCategories(main.id, 'sub1').length > 0 && (
                              <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
                            )}
                          </button>
                          {/* Sub1 categories as submenu */}
                          {selectedMainCat === main.id && getSubCategories(main.id, 'sub1').length > 0 && (
                            <div className="absolute left-full top-0 mt-0 ml-2 w-56 bg-card border border-border rounded shadow-lg z-50 p-2 max-w-[95vw]">
                              {getSubCategories(main.id, 'sub1').map(sub1 => (
                                <div key={sub1.id} className="group relative">
                                  <button
                                    className={`w-full text-left px-3 py-2 rounded hover:bg-muted flex items-center justify-between ${selectedSub1Cat === sub1.id && !selectedSub2Cat ? 'bg-muted' : ''}`}
                                    onClick={() => {
                                      setSelectedMainCat(main.id);
                                      setSelectedSub1Cat(sub1.id);
                                      setSelectedSub2Cat(null);
                                      setCatDropdownOpen(false);
                                    }}
                                    onMouseEnter={() => setSelectedSub1Cat(sub1.id)}
                                  >
                                    {sub1.name}
                                    {getSubCategories(sub1.id, 'sub2').length > 0 && (
                                      <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
                                    )}
                                  </button>
                                  {/* Sub2 categories as submenu */}
                                  {selectedSub1Cat === sub1.id && getSubCategories(sub1.id, 'sub2').length > 0 && (
                                    <div className="absolute left-full top-0 mt-0 ml-2 w-56 bg-card border border-border rounded shadow-lg z-50 p-2 max-w-[95vw]">
                                      {getSubCategories(sub1.id, 'sub2').map(sub2 => (
                                        <button
                                          key={sub2.id}
                                          className={`w-full text-left px-3 py-2 rounded hover:bg-muted ${selectedSub2Cat === sub2.id ? 'bg-muted' : ''}`}
                                          onClick={() => {
                                            setSelectedMainCat(main.id);
                                            setSelectedSub1Cat(sub1.id);
                                            setSelectedSub2Cat(sub2.id);
                                            setCatDropdownOpen(false);
                                          }}
                                        >
                                          {sub2.name}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
          </div>
</div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-center sm:justify-end">
            
            <Button className="w-full sm:w-auto" onClick={() => router.push('/dashboard/new-product')}>+ Add Product</Button>
            <Button className="w-full sm:w-auto" onClick={() => router.push('/dashboard/new-category')} variant="secondary">Manage Categories</Button>
          </div>
        </div>

        {/* Product Grid */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="relative w-12 h-12 mx-auto mb-3">
                <div className="absolute inset-0 border-3 border-muted rounded-full"></div>
                <div className="absolute inset-0 border-3 border-primary rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-sm text-muted-foreground">Loading your store data...</p>
            </div>
          </div>
        ) : (
          <div className={gridClasses}>
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-muted-foreground">No products found.</div>
            ) : (
              filteredProducts.map(product => (
                <Card key={product.id} className={`border-border bg-card flex flex-col ${product.highlighted ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader>
                    <CardTitle className="text-foreground flex-col flex items-start gap-2">
                      {product.name}
                      {product.highlighted && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          Highlighted
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-2">
                    {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover rounded" />}
                    {product.description && <div className="text-xs text-muted-foreground line-clamp-2 overflow-ellipsis mb-1">{product.description}</div>}
                    <div className="flex-1"></div>
                    <div className="flex items-center justify-between mt-2">
                    {product.showPrice && product.price && (
  <div className="text-sm font-semibold text-foreground">
    {new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 
        product.currency && ['TRY', 'USD', 'EUR'].includes(product.currency)
          ? product.currency
          : 'TRY',
    }).format(Number(product.price))}
  </div>
)}
                      <Link href={`/dashboard/edit-product/${product.id}`} passHref legacyBehavior>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Custom URL Dialog - Only show for brand new users after checking data */}
      {!setupCompleted && dialogChecked && (
        <CustomURLDialog 
          open={showCustomURLDialog} 
          onClose={() => setShowCustomURLDialog(false)} 
        />
      )}
    </div>
  );
} 