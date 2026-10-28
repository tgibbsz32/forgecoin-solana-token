import {loadJournal,safeWriteJournal,transition} from './journal-state.mjs';
const [cmd,file,id,status,signature]=process.argv.slice(2);
if(!['inspect','transition'].includes(cmd)||!file)throw Error('Usage: node scripts/journal-cli.mjs inspect <journal> | transition <journal> <id> <status> [signature]');
const rows=loadJournal(file);
if(cmd==='inspect'){console.log(JSON.stringify({mode:'READ_ONLY',rows},null,2));process.exit(0)}
if(process.env.ENABLE_LOCAL_JOURNAL_WRITE!=='I_UNDERSTAND_LOCAL_ONLY')throw Error('Set ENABLE_LOCAL_JOURNAL_WRITE=I_UNDERSTAND_LOCAL_ONLY');
const next=transition(rows,id,status,signature?{signature}:{});
safeWriteJournal(file,next);console.log(JSON.stringify({mode:'LOCAL_JOURNAL_UPDATED',id,status,networkTransfers:false}));
