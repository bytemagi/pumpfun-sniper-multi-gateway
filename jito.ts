import {
  Program,
  AnchorProvider,
  BN,
} from "@coral-xyz/anchor";
import { ComputeBudgetProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction, Transaction, TransactionMessage } from '@solana/web3.js';
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import type { PumpFun } from "./idl/pump-fun";
import idl from "./idl/pump-fun.json";
import { connection, GEYSER_RPC, JITO_FEE, NEXTBLOCK_FEE, payer } from "./config";
import WebSocket from 'ws';
import { JITO_TIP_ACC, PUMPFUN_FEE_RECEIPT } from "./consts";
import { PublicKey } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";
import { getRandomElement } from "./utils";
import { sendRequest } from "./landing-api/geyser";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { sendTxUsingJito } from "./landing-api/sendBundle";

const wallet = new NodeWallet(payer)
const provider = new AnchorProvider(connection, wallet, { commitment: "processed" });
const program = new Program(idl as PumpFun, provider);

const BUY_AMOUNT = 0.0001 * LAMPORTS_PER_SOL
const MAX_SOL_COST = LAMPORTS_PER_SOL

let mySolBalance = 0;

program.addEventListener("tradeEvent" , (ele) => {

})

const withGaser = () => {

  const jitoTipAcc = new PublicKey(getRandomElement(JITO_TIP_ACC))

  if (!GEYSER_RPC) return console.log('Geyser RPC is not provided!');

  const ws = new WebSocket(GEYSER_RPC);

  ws.on('open', function open() {
    console.log('WebSocket is open');
    sendRequest(ws);  // Send a request once the WebSocket is open
  });

  let i = 0

  ws.on('message', async function incoming(data: any) {

    const messageStr = data.toString('utf8');
    try {
      const messageObj = JSON.parse(messageStr);
      const result = messageObj.params.result;
      const logs = result.transaction.meta.logMessages;
      const signature = result.signature; // Extract the signature
      const accountKeys = result.transaction.transaction.message.accountKeys.map((ak: { pubkey: any; }) => ak.pubkey);

      if (logs && logs.some((log: string | string[]) => log.includes('Program log: Instruction: InitializeMint2'))) {
        const mint = new PublicKey(accountKeys[1])
        const bondingCurve = new PublicKey(accountKeys[2])
        const slot = await connection.getSlot()

        if (slot + 2 < parseInt(messageObj.params.result.slot)) {
          console.time("1")
          console.log("=========================================");
          console.log("current : ", slot);
          console.log("tx : ", messageObj.params.result.slot);
          console.log("Detect Sig : ", signature);
          ws.close()

          const userAta = getAssociatedTokenAddressSync(mint, payer.publicKey)
          const associatedBondingCurve = getAssociatedTokenAddressSync(mint, bondingCurve, true);

          const tx = new Transaction()
          tx.add(
            createAssociatedTokenAccountInstruction(payer.publicKey, userAta, payer.publicKey, mint)
          );
          const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
            units: 100000,
          });

          const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 30000000,
          })

          const serviceFee = SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: jitoTipAcc,
            lamports: JITO_FEE * LAMPORTS_PER_SOL
          })

          tx
            .add(modifyComputeUnits)
            .add(addPriorityFee)
            .add(
              await program.methods
                .buy(new BN(BUY_AMOUNT.toString()), new BN(MAX_SOL_COST.toString()))
                .accounts({
                  feeRecipient: PUMPFUN_FEE_RECEIPT,
                  mint: mint,
                  associatedBondingCurve: associatedBondingCurve,
                  associatedUser: userAta,
                  user: payer.publicKey,
                })
                .transaction()
            )
            .add(serviceFee)

          tx.feePayer = payer.publicKey;

          const latestBlockhash = await connection.getLatestBlockhash({ commitment: "processed" })
          tx.recentBlockhash = latestBlockhash.blockhash;

          tx.sign(payer);

          console.timeEnd("1")
          console.time("7")

          const serializedTx = tx.serialize()
          const transactionContent = bs58.encode(serializedTx);

          if (i++ != 0) return;

          const sig = await sendTxUsingJito({ encodedTx: transactionContent, region: "frankfurt" })
          connection.getSlot().then(ele => console.log("Bot Ended Slot : ", ele))
          console.log(sig);
          console.timeEnd("7");

        }
      }
    } catch (e) {

    }
  })
}



(async () => {
  mySolBalance = Number(await connection.getBalance(payer.publicKey))
  console.log(mySolBalance);


  withGaser()
})()