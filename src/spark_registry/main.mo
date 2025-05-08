import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor SparkRegistry {
    // Types
    public type HandleRegistration = {
        handle: Text;
        owner: Principal;
        registeredAt: Int;
        expiresAt: Int;
        renewed: Nat;
    };

    public type RegistrationResult = {
        #success: HandleRegistration;
        #error: Text;
    };

    public type LookupResult = {
        #success: HandleRegistration;
        #notFound;
    };

    public type RenewalResult = {
        #success: HandleRegistration;
        #error: Text;
    };

    // Constants
    let REGISTRATION_PERIOD_NS : Int = 365 * 24 * 60 * 60 * 1000000000; // 1 year in nanoseconds
    let REGISTRATION_FEE : Nat = 999; // $9.99 equivalent in tokens (cents)
    let MAX_HANDLE_LENGTH : Nat = 20;

    // State
    private stable var registrationsEntries : [(Text, HandleRegistration)] = [];
    private var registrations = HashMap.HashMap<Text, HandleRegistration>(0, Text.equal, Text.hash);

    // Initialize from stable storage
    system func preupgrade() {
        registrationsEntries := Iter.toArray(registrations.entries());
    };

    system func postupgrade() {
        registrations := HashMap.fromIter<Text, HandleRegistration>(
            registrationsEntries.vals(),
            registrationsEntries.size(),
            Text.equal,
            Text.hash
        );
        registrationsEntries := [];
    };

    // Helper functions
    private func validateHandle(handle: Text) : Bool {
        if (handle.size() == 0 or handle.size() > MAX_HANDLE_LENGTH) {
            return false;
        };

        // Validate that handle only contains lowercase letters, numbers, and hyphens
        for (char in handle.chars()) {
            if (not ((char >= 'a' and char <= 'z') or 
                    (char >= '0' and char <= '9') or 
                    char == '-')) {
                return false;
            };
        };
        true
    };

    private func normalizeHandle(handle: Text) : Text {
        "@" # handle
    };

    // Main functions
    public shared(msg) func registerHandle(handle: Text) : async RegistrationResult {
        let caller = msg.caller;

        // Check if caller is anonymous
        if (Principal.isAnonymous(caller)) {
            return #error("Anonymous principal not allowed to register handles");
        };

        // Validate handle format
        if (not validateHandle(handle)) {
            return #error("Invalid handle format. Handles must be 1-20 characters and only contain lowercase letters, numbers, and hyphens");
        };

        let normalizedHandle = normalizeHandle(handle);

        // Check if handle is already registered
        switch (registrations.get(normalizedHandle)) {
            case (?existing) {
                // Check if it's expired
                let currentTime = Time.now();
                if (existing.expiresAt > currentTime) {
                    return #error("Handle is already registered and not expired");
                };
                // If expired, allow re-registration
            };
            case null { /* Handle is available */ };
        };

        // Process payment (mock for now)
        // In a real implementation, this would verify a payment transaction
        
        // Register the handle
        let currentTime = Time.now();
        let registration : HandleRegistration = {
            handle = normalizedHandle;
            owner = caller;
            registeredAt = currentTime;
            expiresAt = currentTime + REGISTRATION_PERIOD_NS;
            renewed = 0;
        };
        
        registrations.put(normalizedHandle, registration);
        #success(registration)
    };

    public query func lookupHandle(handle: Text) : async LookupResult {
        let normalizedHandle = normalizeHandle(handle);
        
        switch (registrations.get(normalizedHandle)) {
            case (?registration) {
                return #success(registration);
            };
            case null {
                return #notFound;
            };
        };
    };

    public shared(msg) func renewHandle(handle: Text) : async RenewalResult {
        let caller = msg.caller;
        let normalizedHandle = normalizeHandle(handle);
        
        switch (registrations.get(normalizedHandle)) {
            case (?registration) {
                // Check ownership
                if (registration.owner != caller) {
                    return #error("Only the owner can renew this handle");
                };
                
                // Process payment (mock for now)
                // In a real implementation, this would verify a payment transaction
                
                // Renew the registration
                let currentTime = Time.now();
                let newExpiry = Int.max(currentTime, registration.expiresAt) + REGISTRATION_PERIOD_NS;
                
                let updatedRegistration : HandleRegistration = {
                    handle = registration.handle;
                    owner = registration.owner;
                    registeredAt = registration.registeredAt;
                    expiresAt = newExpiry;
                    renewed = registration.renewed + 1;
                };
                
                registrations.put(normalizedHandle, updatedRegistration);
                #success(updatedRegistration)
            };
            case null {
                #error("Handle not found")
            };
        };
    };

    public query func getHandlesByOwner(owner: Principal) : async [HandleRegistration] {
        let results = Buffer.Buffer<HandleRegistration>(0);
        
        for ((_, registration) in registrations.entries()) {
            if (registration.owner == owner) {
                results.add(registration);
            };
        };
        
        Buffer.toArray(results)
    };

    public query func isHandleAvailable(handle: Text) : async Bool {
        let normalizedHandle = normalizeHandle(handle);
        
        switch (registrations.get(normalizedHandle)) {
            case (?registration) {
                // Check if it's expired
                let currentTime = Time.now();
                if (registration.expiresAt <= currentTime) {
                    return true; // Expired handles are available
                };
                return false; // Not expired, so not available
            };
            case null {
                return true; // Handle not registered, so available
            };
        };
    };
    
    // Admin functionality for future expansion
    stable var owner : Principal = Principal.fromText("2vxsx-fae"); // Default to anonymous principal

    public shared(msg) func setOwner(newOwner: Principal) : async Bool {
        if (msg.caller == owner) {
            owner := newOwner;
            true
        } else {
            false
        };
    };

    public query func getRegistrationFee() : async Nat {
        REGISTRATION_FEE
    };
}
