export const idlFactory = ({ IDL }) => {
  const HandleRegistration = IDL.Record({
    'handle' : IDL.Text,
    'owner' : IDL.Principal,
    'renewed' : IDL.Nat,
    'expiresAt' : IDL.Int,
    'registeredAt' : IDL.Int,
  });
  const LookupResult = IDL.Variant({
    'notFound' : IDL.Null,
    'success' : HandleRegistration,
  });
  const RegistrationResult = IDL.Variant({
    'error' : IDL.Text,
    'success' : HandleRegistration,
  });
  const RenewalResult = IDL.Variant({
    'error' : IDL.Text,
    'success' : HandleRegistration,
  });
  return IDL.Service({
    'getHandlesByOwner' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(HandleRegistration)],
        ['query'],
      ),
    'getRegistrationFee' : IDL.Func([], [IDL.Nat], ['query']),
    'isHandleAvailable' : IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    'lookupHandle' : IDL.Func([IDL.Text], [LookupResult], ['query']),
    'registerHandle' : IDL.Func([IDL.Text], [RegistrationResult], []),
    'renewHandle' : IDL.Func([IDL.Text], [RenewalResult], []),
    'setOwner' : IDL.Func([IDL.Principal], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
