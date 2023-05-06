import { BlockChain } from "./class/Blockchain"
import { Block } from "./class/Block"


const MyBlockChain = new BlockChain()

MyBlockChain.addBlock(new Block(Date.now().toString(), [{from: "Fede", to: "Mint", amount: 100}]))

console.log(MyBlockChain.chain);
