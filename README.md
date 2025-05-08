# AstroGrid - Secure Protocol for Agentic Registry and Communication

AstroGrid is a decentralized application running on the Internet Computer blockchain that provides agent naming registration and credential management services for secure agent-to-agent communication.

## Overview

The project consists of two canisters (backend services):

1. **astrogrid_registry**: Handles the registration, renewal, and management of agent names/handles
2. **credential_manager**: Issues temporary or scoped credentials for agent interactions

The application also includes a React + Tailwind CSS frontend for a user-friendly interface.

## Features

- Register unique agent names with a paid registration system
- Expiration and renewal mechanism for registered names
- Principal ID verification for ownership
- Credential issuance tied to registered handles
- Simple frontend interface for all operations
- Support for potentially trillions of agents in the naming structure

## Architecture

![Architecture Diagram](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW1VzZXJdIC0tPnxJbnRlcmFjdHMgd2l0aHwgQihGcm9udGVuZClcbiAgICBCIC0tPnxDYWxscyB0b3wgQyhBc3Ryb0dyaWQgUmVnaXN0cnkpXG4gICAgQiAtLT58Q2FsbHMgdG98IEQoQ3JlZGVudGlhbCBNYW5hZ2VyKVxuICAgIEMgLS0+fFJlZmVyZW5jZXN8IEQoQ3JlZGVudGlhbCBNYW5hZ2VyKSIsIm1lcm1haWQiOnsidGhlbWUiOiJkZWZhdWx0In0sInVwZGF0ZUVkaXRvciI6ZmFsc2V9)

### astrogrid_registry (Canister)

- Manages the registration of agent names (@handles)
- Validates uniqueness of handles
- Stores expiration timestamps (1 year from registration)
- Verifies ownership through principal IDs
- Provides lookup and renewal endpoints
- Handles registration fees (fixed at $9.99/year)

### credential_manager (Canister)

- Issues temporary or scoped credentials
- Ties credentials to registered agent names
- Verifies credential validity
- Enables revocation of active credentials
- Supports various credential scopes and durations

### Frontend (React + Tailwind)

- User authentication via Internet Identity
- Registration form for handles
- Handle status display and renewals
- Credential request and management interface
- Responsive design for all devices

## Setup & Installation

### Prerequisites

- [DFX SDK](https://smartcontracts.org/docs/quickstart/local-quickstart.html) installed
- Node.js and npm

### Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd astrogrid
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local Internet Computer replica:
   ```bash
   dfx start --background
   ```

4. Deploy the canisters locally:
   ```bash
   dfx deploy
   ```

5. Open the frontend in your browser at the URL displayed in the terminal.

### Deployment to the Internet Computer Mainnet

1. Ensure you have sufficient cycles for deployment:
   ```bash
   dfx wallet balance
   ```

2. Deploy to the mainnet:
   ```bash
   dfx deploy --network ic
   ```

## Usage

### Registering a Handle

1. Login with Internet Identity
2. Navigate to the "Register Handle" tab
3. Enter your desired handle (e.g., "agent007")
4. Complete the registration process (costs $9.99/year in ICP tokens)

### Managing Credentials

1. Login with Internet Identity
2. Navigate to the "Credentials" tab
3. Select a registered handle
4. Specify credential scope and duration
5. Issue the credential
6. Use the credential ID for agent interactions

## Development Guidelines

- Handle validation rules: lowercase letters, numbers, and hyphens only, max 20 chars
- Credentials have a maximum duration of 30 days
- Registration renewals extend expiration by exactly 1 year from the current expiration date

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Developed by Avistar AI for the Internet Computer ecosystem.
