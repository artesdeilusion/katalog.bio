import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function isCustomURLAvailable(slug: string) {
  const q = query(collection(db, "users"), where("customURL", "==", slug));
  const snapshot = await getDocs(q);
  return snapshot.empty;
} 