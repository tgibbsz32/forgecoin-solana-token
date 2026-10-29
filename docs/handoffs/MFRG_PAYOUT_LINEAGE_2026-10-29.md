# mFRG payout record lineage — phase handoff

Stored newly approved payout batches now persist their complete canonical batch payload alongside existing row records and batch digest. A new read-only verifier recomputes the saved payload digest, checks approved settlement and ledger digest continuity, compares all payout rows against the original canonical batch and enforces exact budget conservation. Tests cover correct batch, modified recipient, missing payload and tampered payload. Older batches without canonical payload **fail closed** and require independent audited migration; do not silently reconstruct them from mutable rows.

Security boundary: A database administrator can modify both stored payload and digest; this is not independent append-only proof. The full source mining ledger is not stored or reverified, and this helper must be wired into the unified payout inspection gate before use. No live Solana action, miner payout or mint occurred.

Next phase: integrate lineage verifier with payout gate, add independently pinned mint/source/authority policy and live devnet read-only checks. Solana owner wallet and Oracle public activation still not required.
