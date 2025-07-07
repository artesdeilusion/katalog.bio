import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../pages/_app";
import { useRouter } from "next/router";
import { isCustomURLAvailable } from "../utils/validateURL";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface CustomURLDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CustomURLDialog({ open, onClose }: CustomURLDialogProps) {
  const [customURL, setCustomURL] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customURL.trim()) {
      setError("Custom URL is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if URL is available
      const available = await isCustomURLAvailable(customURL);
      if (!available) {
        setError("This custom URL is already taken. Please choose another one.");
        setLoading(false);
        return;
      }

      // Update user document
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          customURL: customURL.trim().toLowerCase(),
        });
        
        // Close dialog and refresh page to update the UI
        onClose();
        router.reload();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "An error occurred while saving your custom URL");
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]" onEscapeKeyDown={() => {}} onInteractOutside={() => {}}>
      <DialogHeader>
  <DialogTitle>Set Your Custom URL</DialogTitle>
  <DialogDescription>
    You need to set a custom URL for your store. This will be used to access your store at <strong>katalog.bio/your-custom-url</strong>
  </DialogDescription>
 </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customURL">Custom URL</Label>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">katalog.bio/</span>
                <Input
                  id="customURL"
                  value={customURL}
                  onChange={e => {
                    const value = e.target.value.toLowerCase();
                  
                    // Only allow lowercase letters, numbers, dots, and underscores
                    const allowedChars = /^[a-z0-9._]*$/.test(value);
                  
                    // Disallow consecutive dots (..) but allow single dots
                    const noConsecutiveDots = !/\.{2,}/.test(value);
                  
                    // Allow up to 3 underscores in a row
                    const validUnderscores = !/_{4,}/.test(value);
                  
                    // Only check edge rules if the value is longer than 1 character
                    const noEdgeDots = value.length <= 1 || !/^[._]|[._]$/.test(value);
     
                    if (allowedChars && noConsecutiveDots && validUnderscores && noEdgeDots) {
                      setCustomURL(value);
                    }
                  }}
                  placeholder="your-store-name"
                  className="flex-1"
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <p className="text-xs text-muted-foreground">
                Only lowercase letters, numbers, and hyphens are allowed
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !customURL.trim()}>
              {loading ? "Saving..." : "Save Custom URL"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 