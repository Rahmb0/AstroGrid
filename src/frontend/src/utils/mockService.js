// Mock data for development and demo purposes
import { Principal } from '@dfinity/principal';

// Generate a mock principal ID for the current user
let mockPrincipal = null;
try {
  mockPrincipal = Principal.fromText('2vxsx-fae');
} catch (err) {
  console.error('Failed to create mock principal:', err);
}

// Mock time helpers
const currentTimeNs = () => BigInt(Date.now()) * BigInt(1000000); // Current time in nanoseconds
const oneYearNs = BigInt(365 * 24 * 60 * 60 * 1000000000); // 1 year in nanoseconds
const oneDayNs = BigInt(24 * 60 * 60 * 1000000000); // 1 day in nanoseconds

// In-memory storage for demo data
const mockHandles = new Map();
const mockCredentials = new Map();
const REGISTRATION_FEE = 999; // $9.99 in cents

// Initialize with some sample data
const initializeMockData = () => {
  if (mockPrincipal) {
    // Sample handle registration
    const sampleHandle = {
      handle: '@spark-demo',
      owner: mockPrincipal,
      registeredAt: currentTimeNs(),
      expiresAt: currentTimeNs() + oneYearNs,
      renewed: 0
    };
    mockHandles.set('@spark-demo', sampleHandle);
    
    // Sample credential
    const sampleCredential = {
      id: 'cred-abcdef1234567890',
      handle: '@spark-demo',
      owner: mockPrincipal,
      scope: ['read', 'write'],
      issuedAt: currentTimeNs(),
      expiresAt: currentTimeNs() + oneDayNs,
      active: true
    };
    mockCredentials.set('cred-abcdef1234567890', sampleCredential);
  }
};

// Initialize data
initializeMockData();

// Mock Spark Registry API
export const mockSparkRegistry = {
  getRegistrationFee: async () => {
    return REGISTRATION_FEE;
  },
  
  isHandleAvailable: async (handle) => {
    const normalizedHandle = handle.startsWith('@') ? handle : '@' + handle;
    
    // Check if handle exists and is not expired
    if (mockHandles.has(normalizedHandle)) {
      const registration = mockHandles.get(normalizedHandle);
      // If expired, consider it available
      return registration.expiresAt <= currentTimeNs();
    }
    
    return true; // Available if not found
  },
  
  registerHandle: async (handle) => {
    if (!mockPrincipal) {
      return { error: 'Not authenticated' };
    }
    
    const normalizedHandle = handle.startsWith('@') ? handle : '@' + handle;
    
    // Check if handle is valid (only lowercase letters, numbers, and hyphens)
    const handlePattern = /^[a-z0-9-]+$/;
    if (!handlePattern.test(handle)) {
      return { error: 'Invalid handle format. Use only lowercase letters, numbers, and hyphens.' };
    }
    
    // Check if handle is already registered and not expired
    if (mockHandles.has(normalizedHandle)) {
      const existing = mockHandles.get(normalizedHandle);
      if (existing.expiresAt > currentTimeNs()) {
        return { error: 'Handle is already registered and not expired' };
      }
    }
    
    // Register the handle
    const registration = {
      handle: normalizedHandle,
      owner: mockPrincipal,
      registeredAt: currentTimeNs(),
      expiresAt: currentTimeNs() + oneYearNs,
      renewed: 0
    };
    
    mockHandles.set(normalizedHandle, registration);
    return { success: registration };
  },
  
  lookupHandle: async (handle) => {
    const normalizedHandle = handle.startsWith('@') ? handle : '@' + handle;
    
    if (mockHandles.has(normalizedHandle)) {
      return { success: mockHandles.get(normalizedHandle) };
    }
    
    return { notFound: null };
  },
  
  renewHandle: async (handle) => {
    if (!mockPrincipal) {
      return { error: 'Not authenticated' };
    }
    
    const normalizedHandle = handle.startsWith('@') ? handle : '@' + handle;
    
    if (!mockHandles.has(normalizedHandle)) {
      return { error: 'Handle not found' };
    }
    
    const registration = mockHandles.get(normalizedHandle);
    
    // Check ownership
    if (!registration.owner.equals(mockPrincipal)) {
      return { error: 'Only the owner can renew this handle' };
    }
    
    // Renew the registration
    const updated = {
      ...registration,
      expiresAt: BigInt(Math.max(Number(currentTimeNs()), Number(registration.expiresAt))) + oneYearNs,
      renewed: registration.renewed + 1
    };
    
    mockHandles.set(normalizedHandle, updated);
    return { success: updated };
  },
  
  getHandlesByOwner: async (owner) => {
    if (!owner) return [];
    
    const results = [];
    mockHandles.forEach(registration => {
      if (registration.owner.toString() === owner.toString()) {
        results.push(registration);
      }
    });
    
    return results;
  }
};

