## 1. Project Overview

**Gasless USD₮0 Demo**
This project demonstrates a “gasless” token-transfer flow on the Flare Network using a two-piece architecture:

1. **Front-end (React + Ethers.js)**

   * Presents a simple UI: a “recipient” field, an “amount” field, and a “Send Gasless” button.
   * Builds an [EIP-712](https://eips.ethereum.org/EIPS/eip-712) “transferWithAuthorization” payload off-chain (including timestamps, nonce, etc.).
   * Prompts the user’s wallet (e.g. MetaMask) for an EIP-712 signature of that payload—**no gas needed from the user at this step**.
   * Sends the signed payload to the relayer via a POST request.

2. **Relayer (Express + Ethers.js)**

   * Listens for `/relay-transfer` requests.
   * Verifies and submits the user’s signed “transferWithAuthorization” on-chain by calling the USD₮0 contract’s `transferWithAuthorization(...)` method, paying the FLR gas itself.
   * Returns the resulting on-chain transaction hash back to the front-end.

Together, this setup lets end users move USD₮0 tokens without holding any FLR—they only sign a message, and the relayer covers the gas.

---

## 2. Current Status & Challenges

* **What works**

  * Front-end UI renders.
  * MetaMask pops up for an EIP-712 signature.
  * Relayer compiles, binds to `http://localhost:3000`, and responds to `GET /` with “✅ Gasless relayer up and running”.

* **Remaining challenge**
  After signing, the front-end console shows:

  ```
  Uncaught TypeError: Cannot set property ethereum of #<Window> ...
  Uncaught TypeError: Cannot redefine property: ethereum ...
  ```

  These errors originate in the injected-provider library (used by `ethers.BrowserProvider`) when it tries to monkey-patch `window.ethereum`, which conflicts with MetaMask’s built-in getter. As a result, the `sendGasless()` sequence never completes its EIP-712 call and never POSTs to the relayer.

---
