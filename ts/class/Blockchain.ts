import { Block } from "./Block"
import { Transaction } from "./Transaction";
import { ec } from 'elliptic';


//TODO move away
const enc = new ec("secp256k1")

export const MINT_KEY_PAIR = enc.genKeyPair()
const MINT_PUBLIC_ADDRESS = MINT_KEY_PAIR.getPublic("hex")

//TODO modify
export const firstHolder = enc.genKeyPair()


export class BlockChain {

    chain: Block[]
    difficulty: number;
    blocksPerEpoch: number = 2016;

    transactions: Transaction[]     //pending transactions
    reward: number;



    //constructor makes the first block
    constructor(){
        const initialCoinRelease = new Transaction(MINT_PUBLIC_ADDRESS, firstHolder.getPublic("hex"), 10000)

        this.chain = [new Block(Date.now().toString(), [initialCoinRelease])]   
        this.difficulty = 1
        this.transactions = []
        this.reward = 300;
    }


    addBlock(block: Block) : void {
        block.prevHash = this.getLastBlock().hash   //linking the chain
        block.hash = block.getHash()

        if(block.hasValidTransactions(this)){
            block.mine(this.difficulty)

            //Freeze makes object immutable
            this.chain.push(Object.freeze(block))
    
            //Bitcoin difficulty update
            if(this.chain.length % this.blocksPerEpoch == 0)
                this.updateDifficulty()
        } else {
            throw new Error("Transactions not valid")
        }


    }

    getLastBlock() : Block {
        return this.chain[this.chain.length - 1]
    }

    isValid(blockchain: BlockChain = this) : boolean {
        //Check for every node in the blockchain if they are correctly linked and valid
        for(let i = 1; i < this.chain.length; ++i){
            const current = this.chain[i];
            const prev = this.chain[i-1];

            if(current.hash != current.getHash() || prev.hash != current.prevHash ||
               !current.hasValidTransactions(blockchain))
                return false;
        }
        return true;
    }

    //new difficulty is based on the last 2016 blocks
    // new = old * 2016 blocks * 10 minutes / minutes to mine the last 2016 blocks
    //The updated difficulty is limited by 300% upper bound (4x) and -75% lower bound (1/4)
    updateDifficulty() : void {
        let new_diff = this.difficulty * 20160
        const i = this.chain.length - 1;
        const interval : number = Date.parse(this.chain[i].timestamp) - Date.parse(this.chain[i - this.blocksPerEpoch + 1].timestamp)

        //interval has the milliseconds
        const minutesPassed = interval / (60000)

        new_diff = new_diff / minutesPassed

        if(new_diff < 0.25 * this.difficulty){
            this.difficulty *= 0.25
        }
        else if(new_diff > 4 * this.difficulty){
            this.difficulty *= 4
        }
        else{
            this.difficulty = new_diff
        }

    }


    addTransaction(transaction: Transaction) : void{
        if(Transaction.isValid(transaction, this))
            this.transactions.push(transaction);
    }

    mineTransactions(minerAddress: string) {
        let gas = 0

        this.transactions.forEach(tx => {gas += tx.gas})
        //TODO every block can mine only a specified amount of transactions in one block
        const rewardTransaction = new Transaction(MINT_PUBLIC_ADDRESS, minerAddress, this.reward + gas)

        rewardTransaction.sign(MINT_KEY_PAIR)

        if(this.transactions.length != 0){
            this.addBlock(new Block(Date.now().toString(), [rewardTransaction, ...this.transactions]))
            this.transactions = []
        }

    }

    getBalance(address: string) {
        let balance = 0;

        this.chain.forEach((block : Block) => {
            block.data.forEach((transaction : Transaction) => {
                if(transaction.from === address){
                    balance -= transaction.amount
                    balance -= transaction.gas
                }
                else if (transaction.to === address){
                    balance += transaction.amount;
                }
            })
        })
        return balance
    }


}