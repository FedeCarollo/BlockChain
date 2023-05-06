import { Block } from "./Block"

export class BlockChain {

    chain: Block[]
    difficulty: number;

    //constructor makes the first block
    constructor(){
        this.chain = [new Block(Date.now().toString())]   
        this.difficulty = 1
    }


    addBlock(block: Block){
        block.prevHash = this.getLastBlock().hash   //linking the chain
        block.hash = block.getHash()
        block.mine(this.difficulty)

        //Freeze makes object immutable
        this.chain.push(Object.freeze(block))
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1]
    }

    isValid(blockchain: BlockChain = this){
        //Check for every node in the blockchain if they are correctly linked and valid
        for(let i = 1; i < this.chain.length; ++i){
            const current = this.chain[i];
            const prev = this.chain[i-1];

            if(current.hash != current.getHash() || prev.hash != current.prevHash)
                return false;
        }
        return true;
    }
}