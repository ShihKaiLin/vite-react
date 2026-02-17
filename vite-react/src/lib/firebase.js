import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  increment,
  getDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// Firebase 配置
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// 訂閱物件列表
export function subscribeToProperties(onData, onError) {
  const propertiesRef = collection(db, "properties");
  return onSnapshot(
    propertiesRef,
    (snapshot) => {
      const properties = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onData(properties);
    },
    onError
  );
}

// 新增物件
export async function saveProperty(data) {
  const propertiesRef = collection(db, "properties");
  return await addDoc(propertiesRef, data);
}

// 更新物件
export async function updateProperty(id, data) {
  const propertyRef = doc(db, "properties", id);
  return await updateDoc(propertyRef, data);
}

// 更新物件狀態
export async function updatePropertyStatus(id, status) {
  const propertyRef = doc(db, "properties", id);
  return await updateDoc(propertyRef, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

// 增加瀏覽次數
export async function incrementViewCount(id) {
  const propertyRef = doc(db, "properties", id);
  return await updateDoc(propertyRef, {
    viewCount: increment(1),
  });
}

// 上傳圖片
export async function uploadImage(file) {
  const storageRef = ref(storage, `properties/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}

// 取得單一物件
export async function getPropertyById(id) {
  const propertyRef = doc(db, "properties", id);
  const snapshot = await getDoc(propertyRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
}
