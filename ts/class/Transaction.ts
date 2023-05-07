import { ec } from 'elliptic';
import * as crypto from "crypto"
import { BlockChain, MINT_KEY_PAIR } from './Blockchain';

const SHA256 = (message: string | any) => {
    return crypto.createHash("sha256").update(message).digest("hex")
}

const enc = new ec("secp256k1")

export class Transaction {
    from: string;
    to: string;
    amount: number;
    gas: number;
    signature: string = "";

    constructor (from: string, to: string, amount: number, gas: number = 0) {
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.gas = gas; 
    }

    sign(keyPair: ec.KeyPair) {
        //Only sender can sign his transactions
        if(keyPair.getPublic("hex") === this.from) {
            this.signature = keyPair.sign(SHA256(this.from + this.to + this.amount + this.gas), "base64").toDER("hex")
        }
    }

    static isValid(transaction: Transaction, chain: BlockChain) : boolean {
        return (
            transaction.from && transaction.to && transaction.amount &&
            (chain.getBalance(transaction.from) >= transaction.amount + transaction.gas || transaction.from == MINT_KEY_PAIR.getPublic("hex")) &&
            enc.keyFromPublic(transaction.from, "hex").verify(SHA256(transaction.from + transaction.to + transaction.amount + transaction.gas), transaction.signature)

            ) as unknown as boolean
    }
}