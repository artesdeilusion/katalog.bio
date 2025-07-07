import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged, User, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useAuth } from "./_app";
import Link from "next/link";
import { ArrowLeft, User as UserIcon, Mail, Calendar, Edit, Save, X } from "lucide-react";
import Head from "next/head";

interface UserData {
  storeName?: string;
  storeCategory?: string;
  customURL?: string;
  setupCompleted?: boolean;
  createdAt?: any;
  email?: string;
  displayName?: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
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
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          setEditForm({
            displayName: user.displayName || "",
            email: user.email || "",
          });
        }
      };
      fetchUserData();
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: editForm.displayName,
      });

      // Update Firestore user document
      await updateDoc(doc(db, "users", user.uid), {
        displayName: editForm.displayName,
      });

      setUserData(prev => prev ? { ...prev, displayName: editForm.displayName } : null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Profil güncellenirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      displayName: user?.displayName || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Hesap Ayarları - katalog.bio</title>
        <meta name="description" content="Hesap bilgilerinizi yönetin ve güncelleyin" />
      </Head>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Geri Dön
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hesap</h1>
               </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Profil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback className="text-2xl">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                      <h3 className="font-semibold text-lg">
                        {user?.displayName || "İsimsiz Kullanıcı"}
                      </h3>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Details */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hesap Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Ad Soyad</Label>
                      {isEditing ? (
                        <Input
                          id="displayName"
                          value={editForm.displayName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1 p-3 bg-gray-100 rounded-md">
                          {user?.displayName || "Belirtilmemiş"}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">E-posta</Label>
                      <div className="mt-1 p-3 bg-gray-100 rounded-md flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-600" />
                        {user?.email}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        E-posta adresi değiştirilemez
                      </p>
                    </div>

                    <div>
                      <Label>Hesap Oluşturulma Tarihi</Label>
                      <div className="mt-1 p-3 bg-gray-100 rounded-md flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        {user?.metadata.creationTime ? 
                          new Date(user.metadata.creationTime).toLocaleDateString('tr-TR') : 
                          "Bilinmiyor"
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    {isEditing ? (
                      <>
                        <Button onClick={handleSave} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Kaydediliyor..." : "Kaydet"}
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          <X className="h-4 w-4 mr-2" />
                          İptal
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Düzenle
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Store Information */}
              {userData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Mağaza Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Mağaza Adı</Label>
                      <div className="mt-1 p-3 bg-muted rounded-md">
                        {userData.storeName || "Belirtilmemiş"}
                      </div>
                    </div>
                    <div>
                      <Label>Mağaza Kategorisi</Label>
                      <div className="mt-1 p-3 bg-muted rounded-md">
                        {userData.storeCategory || "Belirtilmemiş"}
                      </div>
                    </div>
                    <div>
                      <Label>Özel URL</Label>
                      <div className="mt-1 p-3 bg-muted rounded-md">
                        {userData.customURL ? `katalog.bio/${userData.customURL}` : "Belirtilmemiş"}
                      </div>
                    </div>
                    <Link href="/dashboard/edit-shop">
                      <Button variant="outline" className="w-full">
                        Mağaza Ayarlarını Düzenle
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
 
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 