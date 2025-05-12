"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// at the top of the file
const express_1 = __importDefault(require("express")); // <- pull in the types
const ethers_1 = require("ethers");
const USD0_json_1 = __importDefault(require("./USD0.json")); // <- your ABI JSON
// load env
require("dotenv/config");
const { FLARE_RPC_URL, USD0_ADDRESS, RELAYER_PRIVATE_KEY, PORT = "3000" } = process.env;
// 1) instantiate provider & wallet
const provider = new ethers_1.ethers.JsonRpcProvider(FLARE_RPC_URL); // <- JsonRpcProvider, not ethers.providers
const relayerWallet = new ethers_1.ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
const usd0 = new ethers_1.ethers.Contract(USD0_ADDRESS, USD0_json_1.default, relayerWallet);
// 2) setup express
const app = (0, express_1.default)();
app.use(express_1.default.json());
// 3) correctly type the route handler
app.post("/relay-transfer", async (req, res) => {
    try {
        const { payload, v, r, s } = req.body;
        const tx = await usd0.transferWithAuthorization(payload.from, payload.to, payload.value, payload.validAfter, payload.validBefore, payload.nonce, v, r, s, { gasLimit: 120000 });
        const receipt = await tx.wait();
        return res.json({ txHash: receipt.transactionHash });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});
// 4) start
app.listen(+PORT, () => {
    console.log(`✅ Relayer listening on http://localhost:${PORT}`);
});
