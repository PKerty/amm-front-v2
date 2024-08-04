"use server";
import {ethers} from "ethers";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir } from "@noir-lang/noir_js";
import circuit from "../circuit/target/circuit2.json";

export async function generateProof(nonce, amount1, amount2, sender, token1, token2) {
    
    try {
        const backend = new BarretenbergBackend(circuit);
        const noir = new Noir(circuit);
        const input2 = {
            nonce: parseInt(nonce),
            amount1: parseInt(amount1),
            amount2: parseInt(amount2),
            sender,
            token1,
            token2,
            key : import.meta.env.VITE_PRIVATE_SEED,
        };
        const { witness } = await noir.execute(input2);
        const proof = await backend.generateProof(witness);

        return proof;
    } catch (e) {
        console.error(e);
    }
}