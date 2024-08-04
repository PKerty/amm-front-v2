"use client";
import React from "react";
import Navbar from "./Navbar";
import arrows from "../assets/arrows.png";
import TokenInput from "./TokenInput";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { generateProof } from "../../server-actions";
import PILeftCore from "../contracts/PILeftCore.json";
import ERC20 from "../contracts/ERC20.json";
import Web3 from "web3"

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function AmmInterface() {
  const wethProps = {
    tokenName: "Wrapped Ethereum",
    id: "WETH",
    address: "0x6F6D6d5f9729a5083AFd01ecE58E43002633D493",
  };
  const btcProps = {
    tokenName: "Bitcoin",
    id: "BTC",
    address: "0x0d475b30d699E755Be692D8a5a33FF302bcc4827",
  };

  const [swapped, setSwapped] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract>();
  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        // Initialize contract
        const contractAddress = PILeftCore.address;
        const contractABI = PILeftCore.abi;
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );
        setContract(contractInstance);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  };

  const handleSwitch = () => {
    setSwapped(!swapped);
  };

  const getSignature = async (value: string) => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        let tokenProps = swapped ? btcProps : wethProps;

        // These values should come from your contract or be passed as parameters
        const chainId = (await provider.getNetwork()).chainId;
        const tokenName = tokenProps.tokenName;
        const contractAddress = tokenProps.address; // Replace with your contract address
        const tokenVersion = "1";

        // Create contract instance to get nonce
        const tokenAbi = ERC20.abi;
        const tokenContract = new ethers.Contract(
          contractAddress,
          tokenAbi,
          provider,
        );
        console.log("tokenContract:", tokenContract);
        const nonce = await tokenContract.nonces(address);
        // Prepare permit data
        const domain = {
          name: tokenName,
          version: tokenVersion,
          chainId: chainId,
          verifyingContract: contractAddress,
        };

        const types = {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        };
        const values = {
          owner: address,
          spender: await contract?.getAddress(), // Replace with the spender's address
          value: ethers.parseEther(value), // Amount to approve
          nonce: nonce,
          deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        };

        // Sign the permit
        const signature = await signer.signTypedData(domain, types, values);
        const { v, r, s } = ethers.Signature.from(signature);
        return { values, v, r, s }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    }
  }

  const genPermit = async (address, signer, provider, props) => {
    console.log("permite for token", props.address)
    try{
      // These values should come from your contract or be passed as parameters
      const chainId = (await provider.getNetwork()).chainId;
      const tokenName = props.tokenName;
      const contractAddress = props.address; // Replace with your contract address
      const tokenVersion = "1";
      const value = ethers.parseEther("0.1");

      // Create contract instance to get nonce
      const tokenAbi = ERC20.abi;
      const tokenContract = new ethers.Contract(
        contractAddress,
        tokenAbi,
        provider,
      );
      console.log("tokenContract:", tokenContract);
      const nonce = await tokenContract.nonces(address);
      // Prepare permit data
      const domain = {
        name: await tokenContract.name(),
        version: tokenVersion,
        chainId: 534351,
        verifyingContract: contractAddress,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };
      const values = {
        owner: "0x4E6a7FE260Ef91899D41eC762f79b05f8E195932",
        spender: "0xd33ccb833C42431b14687228377872C683244502", // Replace with the spender's address
        value, // Amount to approve
        nonce: parseInt(nonce.toString()),
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      // Sign the permit
       const signature = await signer.signTypedData(domain, types, values);
      const { v, r, s } = ethers.Signature.from(signature);
      return { values, v, r, s }
    }catch(err) {
      console.error(err);
    }
  }
  const handleAddLiquidity = async () => {
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const contractAddress = PILeftCore.address;
        const contractABI = PILeftCore.abi;
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );
        const nonce = await contractInstance.nonces(address);
        const proof = await generateProof(nonce, ethers.parseEther("0.1"), ethers.parseEther("0.1"),address, wethProps.address, btcProps.address);
        alert("proof made - this is the proof hash:" + proof?.publicInputs[6]);
        let beginSwapTxn = await contractInstance?.initiateSwap(proof?.proof);
        let res = await provider.waitForTransaction(beginSwapTxn.hash);
        alert("proof uploaded: check your transactions")

        const wethPermit = await genPermit(address, signer, provider, wethProps);
        console.log("eth:", wethPermit);
        const btcPermit = await genPermit(address, signer, provider, btcProps);
        console.log("btc:", btcPermit);
        const am = ethers.parseEther("0.1");
        const spender = await contractInstance!.getAddress();
        // Encode the function data
    const data = contractInstance?.interface.encodeFunctionData('executeMint', [am, am, wethProps.address, btcProps.address, 1, 
      {
        owner:address,
        spender,
        value:am,
        deadline:wethPermit!.values.deadline,
        v: wethPermit?.v,
        r:wethPermit?.r,
        s: wethPermit?.s
      },
      {
        owner:address,
        spender,
        value:am,
        deadline:btcPermit!.values.deadline,
        v: btcPermit?.v,
        r:btcPermit?.r,
        s: btcPermit?.s
      }
      , proof?.publicInputs[6]])
    // Estimate the gas limit
    const estimatedGasLimit = await provider.estimateGas({
      to: contractAddress,
      data: data
    });
    console.log('Estimated Gas Limit:', estimatedGasLimit.toString());

    // Set the gas limit (adding some extra buffer)
    const gasLimit = estimatedGasLimit + ethers.toBigInt(100000);

    // Define the transaction
    const tx = {
      to: contractAddress,
      data: data,
      gasLimit: gasLimit
    };

    // Send the transaction
    const txResponse = await signer.sendTransaction(tx);
    const receipt = await txResponse.wait();
    console.log('Transaction mined:', receipt);
        console.log(tx);
    } catch (error) {
      console.error(error);
    }
  }

  const handleClick = async () => {
    const sig = await getSignature("1");
    const web3 = new Web3();
    try {
      
      let a1 = "0x0000000000000000000000000000000000000000000000000000000000000001";
      let a2 = "0x0000000000000000000000000000000000000000000000000000000000000001";
      let t1 = "0x0000000000000000000000006f6d6d5f9729a5083afd01ece58e43002633d493";
      let t2 = "0x0000000000000000000000000d475b30d699e755be692d8a5a33ff302bcc4827";
      let hash = "0x2caa50b60e630880c775f72fd5d92d2a170090c5fe3501874b00f1c9714475de";
      await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        // Initialize contract
        const contractAddress = PILeftCore.address;
        const contractABI = PILeftCore.abi;
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );
      let owner = account;
      let spender = contractInstance?.getAddress();
      let value = ethers.parseEther("1");
      let deadline = sig?.values.deadline;
      let v = sig?.v;
      // let r = ethers.encodeBytes32String(sig!.r);
      // let s = ethers.encodeBytes32String(sig!.s);
      let r = sig!.r;
      let s = sig!.s;
      let hashB32 = web3.utils.asciiToHex(hash);
      let rB32 = web3.utils.asciiToHex(r);
      let sB32 = web3.utils.asciiToHex(s);
      console.log(sig);
      // let tx = contract!.
      let tx = await contractInstance!.executeSwap(
      ethers.parseEther("1"), ethers.parseEther("1"), wethProps.address, btcProps.address, 0, 
      {owner,
          spender,
          value,
          deadline,
          v, 
          r,
          s
        },hash
      );
    } catch (error) {
      if (error.error && error.error.data) {
        const reason = ethers.toUtf8String('0x' + error.error.data.substr(138));
        console.error('Revert reason:', reason);
      } else {
        console.error('Transaction error:', error);
      }
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    let token1 = swapped ? btcProps.address : wethProps.address;
    let token2 = swapped ? wethProps.address : btcProps.address;
    let amount1 = swapped ? formData.get("destinationTokenValue") : formData.get("originalTokenValue");
    let amount2 = swapped ? formData.get("originalTokenValue") : formData.get("destinationTokenValue");
    let sender = account;
    let nonce = await contract?.nonces(sender);
    console.log("gettingProof...")
    let proof = await generateProof(nonce, amount1, amount2, token1, token2, sender);
    console.log("proof:", proof);

    let beginSwapTxn = await contract?.initiateSwap(proof?.proof);
    let receipt = await beginSwapTxn?.wait();
    console.log("receipt:", receipt);
    //aca deberia lanzar un modal que cargue o algo asi
    let signatureResult = await getSignature(amount1 as string);
    console.log(signatureResult);

    let publicValues = proof!.publicInputs;
    nonce = publicValues[0];
    let t1 = publicValues[1];
    let a1 = publicValues[2];
    let a2 = publicValues[3];
    let t2 = publicValues[4]
    let hash = publicValues[6];
    let permitData = {
      owner: signatureResult?.values.owner,
      spender: signatureResult?.values.spender,
      value: signatureResult?.values.value,
      nonce: signatureResult?.values.nonce,
      deadline: signatureResult?.values.deadline,
      v: signatureResult?.v,
      r: signatureResult?.r,
      s: signatureResult?.s
    }
    console.log("permitData:", permitData);
    let finalizeSwapTx = await contract?.executeSwap(a1, a2, t1, t2, 0, {}, hash);
    console.log(finalizeSwapTx);
  };
  return (
    <div>
      <Navbar account={account} />
      <div className="container mx-auto p-4 w-96">
        {account ? (
          <div>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-4">
              <form className="mb-4" onSubmit={handleSubmit}>
                <div
                  className={`flex ${swapped ? "flex-col-reverse" : "flex-col"} items-center`}
                >
                  <TokenInput tokenProps={wethProps} name="originalToken" />
                  <div className="mb-2 mt-2">
                    <img
                      className="cursor-pointer"
                      src={arrows}
                      width="80"
                      height="80"
                      alt="Interchange Original Token with Destination Token"
                      onClick={handleSwitch}
                    />
                  </div>
                  <TokenInput
                    tokenProps={btcProps}
                    name="destinationToken"
                  />
                </div>
                <div className="flex items-center justify-center mt-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                  >
                    Begin Swap
                  </button>

                </div>
              </form>
              
              <button onClick={handleAddLiquidity}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                add liquidity to pool
              </button>
            </div>
          </div>
        ) : (
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}