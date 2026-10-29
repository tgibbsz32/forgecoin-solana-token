# mFRG offline mint simulation — handoff

Implemented a deterministic *descriptive* five-step Token-2022 devnet deployment plan. The simulator composes validated public mint/authority/treasury settings and canonical allocation review into a digest-bearing plan, including future create-mint, create-treasury-ATA, mint, and verify steps. No transactions are constructed, signed or broadcast, no private keys are accepted intentionally, and no network requests are made.

The example assumes minting the entire 2,000,000 mFRG supply into a treasury-controlled token account before internal allocation bookkeeping; this is **proposed**, not an authorized or executed issuance. Separate allocation custody, revocation and freeze-authority choices still require owner approval. Simulation fields contain public addresses only; neither the proposed mint address nor owner proof exists until generated and authorized. Do not put any signing keys in JSON or GitHub.

Next milestone: inspect actual intended custody addresses and mint-authority policy, then construct a transaction-preview-only devnet deployment plan with accurate fees/rent using read-only simulation. Request explicit owner approval before any mint creation or funds transfer. Oracle public mining and website release gates remain separate and unopened.
