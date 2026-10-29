# mFRG signature and recipient ATA verification handoff

Completed offline Ed25519 verification of every required signature on the serialized Solana versioned transaction message, with matching signed account public keys and strict signer counts. Added deterministic Token-2022 associated token account derivation from a miner's payout wallet and the configured mint address, rejecting mismatched destination token accounts. Tests cover valid signatures, altered/zero signatures and recipient substitution.

These helpers must be composed with the existing strict Token-2022 instruction inspector and independently derived approved payout rows, not trusted caller input. ATA derivation is **not** an on-chain existence/ownership or token account balance check. No live devnet RPC account state is read and no transaction is transmitted. A real destination account may require creation and a rent-paying transaction; its existence and actual Token-2022 mint/owner fields still need verification. A signed transaction does not by itself prove it is on devnet, and blockhash validity must be checked against the desired cluster.

Next phase: add read-only devnet token account/mint owner checks and integrate all signature, instruction, ATA, approved settlement and stored outbox checks into one fail-closed inspection gate. No Solana mint, transfer, purchases, public FRG mining or website launch.
