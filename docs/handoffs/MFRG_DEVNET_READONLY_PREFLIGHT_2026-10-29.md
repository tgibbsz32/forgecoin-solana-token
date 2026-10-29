# mFRG live read-only devnet diagnostics — phase handoff

Added a repeatable read-only Solana devnet preflight script `node scripts/devnet-readonly-preflight.mjs` querying the official HTTPS devnet RPC for cluster genesis hash, node version, finalized slot and `getHealth` response; the script prints JSON and returns non-zero on error. Unit tests use mock connections and enforce fail-closed input/health checks.

**No mint, wallet key, SOL, transfer, transaction broadcast, or Oracle activation is involved.** GitHub Actions unit tests do not prove public RPC availability. Operators must separately execute the diagnostic on the intended deployment host and record actual cluster data and network availability. The returned cluster genesis hash is *reported*, not compared against a trusted independently pinned devnet hash; the diagnostic therefore cannot authorize payouts or deployment. Public devnet RPC is rate-limited and may be degraded.

Next steps: independently pin the expected devnet genesis hash, establish read-only checks for mint account ownership once a devnet mint exists, and complete owner-managed devnet mint / custody authorization before any test transfers. Separately qualify native ForgeCoin Oracle daemon, mining pool, miner downloads and explorer before opening public mining. Public mFRG sale stays inactive.
