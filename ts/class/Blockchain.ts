import { Block } from "./Block"

export class BlockChain {

    chain: Block[]
    difficulty: number;
    blocksPerEpoch: number = 2016;

    //constructor makes the first block
    constructor(){
        this.chain = [new Block(Date.now().toString())]   
        this.difficulty = 1
    }


    addBlock(block: Block) : void {
        block.prevHash = this.getLastBlock().hash   //linking the chain
        block.hash = block.getHash()
        block.mine(this.difficulty)

        //Freeze makes object immutable
        this.chain.push(Object.freeze(block))

        //Bitcoin difficulty update
        if(this.chain.length % this.blocksPerEpoch)
            this.updateDifficulty()
    }

    getLastBlock() : Block {
        return this.chain[this.chain.length - 1]
    }

    isValid(blockchain: BlockChain = this) : boolean {
        //Check for every node in the blockchain if they are correctly linked and valid
        for(let i = 1; i < this.chain.length; ++i){
            const current = this.chain[i];
            const prev = this.chain[i-1];

            if(current.hash != current.getHash() || prev.hash != current.prevHash)
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
}