# mFRG devnet executor boundary — handoff

A guarded devnet read-only allocation observer and local inspector are added. They calculate all five expected Token-2022 ATAs and balances, reject duplicate journal keys, optionally look up actual devnet token accounts, and report discrepancies without writing or signing.

Run:
- `node scripts/devnet-executor.mjs inspect <devnet-mint> <five-owners.json> <journal.json>`
- `ENABLE_DEVNET_READONLY_VERIFY=I_UNDERSTAND_DEVNET_ONLY node scripts/devnet-executor.mjs verify <devnet-mint> <five-owners.json> <journal.json>`

**Not implemented:** a transaction-signing/submission executor, persistence journal, on-chain mint distribution, or a retry-safe payment service. These require real custody keys, a dedicated funded test wallet, explicit sign-off on test-chain transactions, and architecture for safe crash recovery. The current prototype must not be described as a transaction executor capable of distributing tokens. No wallet secrets should be committed. No devnet/mainnet tokens or purchases were issued in this phase.

Next: add persistent state machine and mockable submission/confirmation backend, then integration-test on devnet using dedicated test wallets. Keep mainnet and public sale inactive until separate activation.
