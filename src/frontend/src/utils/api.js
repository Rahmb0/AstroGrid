import { HttpAgent } from '@dfinity/agent';
import { createActor as createSparkRegistryActor } from '../../../declarations/spark_registry';
import { createActor as createCredentialManagerActor } from '../../../declarations/credential_manager';

// Create and configure an agent
export const createAgent = (identity) => {
  const agent = new HttpAgent({ identity });
  
  // When in development, fetch the root key
  if (process.env.NODE_ENV !== 'production') {
    agent.fetchRootKey().catch(err => {
      console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      console.error(err);
    });
  }
  
  return agent;
};

// Create spark registry actor
export const getSparkRegistryActor = (identity) => {
  const agent = createAgent(identity);
  return createSparkRegistryActor(process.env.SPARK_REGISTRY_CANISTER_ID, {
    agent,
  });
};

// Create credential manager actor
export const getCredentialManagerActor = (identity) => {
  const agent = createAgent(identity);
  return createCredentialManagerActor(process.env.CREDENTIAL_MANAGER_CANISTER_ID, {
    agent,
  });
};

// Format timestamp (convert nanoseconds to readable date)
export const formatDate = (nanoseconds) => {
  const milliseconds = Number(nanoseconds) / 1000000;
  return new Date(milliseconds).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate days remaining until expiration
export const getDaysRemaining = (expiresAt) => {
  const now = Date.now() * 1000000; // Current time in nanoseconds
  const diff = Number(expiresAt) - now;
  return Math.max(0, Math.floor(diff / (1000000 * 86400000))); // Convert to days
};

// Format principal for display
export const formatPrincipal = (principal) => {
  if (!principal) return '';
  const principalText = principal.toString();
  if (principalText.length <= 10) return principalText;
  
  return `${principalText.slice(0, 5)}...${principalText.slice(-5)}`;
};
