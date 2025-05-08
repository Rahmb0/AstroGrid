import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface HandleRegistration {
  'handle' : string,
  'owner' : Principal,
  'renewed' : bigint,
  'expiresAt' : bigint,
  'registeredAt' : bigint,
}

export type LookupResult = { 'notFound' : null } |
  { 'success' : HandleRegistration };

export type RegistrationResult = { 'error' : string } |
  { 'success' : HandleRegistration };

export type RenewalResult = { 'error' : string } |
  { 'success' : HandleRegistration };

export interface _SERVICE {
  'getHandlesByOwner' : ActorMethod<[Principal], Array<HandleRegistration>>,
  'getRegistrationFee' : ActorMethod<[], bigint>,
  'isHandleAvailable' : ActorMethod<[string], boolean>,
  'lookupHandle' : ActorMethod<[string], LookupResult>,
  'registerHandle' : ActorMethod<[string], RegistrationResult>,
  'renewHandle' : ActorMethod<[string], RenewalResult>,
  'setOwner' : ActorMethod<[Principal], boolean>,
}
