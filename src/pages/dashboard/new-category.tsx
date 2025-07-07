import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "../../components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Folder, FolderOpen, FolderTree } from "lucide-react";
import Head from "next/head";

interface Category {
  id: string;
  name: string;
  type: "main" | "sub1" | "sub2";
  parentId?: string;
}

export default function CategoriesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    type: "main" as "main" | "sub1" | "sub2",
    parentId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (!user) window.location.href = "/login";
    });
    return () => unsubscribe();
  }, []);

  const fetchCategories = async () => {
    if (!user) return;
    const q = query(collection(db, "categories"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
  };

  useEffect(() => { if (user) fetchCategories(); }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editId) {
        await updateDoc(doc(db, "categories", editId), {
          name: form.name,
          type: form.type,
          ...(form.type === "main" ? {} : { parentId: form.parentId }),
        });
      } else {
        await addDoc(collection(db, "categories"), {
          userId: user!.uid,
          name: form.name,
          type: form.type,
          ...(form.type === "main" ? {} : { parentId: form.parentId }),
          createdAt: serverTimestamp(),
        });
      }
      setForm({ name: "", type: "main", parentId: "" });
      setEditId(null);
      setDialogOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Error saving category.");
    }
    setSubmitting(false);
  };

  const handleEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, type: cat.type, parentId: cat.parentId || "" });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this category?")) return;
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  const openAddDialog = () => {
    setEditId(null);
    setForm({ name: "", type: "main", parentId: "" });
    setError("");
    setDialogOpen(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  if (!user) return null;

  // Helper: get children by parentId and type
  const getChildren = (parentId: string, type: "sub1" | "sub2") =>
    categories.filter(c => c.type === type && c.parentId === parentId);

  const mainCategories = categories.filter(c => c.type === "main");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Head>
        <title>Yeni Kategori Ekle - katalog.bio</title>
        <meta name="description" content="Kataloğunuza yeni kategori ekleyin" />
      </Head>
      {/* App Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
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
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-xl font-semibold text-slate-900">
                Category Management
              </h1>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Category</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{editId ? "Edit Category" : "Add New Category"}</DialogTitle>
                  <DialogDescription>
                    {editId ? "Update your category details below." : "Create a new category to organize your products."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Category Type</Label>
                    <Select
                      id="type"
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="main">Main Category</option>
                      <option value="sub1">Subcategory 1</option>
                      <option value="sub2">Subcategory 2</option>
                    </Select>
                  </div>
                  
                  {form.type !== "main" && (
                    <div className="space-y-2">
                      <Label htmlFor="parentId">Parent Category</Label>
                      <Select
                        id="parentId"
                        name="parentId"
                        value={form.parentId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select parent...</option>
                        {form.type === "sub1" && categories.filter(c => c.type === "main").map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                        {form.type === "sub2" && categories.filter(c => c.type === "sub1").map(sub1 => {
                          const main = categories.find(c => c.type === "main" && c.id === sub1.parentId);
                          return (
                            <option key={sub1.id} value={sub1.id}>
                              {main ? `${main.name} > ${sub1.name}` : sub1.name}
                            </option>
                          );
                        })}
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter category name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Saving..." : (editId ? "Update" : "Create")}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mainCategories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FolderTree className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No categories yet
              </h3>
              <p className="text-slate-600 mb-6">
                Get started by creating your first category to organize your products.
              </p>
              <Button onClick={openAddDialog} className="flex items-center space-x-2 mx-auto">
                <Plus className="h-4 w-4" />
                <span>Create First Category</span>
              </Button>
            </CardContent>
          </Card>
        )}
        
        {mainCategories.length > 0 && (
          <div className="grid gap-2">
            {mainCategories.map((main) => (
              <Card key={main.id} className="overflow-hidden">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Folder className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{main.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(main)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(main.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6">
                  {getChildren(main.id, "sub1").map((sub1) => (
                    <div key={sub1.id} className="mb-6 last:mb-0">
                      <div className="flex items-center justify-between mb-3 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FolderOpen className="h-4 w-4 text-slate-600" />
                          <span className="font-medium text-slate-900">
                            {sub1.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(sub1)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(sub1.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {getChildren(sub1.id, "sub2").length > 0 && (
                        <div className="ml-6 space-y-2">
                          {getChildren(sub1.id, "sub2").map((sub2) => (
                            <div key={sub2.id} className="flex items-center justify-between p-2 bg-white rounded border">
                              <span className="text-sm text-slate-700">
                                {sub2.name}
                              </span>
                              <div className="flex items-center space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(sub2)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(sub2.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {getChildren(main.id, "sub1").length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No subcategories yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 