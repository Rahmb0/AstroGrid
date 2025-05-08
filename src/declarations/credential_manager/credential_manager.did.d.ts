import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Credential {
  'id' : string,
  'scope' : Array<string>,
  'active' : boolean,
  'owner' : Principal,
  'handle' : string,
  'expiresAt' : bigint,
  'issuedAt' : bigint,
}

export interface CredentialRequest {
  'scope' : Array<string>,
  'handle' : string,
  'duration' : bigint,
}

export type IssueResult = { 'error' : string } |
  { 'success' : Credential };

export type VerifyResult = { 'invalid' : string } |
  { 'valid' : { 'credential' : Credential, 'remainingTime' : bigint } };

export interface _SERVICE {
  'getCredentialsByHandle' : ActorMethod<[string], Array<Credential>>,
  'getCredentialsByOwner' : ActorMethod<[Principal], Array<Credential>>,
  'issueCredential' : ActorMethod<[CredentialRequest], IssueResult>,
  'revokeCredential' : ActorMethod<[string], boolean>,
  'verifyCredential' : ActorMethod<[string], VerifyResult>,
}
