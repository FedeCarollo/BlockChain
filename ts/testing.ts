import { BlockChain, firstHolder } from "./class/Blockchain"
import { Block } from "./class/Block"
import { ec } from "elliptic"
import { Transaction } from "./class/Transaction"


const MyBlockChain = new BlockChain()
const enc = new ec("secp256k1")


console.log(MyBlockChain.chain);



const anotherWallet = enc.genKeyPair()

const transaction = new Transaction(firstHolder.getPublic("hex"), anotherWallet.getPublic("hex"), 100, 10)

transaction.sign(firstHolder)

MyBlockChain.addTransaction(transaction)

MyBlockChain.mineTransactions(anotherWallet.getPublic("hex"))


console.log("Holder balance: ", MyBlockChain.getBalance(firstHolder.getPublic("hex")));
console.log("Receiver balance: ", MyBlockChain.getBalance(anotherWallet.getPublic("hex")));



