import { useState } from "react";
import { ethers } from "ethers";
import USD0Abi from "./USD0.json";

const USD0_ADDRESS = process.env.REACT_APP_USD0_ADDRESS!;
const RELAYER_URL  = process.env.REACT_APP_RELAYER_URL!;

export default function App() {
  const [to, setTo]       = useState("");
  const [amount, setAmt]  = useState("1");

  async function sendGasless() {
    // 1) Setup ethers & contract
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    await provider.send("eth_requestAccounts", []);
    const signer   = await provider.getSigner();
    const from     = await signer.getAddress();
    const usd0     = new ethers.Contract(USD0_ADDRESS, USD0Abi, signer);

    // 2) Build payload
    const chainId     = (await provider.getNetwork()).chainId;
    const domain      = {
      name: await usd0.name(),
      version: "1",
      chainId,
      verifyingContract: USD0_ADDRESS
    };
    const types = {
      TransferWithAuthorization: [
        { name: "from",        type: "address" },
        { name: "to",          type: "address" },
        { name: "value",       type: "uint256" },
        { name: "validAfter",  type: "uint256" },
        { name: "validBefore", type: "uint256" },
        { name: "nonce",       type: "bytes32" }
      ]
    };
    const now         = Math.floor(Date.now() / 1000);
    const validAfter  = now;
    const validBefore = now + 3600;
    const nonce       = ethers.hexlify(ethers.randomBytes(32));
    const message     = {
      from,
      to,
      value: ethers.parseUnits(amount, 6),
      validAfter,
      validBefore,
      nonce
    };

    // 3) Sign off-chain
    const signature = await (signer as any)._signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(signature);

    // 4) POST to relayer
    const res = await fetch(`${RELAYER_URL}/relay-transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: message, v, r, s })
    });
    const { txHash } = await res.json();
    alert("Transaction sent! Hash: " + txHash);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Gasless USD₮0 Demo</h1>
      <input placeholder="Recipient" value={to} onChange={e => setTo(e.target.value)} />
      <input placeholder="Amount"    value={amount} onChange={e => setAmt(e.target.value)} />
      <button onClick={sendGasless}>Send Gasless</button>
    </div>
  );
}

