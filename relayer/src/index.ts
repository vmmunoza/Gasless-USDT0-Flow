import express from "express";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import USD0Abi from "./USD0.json";

dotenv.config();

const {
  FLARE_RPC_URL,
  USD0_ADDRESS,
  RELAYER_PRIVATE_KEY,
  PORT = "3000"
} = process.env;

const provider      = new ethers.JsonRpcProvider(FLARE_RPC_URL);
const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY!, provider);
const usd0          = new ethers.Contract(USD0_ADDRESS!, USD0Abi, relayerWallet);

const app = express();
app.use(express.json());

app.post("/relay-transfer", async (req, res) => {
  try {
    const { payload, v, r, s } = req.body;
    const tx = await usd0.transferWithAuthorization(
      payload.from,
      payload.to,
      payload.value,
      payload.validAfter,
      payload.validBefore,
      payload.nonce,
      v, r, s,
      { gasLimit: 120_000 }
    );
    const receipt = await tx.wait();
    res.json({ txHash: receipt.transactionHash });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(parseInt(PORT), () => {
  console.log(`Relayer listening on http://localhost:${PORT}`);
});

