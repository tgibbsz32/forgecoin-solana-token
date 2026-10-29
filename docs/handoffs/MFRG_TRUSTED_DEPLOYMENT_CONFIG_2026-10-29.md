# mFRG — trusted devnet configuration handoff

Implemented read-only trusted deployment configuration validation. Requires official Solana devnet HTTPS RPC, independently pinned devnet genesis identity, Solana Token-2022 program, 6 decimals, 2,000,000.000000 mFRG total base-unit supply (2,000,000,000,000), unique mint/authority/freeze/treasury public keys, and derived Token-2022 treasury ATA. Negative tests cover wrong supply/network, account substitution and cluster identity. No wallet signing, secrets, mint or token issuance.

This defines a *configuration preview* and does not prove that the mint exists, has correct extensions or is controlled by the asserted key holder. No token is deployed on devnet or mainnet. Secure authority setup may choose to disable freeze authority at mint creation; this strict placeholder config must be reviewed against final governance and operational policy before minting. Mainnet RPC, supply policy and real mint address must be separately pinned and authorized. Never generate or commit owner signing private keys to GitHub.

## Owner action gate
Before devnet mint deployment, the user needs to choose wallet custody and provide only public owner/treasury addresses. They must approve any signed mint creation after reviewing supply, mint authority, treasury and extensions; devnet SOL can be requested from faucet. Do not use a custodial or temporary assistant-managed private key as mainnet authority.

Native ForgeCoin Oracle public mining launch and website announcements remain independent and require real daemon sync, solo and pool blocks, payout/monitoring, explorer and public application verification. Public mFRG sale stays inactive.

Next milestone: compose deployment configuration with live read-only devnet preflight and offline operator review packet; explicitly request wallet addresses/authority model only after the decision is needed.
