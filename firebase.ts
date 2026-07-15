import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInAnonymously
} from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Dynamic API Key resolution for flexible deployment environments
const dynamicApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY || (import.meta as any).env?.VITE_AUTH_API_KEY || firebaseConfig.apiKey;

const resolvedFirebaseConfig = {
  ...firebaseConfig,
  apiKey: dynamicApiKey
};

// Initialize Firebase App
const app = initializeApp(resolvedFirebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Use Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Support Drive scope for file creation/sharing
googleProvider.addScope("https://www.googleapis.com/auth/drive.file");

// In-memory & LocalStorage access token cache
let cachedAccessToken: string | null = (() => {
  try {
    return localStorage.getItem("google_access_token");
  } catch (e) {
    return null;
  }
})();

onAuthStateChanged(auth, (user) => {
  if (!user) {
    cachedAccessToken = null;
    try {
      localStorage.removeItem("google_access_token");
    } catch (e) {}
  }
});

export const getAccessToken = () => cachedAccessToken;
export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      localStorage.setItem("google_access_token", token);
    } else {
      localStorage.removeItem("google_access_token");
    }
  } catch (e) {}
};

// Initialize Cloud Firestore database with the critical database Id if specified
const config = firebaseConfig as {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId: string;
  firestoreDatabaseId?: string;
};

export const db = config.firestoreDatabaseId 
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, config.firestoreDatabaseId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Mandatory Error Handler for Firestore operations.
 * When permissions fail, we serialize details to JSON so that
 * the AI Studio debugging suite has diagnostic telemetry.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Triggers user Google Sign-In with popup
 */
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      setAccessToken(credential.accessToken);
    }
    return result.user;
  } catch (error) {
    console.error("Authentication popup failed:", error);
    throw error;
  }
}

/**
 * Triggers user sign out
 */
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Signout failed:", error);
    throw error;
  }
}

/**
 * Registers a new user with email and password, and sets their display name.
 */
export async function registerWithEmail(email: string, pass: string, name: string) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    return result.user;
  } catch (error) {
    console.error("Email registration failed:", error);
    throw error;
  }
}

/**
 * Signs in an existing user with email and password.
 */
export async function loginWithEmail(email: string, pass: string) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error("Email login failed:", error);
    throw error;
  }
}

/**
 * Signs in the user anonymously so that Firebase is accessible to all.
 */
export async function loginAnonymously() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Anonymous sign-in failed:", error);
    throw error;
  }
}

