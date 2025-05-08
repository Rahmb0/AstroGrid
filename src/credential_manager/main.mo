import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Random "mo:base/Random";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor CredentialManager {
    // Types
    public type Credential = {
        id: Text;
        handle: Text;
        owner: Principal;
        scope: [Text];
        issuedAt: Int;
        expiresAt: Int;
        active: Bool;
    };

    public type CredentialRequest = {
        handle: Text;
        scope: [Text];
        duration: Int; // Duration in seconds
    };

    public type IssueResult = {
        #success: Credential;
        #error: Text;
    };

    public type VerifyResult = {
        #valid: {
            credential: Credential;
            remainingTime: Int;
        };
        #invalid: Text;
    };

    // Constants
    let MAX_CREDENTIAL_DURATION_NS : Int = 30 * 24 * 60 * 60 * 1000000000; // 30 days in nanoseconds
    let DEFAULT_CREDENTIAL_DURATION_NS : Int = 24 * 60 * 60 * 1000000000; // 1 day in nanoseconds

    // State
    private stable var credentialsEntries : [(Text, Credential)] = [];
    private var credentials = HashMap.HashMap<Text, Credential>(0, Text.equal, Text.hash);

    // Stable storage management
    system func preupgrade() {
        credentialsEntries := Iter.toArray(credentials.entries());
    };

    system func postupgrade() {
        credentials := HashMap.fromIter<Text, Credential>(
            credentialsEntries.vals(),
            credentialsEntries.size(),
            Text.equal,
            Text.hash
        );
        credentialsEntries := [];
    };

    // Helper Functions
    private func generateCredentialId() : async Text {
        let randomBytes = await Random.blob();
        let hexString = Text.join("", Iter.map<Nat8, Text>(
            randomBytes.vals(),
            func (byte : Nat8) : Text {
                let hex = "0123456789abcdef";
                let high = Nat32.toNat(Nat32.fromNat(Nat8.toNat(byte)) / 16);
                let low = Nat32.toNat(Nat32.fromNat(Nat8.toNat(byte)) % 16);
                Text.fromChar(Text.charAt(hex, high)) # Text.fromChar(Text.charAt(hex, low))
            }
        ));
        return "cred-" # Text.subText(hexString, 0, 16);
    };

    // External canister type for spark_registry
    type RegistryActor = actor {
        lookupHandle : (Text) -> async {
            #success : {
                handle : Text;
                owner : Principal;
                registeredAt : Int;
                expiresAt : Int;
                renewed : Nat;
            };
            #notFound;
        };
    };

    // Main Functions
    public shared(msg) func issueCredential(request: CredentialRequest) : async IssueResult {
        let caller = msg.caller;
        
        // Verify handle ownership by querying the registry canister
        let registryCanister : RegistryActor = actor("rrkah-fqaaa-aaaaa-aaaaq-cai"); // Replace with actual canister ID
        
        let lookupResult = await registryCanister.lookupHandle(request.handle);
        
        switch (lookupResult) {
            case (#notFound) {
                return #error("Handle not found in registry");
            };
            case (#success(registration)) {
                // Verify caller is the owner
                if (registration.owner != caller) {
                    return #error("Only the handle owner can request credentials");
                };
                
                // Verify handle is not expired
                let currentTime = Time.now();
                if (registration.expiresAt <= currentTime) {
                    return #error("Handle registration has expired");
                };
                
                // Calculate expiry time (cap at maximum allowed duration)
                let requestedDuration = request.duration * 1000000000; // Convert seconds to nanoseconds
                let duration = if (requestedDuration > 0 and requestedDuration <= MAX_CREDENTIAL_DURATION_NS) {
                    requestedDuration;
                } else {
                    DEFAULT_CREDENTIAL_DURATION_NS;
                };
                
                let expiresAt = currentTime + duration;
                
                // Generate credential ID
                let credentialId = await generateCredentialId();
                
                // Create and store the credential
                let newCredential : Credential = {
                    id = credentialId;
                    handle = request.handle;
                    owner = caller;
                    scope = request.scope;
                    issuedAt = currentTime;
                    expiresAt = expiresAt;
                    active = true;
                };
                
                credentials.put(credentialId, newCredential);
                #success(newCredential)
            };
        };
    };

    public query func verifyCredential(credentialId: Text) : async VerifyResult {
        switch (credentials.get(credentialId)) {
            case (null) {
                #invalid("Credential not found");
            };
            case (?credential) {
                let currentTime = Time.now();
                
                if (not credential.active) {
                    return #invalid("Credential has been revoked");
                };
                
                if (credential.expiresAt <= currentTime) {
                    return #invalid("Credential has expired");
                };
                
                let remainingTime = (credential.expiresAt - currentTime) / 1000000000; // Convert to seconds
                #valid({
                    credential = credential;
                    remainingTime = remainingTime;
                });
            };
        };
    };

    public shared(msg) func revokeCredential(credentialId: Text) : async Bool {
        let caller = msg.caller;
        
        switch (credentials.get(credentialId)) {
            case (null) {
                return false;
            };
            case (?credential) {
                if (credential.owner != caller) {
                    return false;
                };
                
                let updatedCredential : Credential = {
                    id = credential.id;
                    handle = credential.handle;
                    owner = credential.owner;
                    scope = credential.scope;
                    issuedAt = credential.issuedAt;
                    expiresAt = credential.expiresAt;
                    active = false;
                };
                
                credentials.put(credentialId, updatedCredential);
                true
            };
        };
    };

    public query func getCredentialsByOwner(owner: Principal) : async [Credential] {
        let results = Buffer.Buffer<Credential>(0);
        
        for ((_, credential) in credentials.entries()) {
            if (credential.owner == owner) {
                results.add(credential);
            };
        };
        
        Buffer.toArray(results)
    };

    public query func getCredentialsByHandle(handle: Text) : async [Credential] {
        let results = Buffer.Buffer<Credential>(0);
        
        for ((_, credential) in credentials.entries()) {
            if (credential.handle == handle and credential.active) {
                results.add(credential);
            };
        };
        
        Buffer.toArray(results)
    };
}
