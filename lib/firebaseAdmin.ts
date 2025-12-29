/**
 * Firebase Admin SDK Initialization
 * 
 * This module initializes Firebase Admin SDK for server-side operations
 * like password resets and user management.
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

/**
 * Initialize Firebase Admin SDK
 * Returns the Auth instance if successful, null otherwise
 */
export function getAdminAuth(): Auth | null {
  // Return cached instance if already initialized
  if (adminAuth) {
    return adminAuth;
  }

  try {
    // Check if already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      adminApp = existingApps[0];
      adminAuth = getAuth(adminApp);
      return adminAuth;
    }

    // Try to initialize with service account JSON
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccount) {
      try {
        const serviceAccountJson = typeof serviceAccount === "string" 
          ? JSON.parse(serviceAccount) 
          : serviceAccount;
        
        adminApp = initializeApp({
          credential: cert(serviceAccountJson),
        });
        adminAuth = getAuth(adminApp);
        return adminAuth;
      } catch (parseError) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", parseError);
      }
    }

    // Try to initialize with individual environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
      adminAuth = getAuth(adminApp);
      return adminAuth;
    }

    // Try Application Default Credentials (for GCP environments)
    if (projectId) {
      try {
        adminApp = initializeApp({
          projectId,
        });
        adminAuth = getAuth(adminApp);
        return adminAuth;
      } catch (error) {
        console.error("Failed to initialize with Application Default Credentials:", error);
      }
    }

    console.warn(
      "Firebase Admin SDK not configured. " +
      "Set FIREBASE_SERVICE_ACCOUNT, or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY"
    );
    return null;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
}

/**
 * Check if Firebase Admin is configured
 */
export function isAdminConfigured(): boolean {
  return getAdminAuth() !== null;
}

