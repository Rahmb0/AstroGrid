export const idlFactory = ({ IDL }) => {
  const Credential = IDL.Record({
    'id' : IDL.Text,
    'scope' : IDL.Vec(IDL.Text),
    'active' : IDL.Bool,
    'owner' : IDL.Principal,
    'handle' : IDL.Text,
    'expiresAt' : IDL.Int,
    'issuedAt' : IDL.Int,
  });
  const CredentialRequest = IDL.Record({
    'scope' : IDL.Vec(IDL.Text),
    'handle' : IDL.Text,
    'duration' : IDL.Int,
  });
  const IssueResult = IDL.Variant({
    'error' : IDL.Text,
    'success' : Credential,
  });
  const VerifyResult = IDL.Variant({
    'invalid' : IDL.Text,
    'valid' : IDL.Record({
      'credential' : Credential,
      'remainingTime' : IDL.Int,
    }),
  });
  return IDL.Service({
    'getCredentialsByHandle' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(Credential)],
        ['query'],
      ),
    'getCredentialsByOwner' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(Credential)],
        ['query'],
      ),
    'issueCredential' : IDL.Func([CredentialRequest], [IssueResult], []),
    'revokeCredential' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'verifyCredential' : IDL.Func([IDL.Text], [VerifyResult], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
