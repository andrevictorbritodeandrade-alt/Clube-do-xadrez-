import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, updateDoc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { FirebaseConfig, DashboardCardData, ClassDataMap, TournamentState } from '../types';

// Hardcoded configuration as requested for permanent cloud connection
const firebaseConfig = {
  apiKey: "AIzaSyD_C_yn_RyBSopY7Tb9aqLW8akkXJR94Vg",
  authDomain: "chaveunica-225e0.firebaseapp.com",
  projectId: "chaveunica-225e0",
  storageBucket: "chaveunica-225e0.firebasestorage.app",
  messagingSenderId: "324211037832",
  appId: "1:324211037832:web:362a46e6446ea37b85b13d",
  measurementId: "G-MRBDJC3QXZ"
};

let db: any = null;
let app: any = null;

// Removed localStorage logic as we are enforcing the specific cloud config
export const getStoredConfig = (): FirebaseConfig | null => {
  return firebaseConfig;
};

export const saveConfig = (config: FirebaseConfig) => {
  // No-op or log warning, as config is now hardcoded
  console.warn("Config is hardcoded, saveConfig ignored.");
};

export const initFirebase = () => {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    db = getFirestore(app);
    const auth = getAuth(app);
    signInAnonymously(auth).catch((err) => console.error("Auth Error:", err));
    return true;
  } catch (e) {
    console.error("Erro ao iniciar Firebase", e);
    return false;
  }
};

// Inicializa cards padrão se não existirem
export const seedDatabase = async () => {
  if (!db) return;
  
  const defaultCards: DashboardCardData[] = [
    { id: 'total_students', title: 'Total de Alunos', value: 124, type: 'number', trend: '+12% este mês', icon: 'users', lastUpdated: Date.now() },
    { id: 'active_classes', title: 'Turmas Ativas', value: 8, type: 'number', trend: '2 manhã / 6 tarde', icon: 'book', lastUpdated: Date.now() },
    { id: 'next_event', title: 'Próximo Torneio', value: '15 Mai - Interescolar', type: 'text', icon: 'trophy', lastUpdated: Date.now() },
    { id: 'club_status', title: 'Status do Clube', value: 'Aberto', type: 'status', icon: 'door', lastUpdated: Date.now() },
  ];

  for (const card of defaultCards) {
    await setDoc(doc(db, 'dashboard', card.id), card, { merge: true });
  }
};

// Listener em tempo real Dashboard
export const subscribeToDashboard = (callback: (data: DashboardCardData[]) => void) => {
  if (!db) {
    callback([]);
    return () => {};
  }

  const unsub = onSnapshot(collection(db, 'dashboard'), (snapshot: any) => {
    const cards: DashboardCardData[] = [];
    snapshot.forEach((doc: any) => {
      cards.push(doc.data() as DashboardCardData);
    });
    cards.sort((a, b) => a.id.localeCompare(b.id));
    callback(cards);
  });

  return unsub;
};

// Atualizar valor Dashboard
export const updateCardValue = async (id: string, value: string | number) => {
  if (!db) return;
  const docRef = doc(db, 'dashboard', id);
  await updateDoc(docRef, {
    value: value,
    lastUpdated: Date.now()
  });
};

// --- REAL-TIME CLASSES SYNC ---

export const subscribeToClasses = (callback: (data: ClassDataMap) => void) => {
  if (!db) return () => {};
  
  return onSnapshot(collection(db, 'classes'), (snapshot: any) => {
    const classes: ClassDataMap = {};
    if (snapshot.empty) {
        // Option: return empty or don't callback to keep initial state?
        // Let's callback empty so app knows it's empty
    }
    snapshot.forEach((doc: any) => {
      classes[doc.id] = doc.data();
    });
    // Prevent callback if empty to avoid wiping initial mock data? 
    // No, "Everything will be saved" means cloud is truth.
    // However, if cloud is empty, we might want to seed it from App.tsx.
    callback(classes);
  });
};

export const saveClassesToFirestore = async (data: ClassDataMap) => {
  if (!db) return;
  const batch = writeBatch(db);
  
  // Save each class as a document
  Object.values(data).forEach((cls) => {
    const ref = doc(db, 'classes', cls.id);
    batch.set(ref, cls);
  });
  
  await batch.commit();
};

// --- REAL-TIME TOURNAMENT SYNC ---

export const subscribeToTournament = (callback: (data: TournamentState | null) => void) => {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'tournaments', 'active'), (doc: any) => {
    if (doc.exists()) {
      callback(doc.data() as TournamentState);
    } else {
      callback(null);
    }
  });
};

export const saveTournamentToFirestore = async (data: TournamentState) => {
  if (!db) return;
  await setDoc(doc(db, 'tournaments', 'active'), data);
};