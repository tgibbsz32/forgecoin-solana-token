# mFRG native FRG address proof — phase handoff

## Source verification
The ForgeCoin main repository has native wallet RPC `COMMAND_RPC_SIGN` and `COMMAND_RPC_VERIFY` definitions in `src/wallet/wallet_rpc_server_commands_defs.h`. The verifier RPC request contains `data`, `address`, and `signature`; the response includes a `good` boolean. This is the wallet RPC service, **not** the P2P daemon endpoint, and port must be configured separately.

## Completed
Added a domain-separated native FRG ownership statement binding miner identifier, FRG payout address, Solana payout address, challenge and expiry. Added an injectable wallet-RPC `verify` adapter constrained to a preconfigured loopback endpoint and fail-closed negative tests. This allows independent testing without inventing Monero-style signature mathematics in JavaScript. No user-supplied RPC URL is accepted by the validation method.

## Outstanding security requirements
This module is not yet a public enrollment service. Callers must issue and consume unguessable **single-use** challenge records, authenticate the miner's registration identity, pin trusted local wallet RPC configuration, check wallet signatures against actual ForgeCoin builds, and verify the Solana ownership proof for the exact same challenge and receiving address in the same database transaction. The current proof check does not itself consume nonce state. Never expose a wallet RPC service to public callers. Signed pool work must also be authenticated. No on-chain transfers, token minting or public sale activation occurred.

## Next phase
Integrate both FRG and Solana address verification using a transactional challenge state machine, controlled production wallet RPC connection, and signed mining snapshot. Add integration tests against actual ForgeCoin wallet RPC rather than mocks before enabling registration for real miners.
