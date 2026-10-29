# mFRG unified payout gate — handoff

This phase introduces a **read-only, fail-closed** orchestration entry point connecting approved payout rows, settlement approval, prepared transaction outbox, Ed25519 signature verification, strict Token-2022 transfer checks, recipient associated token account derivation and on-chain account validation. It has no transaction send, signer, wallet secret or mint functionality.

**Known blocker:** approved_payout_rows currently stores `recipient` as the miner Solana owner wallet, not its ATA, and does not store a recipient ATA column. The first implementation must derive the ATA from the recorded owner and configured mint; it must not accept a caller-chosen destination. This phase must also validate the fee payer from the transaction header rather than merely checking signer membership.

**Next:** correct the recipient ATA derivation and fee-payer enforcement, add integrated mock-RPC tests and independently pinned devnet endpoint/mint policy. Do not enable transfers without a genuine devnet integration test. This code is not yet production-ready.
