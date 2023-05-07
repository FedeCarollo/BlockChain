import * as crypto from "crypto"
import { BlockChain, MINT_KEY_PAIR } from "./Blockchain";
import { Transaction } from "./Transaction";

const SHA256 = (message: string | any) => {
    return crypto.createHash("sha256").update(message).digest("hex")
}

export class Block{
    timestamp: string;  //current timestamp
    data: any[];        //contains blocks and transactions
    prevHash: string;   //previous block hash
    hash: string;       //block's hash
    nonce: number;      //PoW  


    constructor(timestamp: string, data: any[] = []){
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = "";     //Will be updated by BlockChain class, because until we want it to be mined
        this.nonce = 0;        //starts from 0 in mine
        this.hash = this.getHash();
  
    }

    //Returns hash of the block
    getHash() {
        return SHA256(this.prevHash + this.timestamp + JSON.stringify(this.data) + this.nonce.toString())
    }

    mine(difficulty: number){
        difficulty = Math.floor(difficulty);   //parseInt della difficoltà

        //L'hash deve ritornare tanti zeri iniziali quanto è la difficoltà. 
        //Più zeri sono richiesti e più è difficile minare il blocco

        const toMatch = Array(difficulty).join("0")
        
        while(!this.hash.startsWith(toMatch)){
            this.nonce++;
            this.hash = this.getHash()
        }
    }

    hasValidTransactions(chain: BlockChain) : boolean {
        let gas = 0, reward = 0;

        this.data.forEach((transaction: Transaction) => {
            if(transaction.from !== MINT_KEY_PAIR.getPublic("hex")){
                gas += transaction.gas
            } else {
                reward = transaction.amount
            }
        })


        return (
            reward - gas === chain.reward &&    //Non si possono aggiungere reward diversi da quelli stabiliti
            this.data.every((transaction: Transaction) => Transaction.isValid(transaction, chain)) &&
            this.data.filter((transaction: Transaction) => transaction.from == MINT_KEY_PAIR.getPublic("hex")).length === 1
            )
    }

}

