# mFRG deployment preparation

Status: **design/configuration and offline simulation; no on-chain mint exists from these scripts**.

Run `npm run validate && npm test && npm run plan && npm run payout-preview` with Node.js 20+.

## Minting sequence (not yet executable)
1. Record the canonical Solana network, mint keypair and fee-payer public keys. Never commit private keys.
2. Choose Token-2022 program and carefully validate desired extensions; supply is 2,000,000 with 6 decimals (2,000,000,000,000 base units).
3. Use devnet first: create mint, initialize metadata as appropriate, create allocation token accounts, mint exact supplies, distribute, reconcile every allocation, then test authority revocation.
4. Mainnet requires explicit final review of address ownership, authority design, fees, custody, and token sale controls. Revoking mint authority is irreversible.

## Miner distribution
The sample script only calculates a preview. Production must aggregate difficulty-weighted accepted work (not mere share counts), verify Solana addresses and miner address ownership, journal payouts with immutable period IDs, enforce caps, and support retries without duplicate transfers.

## Website purchase flow
Keep purchase CTA disabled. A future implementation should create a server-side quote, independently verify settled SOL/USDC transfers and payer, confirm correct mint, decimals, and program, then deliver only once with idempotency and accounting. GitHub Pages cannot securely hold signing keys or implement a trusted payment backend.

**No live purchase, mint, SOL/USDC collection, or payout integration has been activated.**
