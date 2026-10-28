import fs from 'node:fs';
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo, getMint, getAccount } from '@solana/spl-token';

if (process.env.ENABLE_DEVNET_MINT !== 'I_UNDERSTAND_DEVNET_ONLY') throw Error('Set ENABLE_DEVNET_MINT=I_UNDERSTAND_DEVNET_ONLY to run on devnet');
const config=JSON.parse(fs.readFileSync(new URL('../config/tokenomics.json',import.meta.url)));
const walletPath=process.env.DEVNET_FEE_PAYER_KEYPAIR;
if(!walletPath) throw Error('Set DEVNET_FEE_PAYER_KEYPAIR to an existing devnet-only keypair JSON path; never commit this file');
const payer=Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(walletPath,'utf8'))));
const connection=new Connection(clusterApiUrl('devnet'),'confirmed');
if(new URL(connection.rpcEndpoint).hostname!=='api.devnet.solana.com')throw Error('Not on devnet');
const decimals=config.token.decimals;
const supply=BigInt(config.token.maxSupply)*10n**BigInt(decimals);
const planned=Object.values(config.allocations).reduce((s,v)=>s+BigInt(v)*10n**BigInt(decimals),0n);
if(supply!==planned)throw Error('Allocations do not equal supply');
// This prototype mints to a single fee-payer controlled token account, not allocation custody accounts.
// Do not use on mainnet; no metadata, timelocks, authority revocation, or treasury segregation is configured.
const mint=await createMint(connection,payer,payer.publicKey,null,decimals,undefined,undefined,TOKEN_2022_PROGRAM_ID);
const ownerAta=await getOrCreateAssociatedTokenAccount(connection,payer,mint,payer.publicKey,false,'confirmed',undefined,TOKEN_2022_PROGRAM_ID);
await mintTo(connection,payer,mint,ownerAta.address,payer,supply,[],undefined,TOKEN_2022_PROGRAM_ID);
const verifiedMint=await getMint(connection,mint,'confirmed',TOKEN_2022_PROGRAM_ID);
const verifiedAccount=await getAccount(connection,ownerAta.address,'confirmed',TOKEN_2022_PROGRAM_ID);
if(verifiedMint.supply!==supply||verifiedAccount.amount!==supply)throw Error('On-chain verification failed');
console.log(JSON.stringify({network:'devnet',mint:mint.toBase58(),feePayer:payer.publicKey.toBase58(),tokenAccount:ownerAta.address.toBase58(),supplyBaseUnits:supply.toString(),allocatedToTreasuries:false,authorityRevoked:false},null,2));
