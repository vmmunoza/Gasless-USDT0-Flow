# Gasless-USDT0-Flow

Purpose: a from-scratch, end-to-end example showing how to build and run a gasless USD₮0 transfer flow on Flare. 

Front-end (React + Ethers.js) → Relayer (Express + ethers.js) → Flare network (USD₮0 ERC-3009).

___

## Repo Layout:

gasless-usdt0-demo/
├── frontend/
│   ├── .env.local           # ← fill these after copying from root .env
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx
│   │   └── USD0.json        # ERC-3009 ABI
├── relayer/
│   ├── .env                 # ← copy from root .env
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts
├── .env.example
└── README.md

___

## Installation

git clone https://github.com/vmmunoza/Gasless-USDT0-Flow
cd Gasless-USDT0-Flow

### Copy & fill keys
cp .env.example .env
cd frontend && cp ../.env.example .env.local

### Install deps
npm --prefix frontend install
npm --prefix relayer  install

___

## Run the Relayer

cd relayer
npm run start
# → Express listening on http://localhost:3000

___

## Run the Frontend 
cd frontend
npm run start
# → React on http://localhost:3001 (or default CRA port)

___

## Demo Flow

- Connect MetaMask to Flare Mainnet.

- Enter Recipient & Amount, click Send Gasless.

- MetaMask prompts for an EIP-712 signature.

- The front-end POSTs { payload, v, r, s } to your relayer.

- Relayer calls transferWithAuthorization(...), pays FLR gas, returns the tx hash.

- You see the Flare TX pop up.

