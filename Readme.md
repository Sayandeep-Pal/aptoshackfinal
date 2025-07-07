## License

This project is proprietary and no part of this codebase may be copied, modified, or distributed without the author's explicit permission.

© 2025 [Sayandeep Pal](https://github.com/Sayandeep-Pal) and [Suryashish Kundu](https://github.com/Suryashish) . All rights reserved.


# RiseIn-Aptos Move Playground

A full-stack project for compiling, deploying, and integrating Aptos Move smart contracts with a React frontend and an Express backend.

---

## Table of Contents

- [Project Structure](#project-structure)
- [System Diagram](#system-diagram)
- [Backend](#backend)
  - [Setup](#setup)
  - [API Routes](#api-routes)
  - [Docker Usage](#docker-usage)
- [Client](#client)
  - [Setup](#setup-1)
- [Smart Contract Upload](#smart-contract-upload)
- [Environment Variables](#environment-variables)
- [Example Transaction](#example-transaction)

---

## Project Structure

```
final-new/
  ├── backend/    # Express server for Move compilation/deployment
  ├── client/     # React frontend for interacting with Aptos
  ├── contract/   # Move contract source code and package
  └── Readme.md
```

---

## System Diagram

You can view the system architecture here:  
[System Diagram (Eraser)](https://app.eraser.io/workspace/OiKbQnUCwNH10rdN77lZ?origin=share)

---

## Backend

### Setup

```bash
cd backend
pnpm install
pnpm start
```

#### Main Dependencies

- express
- body-parser
- cors
- yaml

### API Routes

| Route                      | Method | Description                                                                                  |
|----------------------------|--------|----------------------------------------------------------------------------------------------|
| `/init`                    | POST   | Initialize Aptos CLI with a private key (provided or auto-generated), updates Move.toml address. |
| `/remove-aptos`            | GET    | Removes `.aptos`, `.move`, and `build` directories for a clean state.                        |
| `/compile`                 | POST   | Compiles the provided Move code, updates Move.toml project name and address.                 |
| `/deploy`                  | POST   | Deploys the provided Move code to the Aptos testnet, updates Move.toml as needed.            |
| `/integration-functions`   | GET    | Parses the Move code and generates integration templates for frontend usage.                  |

#### Example: `/init`

You can provide your own private key, or omit it to let the backend generate a new one automatically.

```json
POST /init
{
  "privateKey": "<your_private_key>" // optional
}
```

#### Example: `/compile`

```json
POST /compile
{
  "moveCode": "<your_move_code_here>"
}
```

#### Example: `/deploy`

```json
POST /deploy
{
  "moveCode": "<your_move_code_here>"
}
```

---

### Docker Usage

The backend is designed to run in a Docker environment with the Aptos CLI available. The following directories are referenced:

- `/app/aptos`
- `/app/.aptos`

Ensure these directories are mounted or available in your Docker container.

---

## Client

### Setup

```bash
cd client
pnpm install
pnpm run dev
```

#### Main Dependencies

- react
- @aptos-labs/ts-sdk
- @aptos-labs/wallet-adapter-react
- antd
- tailwindcss

---

## Smart Contract Upload

To upload (deploy) a Move smart contract:

1. Use the `/deploy` endpoint with your Move code.
2. The backend will update the Move.toml, save your code, and deploy using the Aptos CLI.
3. On success, you will receive deployment logs and output.

**Note:** When initiating the project via `/init`, you can provide your own private key or let the backend generate one for you.

**Example Request:**

```json
POST /deploy
{
  "moveCode": "module MyAddress::MyModule { ... }"
}
```

**Example Response:**

```json
{
  "success": true,
  "output": "...",
  "log": "..."
}
```

---

## Environment Variables

You must set your GROQ API key in a `.env` file for the project to function correctly:

```
GROQ_API_KEY=your_groq_api_key_here
```

---

## Example Transaction

Transaction submitted:  
https://explorer.aptoslabs.com/txn/0x0b10b3b3a37dadc2f3d538728dd37f39cc45faf0596b5f48b97da3bda6818d52?network=testnet

```json
{
  "Result": {
    "transaction_hash": "0x0b10b3b3a37dadc2f3d538728dd37f39cc45faf0596b5f48b97da3bda6818d52",
    "gas_used": 82,
    "gas_unit_price": 100,
    "sender": "5c3b2aa3cfa6103f67163f4025da028c866201380d56f7d37e6320a0e9c9756a",
    "sequence_number": 26,
    "success": true,
    "timestamp_us": 1751781611280094,
    "version": 6801474838,
    "vm_status": "Executed successfully"
  }
}
```


