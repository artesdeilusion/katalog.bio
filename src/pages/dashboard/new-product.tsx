import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { ArrowLeft, Plus, Upload, X, Image as ImageIcon, Link, Tag, DollarSign, Star, Folder } from "lucide-react";
import Head from "next/head";

interface Category {
  id: string;
  name: string;
  type: "main" | "sub1" | "sub2";
  parentId?: string;
}

export default function NewProduct() {
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
  const router = useRouter();
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
    if (user) {
      const fetchCategories = async () => {
        const catQ = query(collection(db, "categories"), where("userId", "==", user.uid));
        const catSnap = await getDocs(catQ);
        setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      };
      fetchCategories();
    }
  }, [user]);

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
      // Reset subcategories if parent changes
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
    let imageUrls: string[] = [];
    try {
      // Upload all images
      if (form.images.length > 0) {
        const uploadPromises = form.images.map(async (image, index) => {
          const storageRef = ref(storage, `products/${user!.uid}/${Date.now()}_${index}_${image.name}`);
          await uploadBytes(storageRef, image);
          return await getDownloadURL(storageRef);
        });
        imageUrls = await Promise.all(uploadPromises);
      }
      
      await addDoc(collection(db, "products"), {
        userId: user!.uid,
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
        createdAt: serverTimestamp(),
      });
      setSuccess("Product added successfully!");
      setForm({
        name: "",
        description: "",
        currency: "₺",
        price: "",
        showPrice: false,
        highlighted: false,
        mainCategoryId: "",
        subCategory1Id: "",
        subCategory2Id: "",
        images: [],
        imageUrls: [],
        customLink: "",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Error adding product.");
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Head>
        <title>Yeni Ürün Ekle - katalog.bio</title>
        <meta name="description" content="Kataloğunuza yeni ürün ekleyin" />
      </Head>
      {/* App Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Add New Product
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden">
          <CardHeader className="  border-b">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                  Product Information
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Fill in the details below to add your new product
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Basic Information</span>
                </h3>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Product Name *
                    </Label>
                    <Input 
                      id="name"
                      name="name" 
                      type="text" 
                      placeholder="Enter product name"
                      value={form.name} 
                      onChange={handleChange} 
                      required 
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Description
                    </Label>
                    <textarea 
                      id="description"
                      name="description" 
                      placeholder="Describe your product..."
                      value={form.description} 
                      onChange={handleChange} 
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Pricing</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Currency
                    </Label>
                    <Select
                      id="currency"
                      name="currency" 
                      value={form.currency} 
                      onChange={handleChange}
                    >
                      <option value="₺">Turkish Lira (₺)</option>
                      <option value="$">US Dollar ($)</option>
                      <option value="€">Euro (€)</option>
                      <option value="£">British Pound (£)</option>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Price
                    </Label>
                    <Input 
                      id="price"
                      name="price" 
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.price} 
                      onChange={handleChange} 
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Display Options
                    </Label>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showPrice" className="text-sm text-slate-600 dark:text-slate-400">
                          Show Price
                        </Label>
                        <Switch
                          checked={form.showPrice}
                          onCheckedChange={(checked) => setForm(f => ({ ...f, showPrice: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="highlighted" className="text-sm text-slate-600 dark:text-slate-400">
                          Highlight Product
                        </Label>
                        <Switch
                          checked={form.highlighted}
                          onCheckedChange={(checked) => setForm(f => ({ ...f, highlighted: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span>Categories</span>
                </h3>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mainCategoryId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Main Category *
                    </Label>
                    <Select
                      id="mainCategoryId"
                      name="mainCategoryId" 
                      value={form.mainCategoryId} 
                      onChange={handleChange} 
                      required
                    >
                      <option value="">Select main category...</option>
                      {mainCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subCategory1Id" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Subcategory 1
                      </Label>
                      <Select
                        id="subCategory1Id"
                        name="subCategory1Id" 
                        value={form.subCategory1Id} 
                        onChange={handleChange} 
                        disabled={!form.mainCategoryId}
                      >
                        <option value="">Select subcategory 1...</option>
                        {sub1Categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subCategory2Id" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Subcategory 2
                      </Label>
                      <Select
                        id="subCategory2Id"
                        name="subCategory2Id" 
                        value={form.subCategory2Id} 
                        onChange={handleChange} 
                        disabled={!form.subCategory1Id}
                      >
                        <option value="">Select subcategory 2...</option>
                        {sub2Categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span>Product Images</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Upload Images
                    </Label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                      <Input 
                        name="images" 
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={handleChange} 
                        ref={fileInputRef} 
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3"
                      >
                        Choose Files
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image Preview Gallery */}
                  {(form.images.length > 0 || form.imageUrls.length > 0) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {form.images.map((image, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-full object-cover rounded-lg border border-slate-200 dark:border-slate-700" 
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
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
                            className="w-full h-full object-cover rounded-lg border border-slate-200 dark:border-slate-700" 
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Link */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Link className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Order Link</span>
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="customLink" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Order Link (Optional)
                  </Label>
                  <Input 
                    id="customLink"
                    name="customLink" 
                    type="text" 
                    placeholder="https://wa.me/905551234567 or https://www.yemeksepeti.com/..." 
                    value={form.customLink} 
                    onChange={handleChange} 
                    className="h-11"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter any link: WhatsApp, Yemeksepeti, Trendyol, Telegram, Email, or Website
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium">{error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button 
                  type="submit" 
                  disabled={submitting} 
                  size="lg"
                  className="px-8"
                >
                  {submitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Adding Product...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Product</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}