import fs from 'node:fs';
const c=JSON.parse(fs.readFileSync(new URL('../config/tokenomics.json',import.meta.url)));
const factor=10n**BigInt(c.token.decimals);
const allocation=Object.fromEntries(Object.entries(c.allocations).map(([name,amount])=>[name,(BigInt(amount)*factor).toString()]));
const total=Object.values(allocation).reduce((s,v)=>s+BigInt(v),0n);
if(total!==BigInt(c.token.maxSupply)*factor) throw Error('Supply mismatch');
console.log(JSON.stringify({network:'devnet-preparation-only',mintCreation:'NOT EXECUTED',decimals:c.token.decimals,maxSupplyBaseUnits:total.toString(),allocationBaseUnits:allocation,requiredBeforeMint:['Select independently controlled wallet addresses for five allocations','Review freeze and mint authority policy','Fund fee payer with devnet SOL','Test exact mint and distribution on devnet','Review before mainnet mint']},null,2));
