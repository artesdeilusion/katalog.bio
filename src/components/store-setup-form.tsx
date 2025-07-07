import { useState, useRef, useEffect } from "react";
import { User } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import { isCustomURLAvailable } from "../utils/validateURL";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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

interface StoreSetupFormProps {
  user: User;
  onComplete: () => void;
}

// Username validation and formatting function
function validateAndFormatUsername(rawValue: string): string | null {
  const value = rawValue.toLowerCase();
  // Only allow lowercase letters, numbers, dots, and underscores
  const allowedChars = /^[a-z0-9._]*$/.test(value);
  // Disallow consecutive dots (..) but allow single dots
  const noConsecutiveDots = !/\.{2,}/.test(value);
  // Allow up to 3 underscores in a row
  const validUnderscores = !/_{4,}/.test(value);
  // Only check edge rules if the value is longer than 1 character
  const noEdgeDots = value.length <= 1 || !/^[._]$/.test(value);
  if (allowedChars && noConsecutiveDots && validUnderscores && noEdgeDots) {
    return value;
  }
  return null;
}

export function StoreSetupForm({ user, onComplete }: StoreSetupFormProps) {
  const [form, setForm] = useState({
    storeName: "",
    customURL: "",
    storeCategory: "",
    phoneNumber: "",
    isStoreVisible: true,
    storeLogo: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [customURLError, setCustomURLError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing custom URL if available
  useEffect(() => {
    const loadExistingData = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setForm(f => ({
          ...f,
          customURL: data.customURL || "",
          storeName: data.storeName || data.displayName || "",
          storeCategory: data.storeCategory || "",
          phoneNumber: data.phoneNumber || "",
          isStoreVisible: data.isStoreVisible !== false,
        }));
      }
    };
    loadExistingData();
  }, [user.uid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement & { files: FileList | null };
    
    if (type === "checkbox") {
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      setForm(f => ({ ...f, storeLogo: files?.[0] || null }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
      
      // Clear custom URL error when user types
      if (name === "customURL") {
        setCustomURLError("");
      }
    }
  };

  const validateCustomURL = async (url: string) => {
    if (!url.trim()) {
      setCustomURLError("Custom URL is required.");
      return false;
    }
    
    const validated = validateAndFormatUsername(url);
    if (!validated) {
      setCustomURLError("Custom URL can only contain lowercase letters, numbers, dots, and underscores.");
      return false;
    }
    
    const available = await isCustomURLAvailable(validated);
    if (!available) {
      setCustomURLError("This custom URL is already taken.");
      return false;
    }
    
    setCustomURLError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!form.storeName.trim()) {
      setError("Store name is required.");
      return;
    }
    
    if (!form.storeCategory) {
      setError("Please select a store category.");
      return;
    }
    
    // Validate custom URL
    const isCustomURLValid = await validateCustomURL(form.customURL);
    if (!isCustomURLValid) {
      return;
    }
    
    setSubmitting(true);
    let storeLogoUrl = "";
    
    try {
      // Upload logo if selected
      if (form.storeLogo) {
        const storageRef = ref(storage, `store-logos/${user.uid}/${Date.now()}_${form.storeLogo.name}`);
        await uploadBytes(storageRef, form.storeLogo);
        storeLogoUrl = await getDownloadURL(storageRef);
      }
      
      await updateDoc(doc(db, "users", user.uid), {
        storeName: form.storeName,
        displayName: form.storeName, // Keep for backward compatibility
        customURL: form.customURL.toLowerCase(),
        storeCategory: form.storeCategory,
        phoneNumber: form.phoneNumber,
        isStoreVisible: form.isStoreVisible,
        storeLogoUrl,
        setupCompleted: true,
        updatedAt: new Date(),
      });
      
      onComplete();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Error saving store information.");
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <Card className="border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-foreground text-2xl">Welcome to katalog.bio! 🎉</CardTitle>
          <p className="text-muted-foreground mt-2">
            Let&apos;s set up your store. This will only take a few minutes.
          </p>
          
          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-sm font-medium text-foreground">Store Info</span>
              </div>
              <div className="w-8 h-1 bg-muted rounded"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-sm font-medium text-muted-foreground">Add Products</span>
              </div>
              <div className="w-8 h-1 bg-muted rounded"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-sm font-medium text-muted-foreground">Go Live</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '33%' }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Step 1 of 3: Store Information</p>
          </div>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
              {customURLError && (
                <p className="text-xs text-red-500">{customURLError}</p>
              )}
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

            {/* Store Logo */}
            <div className="grid gap-3">
              <Label className="text-foreground font-medium">Store Logo (Optional)</Label>
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

            {/* Store Visibility */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <input
                name="isStoreVisible"
                type="checkbox"
                checked={form.isStoreVisible}
                onChange={handleChange}
                id="isStoreVisible"
                className="w-4 h-4"
              />
              <Label htmlFor="isStoreVisible" className="text-foreground font-medium">
                Make my store visible to customers
              </Label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Action Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting}
              size="lg"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-current rounded-full opacity-20"></div>
                    <div className="absolute inset-0 border-2 border-current rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  Setting up your store...
                </div>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 