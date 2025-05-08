import { AuthClient } from '@dfinity/auth-client';

// Login function using Internet Identity
export async function login() {
  try {
    const authClient = await AuthClient.create();
    
    // Start the login process
    await new Promise((resolve, reject) => {
      authClient.login({
        identityProvider: process.env.II_URL || 'https://identity.ic0.app',
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
    
    // Get the identity principal
    const identity = authClient.getIdentity();
    const principal = identity.getPrincipal();
    
    return { authClient, principal };
  } catch (error) {
    console.error('Login error:', error);
    return { authClient: null, principal: null };
  }
}

// Logout function
export async function logout() {
  const authClient = await AuthClient.create();
  await authClient.logout();
  return true;
}

// Check if user is already authenticated
export async function checkAuth() {
  try {
    const authClient = await AuthClient.create();
    const isAuthenticated = await authClient.isAuthenticated();
    
    if (isAuthenticated) {
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();
      return { isAuthenticated, principal };
    }
    
    return { isAuthenticated, principal: null };
  } catch (error) {
    console.error('Auth check error:', error);
    return { isAuthenticated: false, principal: null };
  }
}
