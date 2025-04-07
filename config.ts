import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes"
import { Connection, Keypair, PublicKey } from "@solana/web3.js"
import { config } from 'dotenv';

config()

const PAYER_KEY = process.env.PAYER_KEY || ""
const RPC = process.env.RPC || ""
const JITO_FEE = Number(process.env.JITO_FEE);
const NEXTBLOCK_FEE = Number(process.env.NEXTBLOCK_FEE);
const BLOCK_ENGINE_URL = process.env.BLOCK_ENGINE_URL || ""
const NEXT_BLOCK_URL = process.env.NEXT_BLOCK_URL || ""
const GEYSER_RPC = process.env.GEYSER_RPC;
const NEXT_BLOCK_KEY = process.env.NEXT_BLOCK_KEY;

const payer = Keypair.fromSecretKey(bs58.decode(PAYER_KEY))
const connection = new Connection(RPC , {commitment : "processed"})

export {
    payer,
    connection,
    GEYSER_RPC,
    NEXT_BLOCK_KEY,
    JITO_FEE,
    NEXTBLOCK_FEE,
    BLOCK_ENGINE_URL,
    NEXT_BLOCK_URL
}