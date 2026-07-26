import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Auto sign-in anonymously for Firebase Auth session
onAuthStateChanged(auth, (user) => {
  if (!user) {
    signInAnonymously(auth).catch((err) => {
      console.warn('Firebase anonymous sign-in error:', err);
    });
  }
});

// Connection test - executed safely without throwing unhandled exceptions
async function testConnection() {
  try {
    // Wait for auth to settle
    await auth.authStateReady();
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Gracefully handle offline or initial connection establishment without clogging logs
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('unavailable') || msg.includes('offline') || msg.includes('operation could not be completed')) {
      console.info('Firebase operating in resilient cache/offline mode or connecting...');
    } else {
      console.warn('Firebase test connection status:', msg);
    }
  }
}
testConnection();
