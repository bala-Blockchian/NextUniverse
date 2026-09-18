import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PINATA_JWT = process.env.PINATA_JWT;
const PRIVATE_KEY = process.env.PRIVATE_KEY?.startsWith('0x')
  ? process.env.PRIVATE_KEY
  : `0x${process.env.PRIVATE_KEY}`;
const RPC_URL = process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// 0.00001 Sepolia ETH in wei
const MINT_VALUE = 10000000000000n;

if (!PINATA_JWT) {
  throw new Error('PINATA_JWT is missing. Add it to backend/.env');
}
if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY is missing. Add it to backend/.env');
}
if (!CONTRACT_ADDRESS) {
  throw new Error('CONTRACT_ADDRESS is missing. Add it to backend/.env');
}

const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({ chain: sepolia, transport: http(RPC_URL) });
const walletClient = createWalletClient({ account, chain: sepolia, transport: http(RPC_URL) });

// The contract owner (also the wallet that calls the onlyOwner mintNft).
const CONTRACT_OWNER = process.env.CONTRACT_OWNER || account.address;

const MINT_ABI = [
  {
    name: 'mintNft',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'tokenUri', type: 'string' }],
    outputs: [],
  },
];

const PINATA_API = 'https://api.pinata.cloud';

// ---------- Pinata helpers (JWT auth, no SDK needed) ----------

async function pinFileToIpfs(name, content, contentType) {
  const form = new FormData();
  form.append('file', new Blob([content], { type: contentType }), name);

  const res = await fetch(`${PINATA_API}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok || !json.IpfsHash) {
    throw new Error(`Pinata file upload failed: ${JSON.stringify(json)}`);
  }
  return json.IpfsHash;
}

async function pinJsonToIpfs(object) {
  const res = await fetch(`${PINATA_API}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(object),
  });
  const json = await res.json();
  if (!res.ok || !json.IpfsHash) {
    throw new Error(`Pinata JSON upload failed: ${JSON.stringify(json)}`);
  }
  return json.IpfsHash;
}

// ---------- Metadata builders ----------

function buildPlotSvg(plot) {
  const rows = ['1f2937', '111827', '1e293b', '0f172a'];
  const grid = rows
    .map(
      (color, r) =>
        `<rect x="8" y="${8 + r * 24}" width="24" height="24" rx="3" fill="#${color}"/>`,
    )
    .join('');
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#080b14"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)"/>
  <g stroke="#232a48" stroke-width="1">
    <path d="M0 80H400 M0 160H400 M0 240H400 M0 320H400"/>
    <path d="M80 0V400 M160 0V400 M240 0V400 M320 0V400"/>
  </g>
  <g transform="translate(140 140)">${grid}</g>
  <rect x="140" y="140" width="120" height="120" rx="6" fill="none" stroke="#f5b942" stroke-width="2" stroke-dasharray="6 4"/>
  <circle cx="200" cy="200" r="7" fill="#f5b942"/>
  <text x="200" y="360" font-family="monospace" font-size="20" fill="#00e6c3" text-anchor="middle">${plot.id}</text>
  <text x="200" y="382" font-family="monospace" font-size="12" fill="#8890ac" text-anchor="middle">${plot.place}</text>
</svg>`;
}

function buildMetadata(plot) {
  return {
    name: `${plot.name} — Next Universe Plot`,
    description: `Own a piece of the real-world map. ${plot.place} (${plot.sector}). Use the gold parcel as your NFT art.`,
    image: '', 
    attributes: [
      { trait_type: 'Plot ID', value: plot.id },
      { trait_type: 'Place', value: plot.place },
      { trait_type: 'Sector', value: plot.sector },
      { trait_type: 'Latitude', value: plot.lat },
      { trait_type: 'Longitude', value: plot.lng },
      { trait_type: 'Area (sqm)', value: plot.areaSqm },
      { trait_type: 'Footprint', value: plot.size },
      { trait_type: 'Price (BDX)', value: plot.priceBdx },
    ],
  };
}

function toEther(value) {
  return Number(value) / 1e18;
}

// ---------- Route ----------

app.post('/api/mint', async (req, res) => {
  const plot = req.body;

  const required = ['id', 'name', 'place', 'lat', 'lng'];
  const missing = required.filter((key) => plot?.[key] === undefined || plot?.[key] === '');
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  const receiver = req.body.receiver;
  if (!receiver || !/^0x[a-fA-F0-9]{40}$/.test(receiver)) {
    return res.status(400).json({ error: 'A valid receiver address is required (0x…40 hex chars)' });
  }

  const paymentTxHash = req.body.paymentTxHash;
  if (!paymentTxHash || !/^0x[a-fA-F0-9]{64}$/.test(paymentTxHash)) {
    return res.status(400).json({
      error: 'paymentTxHash is required — the connected wallet must send 0.00001 ETH to the contract owner first',
    });
  }

  try {
    // 1/3 — the connected wallet must have sent the mint fee to the contract owner
    const paymentTx = await publicClient.getTransaction({ hash: paymentTxHash });
    const paymentReceipt = await publicClient.waitForTransactionReceipt({ hash: paymentTxHash });
    if (paymentReceipt.status !== 'success') {
      return res.status(402).json({ error: 'Payment transaction did not succeed' });
    }
    if (paymentTx.from.toLowerCase() !== receiver.toLowerCase()) {
      return res.status(402).json({ error: 'Payment must come from the connected wallet' });
    }
    if (paymentTx.to?.toLowerCase() !== CONTRACT_OWNER.toLowerCase()) {
      return res.status(402).json({ error: 'Payment must be sent to the contract owner' });
    }
    if (paymentTx.value !== MINT_VALUE) {
      return res.status(402).json({ error: `Payment must be exactly ${toEther(MINT_VALUE)} ETH` });
    }

    // 2/3 — generate metadata (SVG parcel art + JSON) and pin both to Pinata
    const svg = buildPlotSvg(plot);
    const imageHash = await pinFileToIpfs(`${plot.id}.svg`, svg, 'image/svg+xml');

    const metadata = buildMetadata(plot);
    metadata.image = `ipfs://${imageHash}`;

    const metadataHash = await pinJsonToIpfs(metadata);
    const tokenUri = `ipfs://${metadataHash}`;

    // 3/3 — call the contract's mintNft with the token URI (onlyOwner)
    const mintHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: MINT_ABI,
      functionName: 'mintNft',
      args: [tokenUri],
    });
    const mintReceipt = await publicClient.waitForTransactionReceipt({ hash: mintHash });

    return res.status(200).json({
      success: true,
      metadata,
      ipfsImageHash: imageHash,
      ipfsMetadataHash: metadataHash,
      tokenUri,
      payment: {
        valueEth: toEther(MINT_VALUE),
        hash: paymentTxHash,
        from: paymentTx.from,
        to: paymentTx.to,
      },
      mint: {
        hash: mintHash,
        status: mintReceipt.status,
        receiver,
      },
    });
  } catch (error) {
    return res.status(502).json({ error: error.shortMessage || error.message });
  }
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    account: account.address,
    owner: CONTRACT_OWNER,
    contract: CONTRACT_ADDRESS,
    mintValueEth: toEther(MINT_VALUE),
  });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Next Universe backend listening on http://localhost:${PORT}`);
  console.log(`Hot wallet: ${account.address}`);
});