// Mock Credential Manager API
export const mockCredentialManager = {
  issueCredential: async (request) => {
    if (!mockPrincipal) {
      return { error: 'Not authenticated' };
    }
    
    const { handle, scope, duration } = request;
    const normalizedHandle = handle.startsWith('@') ? handle : '@' + handle;
    
    // Verify handle ownership
    if (!mockHandles.has(normalizedHandle)) {
      return { error: 'Handle not found in registry' };
    }
    
    const registration = mockHandles.get(normalizedHandle);
    
    // Verify ownership
    if (!registration.owner.equals(mockPrincipal)) {
      return { error: 'Only the handle owner can request credentials' };
    }
    
    // Verify handle is not expired
    if (registration.expiresAt <= currentTimeNs()) {
      return { error: 'Handle registration has expired' };
    }
    
    // Calculate expiry time (cap at 30 days)
    const requestedDuration = BigInt(duration) * BigInt(1000000000); // Convert seconds to nanoseconds
    const maxDuration = BigInt(30 * 24 * 60 * 60 * 1000000000); // 30 days in nanoseconds
    const actualDuration = requestedDuration > BigInt(0) && requestedDuration <= maxDuration
      ? requestedDuration
      : oneDayNs;
    
    const expiresAt = currentTimeNs() + actualDuration;
    
    // Generate credential ID
    const credentialId = 'cred-' + Math.random().toString(36).substring(2, 15);
    
    // Create credential
    const credential = {
      id: credentialId,
      handle: normalizedHandle,
      owner: mockPrincipal,
      scope: scope,
      issuedAt: currentTimeNs(),
      expiresAt: expiresAt,
      active: true
    };
    
    mockCredentials.set(credentialId, credential);
    return { success: credential };
  },
  
  verifyCredential: async (credentialId) => {
    if (!mockCredentials.has(credentialId)) {
      return { invalid: 'Credential not found' };
    }
    
    const credential = mockCredentials.get(credentialId);
    
    if (!credential.active) {
      return { invalid: 'Credential has been revoked' };
    }
    
    if (credential.expiresAt <= currentTimeNs()) {
      return { invalid: 'Credential has expired' };
    }
    
    const remainingTime = (credential.expiresAt - currentTimeNs()) / BigInt(1000000000); // Convert to seconds
    return {
      valid: {
        credential: credential,
        remainingTime: remainingTime
      }
    };
  },
  
  revokeCredential: async (credentialId) => {
    if (!mockPrincipal) {
      return false;
    }
    
    if (!mockCredentials.has(credentialId)) {
      return false;
    }
    
    const credential = mockCredentials.get(credentialId);
    
    if (!credential.owner.equals(mockPrincipal)) {
      return false;
    }
    
    const updated = {
      ...credential,
      active: false
    };
    
    mockCredentials.set(credentialId, updated);
    return true;
  },
  
  getCredentialsByOwner: async (owner) => {
    if (!owner) return [];
    
    const results = [];
    mockCredentials.forEach(credential => {
      if (credential.owner.toString() === owner.toString()) {
        results.push(credential);
      }
    });
    
    return results;
  },
  
  getCredentialsByHandle: async (handle) => {
    const normalizedHandle = handle.startsWith('@') ? handle : '@' + handle;
    
    const results = [];
    mockCredentials.forEach(credential => {
      if (credential.handle === normalizedHandle && credential.active) {
        results.push(credential);
      }
    });
    
    return results;
  }
};

// Mock authentication functions
export const mockAuth = {
  login: async () => {
    return { 
      authClient: {
        getIdentity: () => ({
          getPrincipal: () => mockPrincipal
        })
      }, 
      principal: mockPrincipal 
    };
  },
  
  logout: async () => {
    return true;
  },
  
  checkAuth: async () => {
    return { 
      isAuthenticated: true, 
      principal: mockPrincipal 
    };
  }
};