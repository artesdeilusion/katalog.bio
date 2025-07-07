import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select } from "../../components/ui/select";
import { useAuth } from "../_app";
import Link from "next/link";
import { ArrowLeft, Upload, X, Save, Store, Palette, Settings } from "lucide-react";
import Head from "next/head";

const STORE_CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "boutique", label: "Boutique" },
  { value: "real-estate", label: "Real Estate" },
  { value: "car-dealership", label: "Car Dealership" },
  { value: "freelancer", label: "Freelancer" },
  { value: "salon", label: "Salon" },
  { value: "instructor", label: "Instructor" },
  { value: "custom", label: "Custom" },
];

export default function EditShop() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    storeName: "",
    customURL: "",
    phoneNumber: "",
    storeCategory: "",
    isStoreVisible: true,
    storeLogo: null as File | null,
    storeLogoUrl: "",
    showActionButton: true,
    actionButtonTitle: "",
    actionButtonLink: "",
    actionButtonColor: "#000000",
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
      const fetchUser = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setForm({
            storeName: data.storeName || data.displayName || "",
            customURL: data.customURL || "",
            phoneNumber: data.phoneNumber || "",
            storeCategory: data.storeCategory || "",
            isStoreVisible: data.isStoreVisible !== false, // Default to true
            storeLogo: null,
            storeLogoUrl: data.storeLogoUrl || "",
            showActionButton: data.showActionButton !== false, // Default to true
            actionButtonTitle: data.actionButtonTitle || "",
            actionButtonLink: data.actionButtonLink || "",
            actionButtonColor: data.actionButtonColor || "#000000",
          });
        }
      };
      fetchUser();
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked, files } = e.target as any;
    
    if (type === "checkbox") {
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      setForm(f => ({ ...f, storeLogo: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!form.storeName.trim()) {
      setError("Store name is required.");
      return;
    }
    
    if (!form.customURL.trim()) {
      setError("Custom URL is required.");
      return;
    }
    
    if (!form.storeCategory) {
      setError("Please select a store category.");
      return;
    }
    
    setSubmitting(true);
    let storeLogoUrl = form.storeLogoUrl;
    
    try {
      // Upload logo if selected
      if (form.storeLogo) {
        const storageRef = ref(storage, `store-logos/${user!.uid}/${Date.now()}_${form.storeLogo.name}`);
        await uploadBytes(storageRef, form.storeLogo);
        storeLogoUrl = await getDownloadURL(storageRef);
      }
      
      await updateDoc(doc(db, "users", user!.uid), {
        storeName: form.storeName,
        displayName: form.storeName, // Keep for backward compatibility
        customURL: form.customURL,
        phoneNumber: form.phoneNumber,
        storeCategory: form.storeCategory,
        isStoreVisible: form.isStoreVisible,
        storeLogoUrl,
        showActionButton: form.showActionButton,
        actionButtonTitle: form.actionButtonTitle,
        actionButtonLink: form.actionButtonLink,
        actionButtonColor: form.actionButtonColor,
        updatedAt: new Date(),
      });
      
      setSuccess("Store information updated successfully!");
      setForm(f => ({ ...f, storeLogoUrl }));
    } catch (err: any) {
      setError(err.message || "Error updating store information.");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Mağaza Düzenle - katalog.bio</title>
        <meta name="description" content="Mağaza bilgilerinizi düzenleyin" />
      </Head>
      {/* App Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                Edit Store Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-gray-900">Store Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Store Visibility */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Visibility</h3>
              <div className={`p-4 rounded-lg border-2 transition-colors ${
                form.isStoreVisible 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3">
                  <input
                    name="isStoreVisible"
                    type="checkbox"
                    checked={form.isStoreVisible}
                    onChange={handleChange}
                    id="isStoreVisible"
                    className="w-5 h-5"
                  />
                  <div className="flex-1">
                    <Label htmlFor="isStoreVisible" className="text-foreground font-medium text-base">
                      {form.isStoreVisible ? 'Store is Public' : 'Store is Private'}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {form.isStoreVisible 
                        ? 'Your store is visible to customers and can be accessed via your custom URL.'
                        : 'Your store is private and not visible to customers. Only you can access it.'
                      }
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${form.isStoreVisible ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                {form.customURL && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-sm text-muted-foreground">
                      Store URL: <span className="font-mono text-foreground">katalog.bio/{form.customURL}</span>
                    </p>
                    {form.isStoreVisible && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/${form.customURL}`, "_blank")}
                        className="mt-2 text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Store
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Store Name */}
            <div className="grid gap-3">
              <Label htmlFor="storeName" className="text-foreground font-medium">
                Store Name *
              </Label>
              <Input
                id="storeName"
                name="storeName"
                type="text"
                value={form.storeName}
                onChange={handleChange}
                placeholder="Enter your store name"
                className="border-border bg-background text-foreground"
                required
              />
            </div>

            {/* Store Logo */}
            <div className="grid gap-3">
              <Label className="text-foreground font-medium">Store Logo</Label>
              {(form.storeLogoUrl || form.storeLogo) && (
                <div className="mb-2">
                  <img 
                    src={form.storeLogo ? URL.createObjectURL(form.storeLogo) : form.storeLogoUrl} 
                    alt="Store Logo" 
                    className="w-20 h-20 object-cover rounded-lg border border-border" 
                  />
                </div>
              )}
              <Input
                name="storeLogo"
                type="file"
                accept="image/*"
                onChange={handleChange}
                ref={fileInputRef}
                className="border-border bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Recommended size: 200x200px. Max file size: 2MB.
              </p>
            </div>

            {/* Custom URL */}
            <div className="grid gap-3">
              <Label htmlFor="customURL" className="text-foreground font-medium">
                Custom URL *
              </Label>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">katalog.bio/</span>
                <Input
                  id="customURL"
                  name="customURL"
                  type="text"
                  value={form.customURL}
                  onChange={handleChange}
                  placeholder="your-store-name"
                  className="flex-1 border-border bg-background text-foreground"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Only lowercase letters, numbers, dots, and underscores allowed.
              </p>
            </div>

            {/* Store Category */}
            <div className="grid gap-3">
              <Label htmlFor="storeCategory" className="text-foreground font-medium">
                Store Category *
              </Label>
              <select
                id="storeCategory"
                name="storeCategory"
                value={form.storeCategory}
                onChange={handleChange}
                className="input input-bordered border-border bg-background text-foreground"
                required
              >
                <option value="">Select a category...</option>
                {STORE_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number */}
            <div className="grid gap-3">
              <Label htmlFor="phoneNumber" className="text-foreground font-medium">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="+90 555 123 4567"
                className="border-border bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                This will be used for WhatsApp orders and customer contact.
              </p>
            </div>

            {/* Action Button Settings */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Action Button</h3>
              
              {/* Show Action Button Toggle */}
              <div className="mb-4">
                <div className={`p-4 rounded-lg border-2 transition-colors ${
                  form.showActionButton 
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      name="showActionButton"
                      type="checkbox"
                      checked={form.showActionButton}
                      onChange={handleChange}
                      id="showActionButton"
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <Label htmlFor="showActionButton" className="text-foreground font-medium text-base">
                        {form.showActionButton ? 'Action Button is Enabled' : 'Action Button is Disabled'}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {form.showActionButton 
                          ? 'The action button will be visible on your store navigation bar.'
                          : 'The action button will be hidden from your store navigation bar.'
                        }
                      </p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${form.showActionButton ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                  </div>
                </div>
              </div>
              
              {form.showActionButton && (
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="actionButtonTitle" className="text-foreground font-medium">
                    Button Title
                  </Label>
                  <Input
                    id="actionButtonTitle"
                    name="actionButtonTitle"
                    type="text"
                    value={form.actionButtonTitle}
                    onChange={handleChange}
                    placeholder="e.g., Order Now, Contact Us, Book Appointment"
                    className="border-border bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    This button will appear on your store's navigation bar.
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="actionButtonLink" className="text-foreground font-medium">
                    Button Link
                  </Label>
                  <Input
                    id="actionButtonLink"
                    name="actionButtonLink"
                    type="text"
                    value={form.actionButtonLink}
                    onChange={handleChange}
                    placeholder="https://wa.me/905551234567 or https://example.com"
                    className="border-border bg-background text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter any link: WhatsApp, website, email, etc.
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="actionButtonColor" className="text-foreground font-medium">
                    Button Color
                  </Label>
                  <div className="flex items-center gap-3">
                    <input
                      id="actionButtonColor"
                      name="actionButtonColor"
                      type="color"
                      value={form.actionButtonColor}
                      onChange={handleChange}
                      className="w-12 h-10 border border-border rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={form.actionButtonColor}
                      onChange={(e) => setForm(f => ({ ...f, actionButtonColor: e.target.value }))}
                      className="flex-1 border-border bg-background text-foreground"
                      placeholder="#000000"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose the color for your action button.
                  </p>
                </div>

                {/* Preview */}
                {form.actionButtonTitle && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full text-white font-medium"
                      style={{ backgroundColor: form.actionButtonColor }}
                    >
                      {form.actionButtonTitle}
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
} 