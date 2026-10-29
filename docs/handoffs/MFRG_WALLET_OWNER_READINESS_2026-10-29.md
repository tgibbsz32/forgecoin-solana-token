# mFRG wallet owner readiness — handoff

A public-address-only wallet readiness helper and configuration template were added. It checks pinned devnet identity, independently specified mint, freeze and treasury public addresses, distinct custodian roles, explicit interim freeze policy and owner custody selection. If a proposed mint public key is supplied, it derives the Solana Token-2022 treasury associated token account.

Important: The helper never signs or broadcasts and does not verify possession of any private keys. It rejects a few known secret field names but is **not a general-purpose secret scrubber**; operators must not paste private keys, seed phrases, keystores or mnemonic backups into the config or commit them to the repository. The example template contains placeholders, not real wallet addresses.

## Owner checklist

1. Select an owner-controlled Solana wallet for mint authority (hardware wallet preferred for mainnet), and a separate treasury owner wallet. Freeze authority is provisionally separate; decide whether to disable freeze authority entirely before mint creation.
2. Back up wallet recovery materials offline. Share **public keys only**. Never send a seed phrase or private key to ChatGPT/GitHub.
3. Choose a specific mint-key management process; a mint address does not exist until a keypair is created and the account initialized by an explicitly authorized transaction.
4. Confirm the 2,000,000 mFRG / 6 decimals supply and published allocation plan, Token-2022 extensions, authority revocation policy and mint distribution controls.
5. For a deliberately approved devnet test, use devnet SOL only and inspect the transaction in the owner wallet before signing.

No token mint, transfer, public sale, or Oracle public mining activation was performed. Next phase: secure read-only owner-address review and a transaction-free devnet deployment simulation; owner action will be required before real mint transactions.
