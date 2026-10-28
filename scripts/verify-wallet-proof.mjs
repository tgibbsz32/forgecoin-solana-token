import crypto from 'node:crypto';
import bs58 from 'bs58';
import nacl from 'tweetnacl';
export function verifySolanaWalletProof(proof,{now=Date.now(),expectedDomain='forgecoin-mfrg-rewards-v1',expectedChallenge}={}){
 if(!proof||proof.domain!==expectedDomain||!expectedChallenge||proof.challenge!==expectedChallenge)throw Error('Wallet proof domain/challenge mismatch');
 if(typeof proof.minerId!=='string'||!proof.minerId||typeof proof.solanaAddress!=='string'||typeof proof.signatureBase58!=='string')throw Error('Malformed wallet proof');
 const expires=Date.parse(proof.expiresAt),issued=Date.parse(proof.issuedAt);
 if(!Number.isFinite(expires)||!Number.isFinite(issued)||expires<=issued||issued>now+300000||now>expires||expires-issued>15*60*1000)throw Error('Expired or invalid challenge');
 const raw=bs58.decode(proof.solanaAddress),sig=bs58.decode(proof.signatureBase58);
 if(raw.length!==32||sig.length!==64||bs58.encode(raw)!==proof.solanaAddress)throw Error('Invalid Solana public key/signature');
 const statement=JSON.stringify({domain:proof.domain,minerId:proof.minerId,solanaAddress:proof.solanaAddress,challenge:proof.challenge,issuedAt:proof.issuedAt,expiresAt:proof.expiresAt});
 if(!nacl.sign.detached.verify(new TextEncoder().encode(statement),sig,raw))throw Error('Invalid wallet ownership signature');
 return {minerId:proof.minerId,solanaAddress:proof.solanaAddress,challengeDigest:crypto.createHash('sha256').update(proof.challenge).digest('hex')};
}
