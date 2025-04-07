import {
  Program,
  AnchorProvider,
  BN,
} from "@coral-xyz/anchor";
import { ComputeBudgetProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction, Transaction } from '@solana/web3.js';
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync } from '@solana/spl-token';
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import type { PumpFun } from "./idl/pump-fun";
import idl from "./idl/pump-fun.json";
import { connection, payer } from "./config";
import { PUMPFUN_FEE_RECEIPT } from "./consts";

const wallet = new NodeWallet(payer)
const provider = new AnchorProvider(connection, wallet, {});
const program = new Program(idl as PumpFun, provider);

const BUY_AMOUNT = 1
const MAX_SOL_COST = 1

program.addEventListener("tradeEvent", async ele => {
  console.log(ele);
})

const temp = program.addEventListener("createEvent", async (ele) => {
  console.log(ele.bondingCurve);
  console.time("1")
  program.removeEventListener(temp)
  console.timeEnd("1");
  console.time("2")
  const userAta = getAssociatedTokenAddressSync(ele.mint, payer.publicKey)
  console.timeEnd("2");
  console.time("3")
  const associatedBondingCurve = getAssociatedTokenAddressSync(ele.mint, ele.bondingCurve, true);
  console.timeEnd("3");
  console.time("4")

  const data = await connection.getAccountInfo(ele.bondingCurve, { commitment: "processed" })

  console.log(data?.data);

  const tx = new Transaction()
  tx.add(
    createAssociatedTokenAccountInstruction(payer.publicKey, userAta, payer.publicKey, ele.mint)
  );
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 70000,
  });
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 80000000,
  })

  tx
    .add(modifyComputeUnits)
    .add(addPriorityFee)
    .add(
      await program.methods
        .buy(new BN(BUY_AMOUNT.toString()), new BN(MAX_SOL_COST.toString()))
        .accounts({
          feeRecipient: PUMPFUN_FEE_RECEIPT,
          mint: ele.mint,
          associatedBondingCurve: associatedBondingCurve,
          associatedUser: userAta,
          user: payer.publicKey,
        })
        .transaction()
    );

  tx.feePayer = payer.publicKey;
  console.timeEnd("4");

  console.time("5")
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  console.timeEnd("5");
  console.time("6")
  const sig = await sendAndConfirmTransaction(connection, tx, [payer], { preflightCommitment: "processed", commitment: "processed", skipPreflight: true })
  console.timeEnd("6");

  console.log(sig);
})

