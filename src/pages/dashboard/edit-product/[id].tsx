import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, db, storage } from "../../../firebase";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import Head from "next/head";


interface Category {
  id: string;
  name: string;
  type: "main" | "sub1" | "sub2";
  parentId?: string;
}

export default function EditProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    currency: "₺",
    price: "",
    showPrice: false,
    highlighted: false,
    mainCategoryId: "",
    subCategory1Id: "",
    subCategory2Id: "",
    images: [] as File[],
    imageUrls: [] as string[],
    customLink: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) router.replace("/login");
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && id) {
      // Fetch categories
      const fetchCategories = async () => {
        const catQ = query(collection(db, "categories"), where("userId", "==", user.uid));
        const catSnap = await getDocs(catQ);
        setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      };
      fetchCategories();
      // Fetch product
      const fetchProduct = async () => {
        const prodRef = doc(db, "products", id as string);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          const data = prodSnap.data();
          setForm(f => ({
            ...f,
            name: data.name || "",
            description: data.description || "",
            currency: data.currency || "₺",
            price: data.price ? data.price.toString() : "",
            showPrice: data.showPrice || false,
            highlighted: data.highlighted || false,
            mainCategoryId: data.mainCategoryId || "",
            subCategory1Id: data.subCategory1Id || "",
            subCategory2Id: data.subCategory2Id || "",
            imageUrls: data.imageUrls || [data.imageUrl || ""].filter(Boolean),
            customLink: data.customLink || "",
          }));
        }
      };
      fetchProduct();
    }
  }, [user, id]);

  // Filtered category lists
  const mainCategories = categories.filter(c => c.type === "main");
  const sub1Categories = categories.filter(c => c.type === "sub1" && c.parentId === form.mainCategoryId);
  const sub2Categories = categories.filter(c => c.type === "sub2" && c.parentId === form.subCategory1Id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked, files } = e.target as any;
    if (type === "checkbox") {
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      // Handle multiple file selection
      if (files) {
        const newImages = Array.from(files) as File[];
        setForm(f => ({ ...f, images: [...f.images, ...newImages] }));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
      if (name === "mainCategoryId") {
        setForm(f => ({ ...f, mainCategoryId: value, subCategory1Id: "", subCategory2Id: "" }));
      }
      if (name === "subCategory1Id") {
        setForm(f => ({ ...f, subCategory1Id: value, subCategory2Id: "" }));
      }
    }
  };



  const removeImage = (index: number) => {
    setForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
      imageUrls: f.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name) {
      setError("Product name is required.");
      return;
    }
    // Check if at least one category level is selected
    if (!form.mainCategoryId) {
      setError("Please select at least a main category.");
      return;
    }
    setSubmitting(true);
    let imageUrls = [...form.imageUrls];
    try {
      // Upload new images
      if (form.images.length > 0) {
        const uploadPromises = form.images.map(async (image, index) => {
          const storageRef = ref(storage, `products/${user!.uid}/${Date.now()}_${index}_${image.name}`);
          await uploadBytes(storageRef, image);
          return await getDownloadURL(storageRef);
        });
        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      }
      
      await updateDoc(doc(db, "products", id as string), {
        name: form.name,
        description: form.description,
        currency: form.currency,
        price: form.price ? parseFloat(form.price) : null,
        showPrice: form.showPrice,
        highlighted: form.highlighted,
        mainCategoryId: form.mainCategoryId,
        subCategory1Id: form.subCategory1Id,
        subCategory2Id: form.subCategory2Id,
        imageUrls,
        imageUrl: imageUrls[0] || "", // Keep for backward compatibility
        customLink: form.customLink,
        updatedAt: serverTimestamp(),
      });
      setSuccess("Product updated successfully!");
      setForm(f => ({ ...f, imageUrls, images: [] }));
    } catch (err: any) {
      setError(err.message || "Error updating product.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Head>
        <title>Ürün Düzenle - katalog.bio</title>
        <meta name="description" content="Ürün bilgilerinizi düzenleyin" />
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Edit Product</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">Update your product information and settings</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Product Name *
                  </Label>
                  <Input 
                    id="name"
                    name="name" 
                    type="text" 
                    className="mt-1 h-12 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" 
                    value={form.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Description
                  </Label>
                  <textarea 
                    id="description"
                    name="description" 
                    rows={4}
                    className="mt-1 w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                    value={form.description} 
                    onChange={handleChange} 
                    placeholder="Describe your product..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Display */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Pricing & Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div>
                   <Label htmlFor="currency" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                     Currency
                   </Label>
                   <select 
                     id="currency"
                     name="currency" 
                     className="mt-1 h-12 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent" 
                     value={form.currency} 
                     onChange={handleChange}
                   >
                     <option value="₺">Turkish Lira (₺)</option>
                     <option value="$">US Dollar ($)</option>
                     <option value="€">Euro (€)</option>
                     <option value="£">British Pound (£)</option>
                   </select>
                 </div>
                
                <div>
                  <Label htmlFor="price" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Price
                  </Label>
                  <Input 
                    id="price"
                    name="price" 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="mt-1 h-12 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" 
                    value={form.price} 
                    onChange={handleChange} 
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <Label htmlFor="showPrice" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Show Price
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Display the price on your product page
                    </p>
                  </div>
                                     <Switch 
                     checked={form.showPrice} 
                     onCheckedChange={(checked) => setForm(f => ({ ...f, showPrice: checked }))}
                   />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <Label htmlFor="highlighted" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Highlight Product
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Make this product stand out on your page
                    </p>
                  </div>
                                     <Switch 
                     checked={form.highlighted} 
                     onCheckedChange={(checked) => setForm(f => ({ ...f, highlighted: checked }))}
                   />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                                 <div>
                   <Label htmlFor="mainCategoryId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                     Main Category *
                   </Label>
                   <select 
                     id="mainCategoryId"
                     name="mainCategoryId" 
                     className="mt-1 h-12 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent" 
                     value={form.mainCategoryId} 
                     onChange={handleChange} 
                     required
                   >
                     <option value="">Select main category...</option>
                     {mainCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                   </select>
                 </div>

                                 <div>
                   <Label htmlFor="subCategory1Id" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                     Subcategory 1 (Optional)
                   </Label>
                   <select 
                     id="subCategory1Id"
                     name="subCategory1Id" 
                     className="mt-1 h-12 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50" 
                     value={form.subCategory1Id} 
                     onChange={handleChange} 
                     disabled={!form.mainCategoryId}
                   >
                     <option value="">Select subcategory 1 (optional)...</option>
                     {sub1Categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                   </select>
                 </div>

                                 <div>
                   <Label htmlFor="subCategory2Id" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                     Subcategory 2 (Optional)
                   </Label>
                   <select 
                     id="subCategory2Id"
                     name="subCategory2Id" 
                     className="mt-1 h-12 border border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50" 
                     value={form.subCategory2Id} 
                     onChange={handleChange} 
                     disabled={!form.subCategory1Id}
                   >
                     <option value="">Select subcategory 2 (optional)...</option>
                     {sub2Categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                   </select>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Upload Images
                </Label>
                <div className="mt-2">
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg hover:border-primary transition-colors">
                    <div className="space-y-2 text-center">
                      <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-slate-600 dark:text-slate-400">
                        <label htmlFor="images" className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                          <span>Upload files</span>
                          <input 
                            id="images"
                            name="images" 
                            type="file" 
                            accept="image/*" 
                            multiple
                            className="sr-only" 
                            onChange={handleChange} 
                            ref={fileInputRef} 
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        PNG, JPG, GIF up to 10MB each. First image will be the main image.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image Preview Gallery */}
              {(form.images.length > 0 || form.imageUrls.length > 0) && (
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
                    Image Preview
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {form.images.map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img 
                          src={URL.createObjectURL(image)} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg border-2 border-slate-200 dark:border-slate-600 group-hover:border-primary transition-colors" 
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                    {form.imageUrls.map((url, index) => (
                      <div key={`url-${index}`} className="relative group aspect-square">
                        <img 
                          src={url} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover rounded-lg border-2 border-slate-200 dark:border-slate-600 group-hover:border-primary transition-colors" 
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Link */}
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Order Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="customLink" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Order Link (Optional)
                </Label>
                <Input 
                  id="customLink"
                  name="customLink" 
                  type="text" 
                  className="mt-1 h-12 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700" 
                  value={form.customLink} 
                  onChange={handleChange} 
                  placeholder="https://wa.me/905551234567 or https://www.yemeksepeti.com/..." 
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Enter any link: WhatsApp, Yemeksepeti, Trendyol, Telegram, Email, or Website
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              type="submit" 
              className="flex-1 h-12 text-base font-medium" 
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving Changes...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 h-12 text-base font-medium" 
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 