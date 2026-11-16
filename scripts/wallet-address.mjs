// Prints the Solana address (base58 public key) of a solana-keygen style keypair file.
// Usage: node scripts/wallet-address.mjs ../makefun-keypair.json
// Reads only the public half; nothing is sent anywhere and the secret is never printed.
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) { console.error("usage: node scripts/wallet-address.mjs <keypair.json>"); process.exit(2); }
const bytes = JSON.parse(readFileSync(file, "utf8"));
if (!Array.isArray(bytes) || bytes.length !== 64) { console.error("not a 64-byte keypair file"); process.exit(1); }
const pub = Uint8Array.from(bytes.slice(32));

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function base58(buf) {
  let n = 0n;
  for (const b of buf) n = (n << 8n) + BigInt(b);
  let out = "";
  while (n > 0n) { out = ALPHABET[Number(n % 58n)] + out; n /= 58n; }
  for (const b of buf) { if (b === 0) out = "1" + out; else break; }
  return out;
}
console.log(base58(pub));
