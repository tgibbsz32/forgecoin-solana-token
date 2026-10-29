# mFRG encrypted software-wallet custody and unsigned mint instructions

## Completed
Added an offline Token-2022 instruction preview using public addresses and a separately supplied positive mint-rent quote. The review creates instructions for mint account creation, mint initialization, owner treasury associated token account creation and a 2,000,000 mFRG MintToChecked instruction. It reports required transaction signers and instruction data but never serializes a network-ready transaction, provides a blockhash, accesses keys, or broadcasts. No tokens or fees moved.

## Software-wallet custody policy
Owner will not use a hardware wallet. Use a reputable Solana software wallet with locally encrypted key material, a strong unique passphrase, device full-disk encryption, a clean OS, offline recovery phrase backups and separate owner/treasury accounts. Avoid cloud screenshots, plain-text seed files, pasted secrets, and using Oracle/cloud servers to hold mainnet signing keys. A Solana software wallet typically uses 12 or 24 BIP-39 words, **not the 25-word Monero/ForgeCoin mnemonic**; recovery schemes must be verified wallet by wallet. Encryption is defense-in-depth, not a substitute for offline backup and access controls.

## Before live devnet
The preview does **not** estimate fees and assumes standard Token-2022 mint/account sizes with no extensions. Mint-account creation requires the mint account's signature, which ordinary browser wallets may not provide for a newly created mint unless the mint keypair is generated under a compatible local signing flow. The owner must review how that mint signing key is generated, encrypted and backed up. The four instructions do not represent a single guaranteed network-acceptable transaction (size and compute budget must be reviewed). Separate the create/init, ATA creation and mint-to steps when composing real transactions. Freeze authority should be reviewed: disabling it may require a null authority rather than a dedicated account.

Do not upload seed phrases, private keys, passwords, or keystore files to this repository or ChatGPT. Public addresses only.

## Next phase
Review operator custody choice and obtain public mint authority, fee payer and treasury addresses; design unsigned devnet transaction groups with real blockhash/fees and explicit approval. Oracle mainnet mining and public website launch are still independent and inactive.
