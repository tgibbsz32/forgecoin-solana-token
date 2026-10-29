# mFRG offline deployment-review packet — handoff

## Implemented
A deterministic operator review packet generator, `node scripts/deployment-review-packet.mjs public-config.json`, validates the pinned devnet configuration, approved two-million-token supply, and allocations (initial sale 1,000,000; first-year miner rewards 175,000; future miners/community 375,000; ecosystem apps 250,000; development reserve 200,000). It enforces explicit review-state policy strings for mint authority, freeze authority and optional Token-2022 extensions, and emits a SHA-256 fingerprint for an owner to review and approve separately. No signer, secret key input or live transfer occurs.

## Constraints / safety
The fingerprint is a reproducible change detector, not an attestation or authorization. No actual public mint addresses were selected and no wallet control was verified. The strict current configuration requires distinct mint, mint authority, freeze authority and treasury owner; production custody/governance may require changing this design after review. 'retain-until-reviewed' and 'none-proposed' are provisional freeze/extension choices, not final governance decisions. If the freeze authority should be permanently disabled, the config validator must explicitly model a null authority; do not substitute a fabricated key. Never commit seed phrases, private keys or owner wallet secrets. The mint has not been created, and the initial sale remains inactive.

## Owner decisions required before devnet mint
Choose a secure wallet holding the mint authority, a treasury owner address and the desired freeze-authority policy. Provide public keys only and explicitly authorize a final reviewed devnet transaction. Test SOL for the devnet owner can come from a faucet. Mainnet wallet/custody should use hardware protection; no mainnet transaction should occur without separate authorization.

## Next phase
Add a wallet-safe operator checklist and optional public-config template, verify approved addresses and cluster genesis against live devnet, then request owner participation for a real devnet mint. Native FRG Oracle daemon/pool/web launch remains a separate readiness gate.
