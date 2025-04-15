import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { formatUnits, Hex, pad, zeroAddress, keccak256, encodeAbiParameters, toHex, Address, parseUnits } from "viem";
import { entryPoint06Address, toCoinbaseSmartAccount } from "viem/account-abstraction";

import { DEX_AGGREGATOR_TYPE, NFT_ALIAS, SWAP_EXACT } from "@beincom/chain-client";

import useChainApiClient from "../../hooks/useBicChainClient";
import useNotification from "../../hooks/useNotification";
import useBicSmartWallet from "../../hooks/useBicSmartWallet";

import { ERC20Token, SIGNER_TYPE } from "../../types";
import LoginForm from "../../components/login-form";

import { OWNER_COINBASE_ACCOUNT } from "../../utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { NATIVE_TOKEN_ADDRESS } from "@beincom/aa-coinbase";
import { bicTokenAbi } from "../../utils/bic-token.abi";
import { arbitrum } from "viem/chains";
console.log(
  "🚀 ~ OWNER_COINBASE_ACCOUNT:",
  pad("0x27400DCBcbf8048eb16ccF3c856BF50BfE64D515"),
);

const DexAggregator: NextPage = () => {
  const chainClient = useChainApiClient();

  const [signerType, setSignerType] = useState<SIGNER_TYPE>(
    SIGNER_TYPE.PRIVATE_KEY
  );
  const [privateKey, setPrivateKey] = useState<Hex>(OWNER_COINBASE_ACCOUNT);
  const [supportTokens, setSupportTokens] = useState<ERC20Token[]>([]);
  const [hash, setHash] = useState<Hex>();

  const { notify } = useNotification();
  const { smartAccount, smartAccountAddress, marketplace, paymentService } =
    useBicSmartWallet();
  console.log("🚀 ~ smartAccountAddress:", smartAccountAddress)

  useEffect(() => {
    if (smartAccount) {
      smartAccount?.on("transaction_receipt", (data) => {
        console.log("🚀 ~ smartAccount?.on ~ data", data);
      });
    }
  }, [smartAccount]);

  const handleCreateNFT = async () => {
    console.log("Create NFT");
    if (!chainClient) {
      return;
    }

    const data = await chainClient.nft.signMintRequest({
      nftType: "bcnft" as any,
      value: "thigia:" + Date.now(),
    });
    console.log("🚀 ~ handleCreateNFT ~ data:", data);

    const txData = await smartAccount?.getRequestHandleCallData({
      payload: data,
    });

    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData!.callData,
      },
      false
    );

    console.log("🚀 ~ handleCreateNFT ~ tx:", tx);
  };

  const handleApproveERC20 = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    if (!marketplace) {
      return;
    }


    const txData = await smartAccount.getApproveCallData({
      amount: "0.001",
      spender: "0xB1C3960aeeAf4C255A877da04b06487BBa698386",
      token: {
        address: "0x90675445BD3297431E7424c17474985eE676Cc69",
        decimals: 18,
      },
    });
    console.log("🚀 ~ handleApproveERC20 ~ txData:", txData)

    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData!.callData,
      },
      true
    );

    console.log("🚀 ~ handleTransferERC20 ~ tx:", tx);
  };

  const handleTransferERC20Mainnet = async () => {
    if (!smartAccount) {
      return;
    }

    const publicClient = smartAccount.publicClient;
    const SLOT_MAPPING_BALANCES = BigInt(1);
    const SLOT_MINSWAPBACK = BigInt(28);
    const SLOT_ACCUMULATE_LF = BigInt(26);
    const blockNumber = BigInt(324761860);
    const bicAddress = "0xB1C3960aeeAf4C255A877da04b06487BBa698386";

    const balance = await publicClient.getStorageAt({
      address: bicAddress,
      slot: keccak256(
        encodeAbiParameters(
          [{ type: 'address' }, { type: 'uint256' }],
          [bicAddress, SLOT_MAPPING_BALANCES]
        )
      ),
    });
    console.log("🚀 ~ handleTransferERC20Mainnet ~ balance:", balance)
    const minSwapBackAmount = await publicClient.getStorageAt({
      address: bicAddress,
      slot: toHex(SLOT_MINSWAPBACK),
      // blockNumber: blockNumber,
      // blockTag: undefined
    });

    const accumulateLf = await publicClient.getStorageAt({
      address: bicAddress,
      slot: toHex(SLOT_ACCUMULATE_LF),
    });
    console.log("🚀 ~ handleTransferERC20Mainnet ~ accumulateLf:", accumulateLf)
    // const minSwapBackAmount = await publicClient.readContract({
    //   address: bicAddress,
    //   abi: bicTokenAbi,
    //   functionName: "minSwapBackAmount",

    // });
    const balanceOf = await publicClient.readContract({
      address: bicAddress,
      abi: bicTokenAbi,
      functionName: "balanceOf",
      args: [bicAddress],
      // blockNumber
    });
    console.log("🚀 ~ handleTransferERC20Mainnet ~ balanceOf:", balanceOf)
    console.log("🚀 ~ handleTransferERC20Mainnet ~ minSwapBackAmount:", minSwapBackAmount)
    try {
      const txData = await smartAccount.getApproveCallData({
        amount: "0.00001",
        spender: "0x11e479dc86dda6a435c504b8ff17bcdba2a8dfe3",
        token: {
          address: "0xB1C3960aeeAf4C255A877da04b06487BBa698386",
          decimals: 18,
        },
      });
  
      const tx = await smartAccount?.executeTransactionWithCallData(
        {
          callData: txData!.callData,
        },
        true
      );
      console.log("🚀 ~ handleTransferERC20 ~ tx:", tx);
  
    } catch (error) {
      console.log("🚀 ~ handleTransferERC20Mainnet ~ error:", error)
      
    }
  };

  const handleSwapTokens = async () => {
    if (!smartAccount) {
      return;
    }

    if (!chainClient) {
      return;
    }

    try {
      // Example swap parameters
      const fromToken = {
        address: "0x3A8f583b44fC86C32C192A377cb5e861310f869D", // BIC token
        decimals: 18,
      };
      
      const toToken = {
        address: NATIVE_TOKEN_ADDRESS, // ETH
        decimals: 18,
      };
      
      const amount = "1000"; // Amount to swap
      // const res =  await chainClient.wallet.getQuotes({
      //   amount: parseUnits(amount, fromToken.decimals).toString(),
      //   chainId: arbitrum.id.toString(),
      //   tokenIn: fromToken.address as Address,
      //   tokenOut: toToken.address as Address,
      //   recipient: smartAccountAddress!,
      //   sender: smartAccountAddress!,
      //   swapExact: SWAP_EXACT.EXACT_IN,
      //   slippageTolerance: 2000,
      // })
      // if(res.quotes.length === 0) {
      //   return;
      // }
      // const quote = res.quotes[0];
      // const swapData = await chainClient.wallet.buildQuote({
      //   chainId: arbitrum.id.toString(),
      //   dexType: quote.dexType,
      //   quoteRaw: quote.quoteRaw,
      //   deadline: 1000000000,
      //   sender: smartAccountAddress!,
      //   recipient: smartAccountAddress!,
      //   slippageTolerance: 2000,
      // })
      // console.log("🚀 ~ handleSwapTokens ~ swapData:", swapData)
      // console.log("🚀 ~ handleSwapTokens ~ res:", res)
      // Execute the swap transaction
      const tx = await smartAccount.executeTransactionWithCallData(
        {
          callData: "0x34fcd5be000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000002600000000000000000000000003a8f583b44fc86c32c192a377cb5e861310f869d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044095ea7b3000000000000000000000000000000000022d473030f116ddee9f6b43ac78ba300000000000000000000000000000000000000000000003635c9adc5dea0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000022d473030f116ddee9f6b43ac78ba300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000008487517c450000000000000000000000003a8f583b44fc86c32c192a377cb5e861310f869d000000000000000000000000a51afafe0263b40edaef0df8781ea9aa03e381a300000000000000000000000000000000000000000000003635c9adc5dea000000000000000000000000000000000000000000000000000000000000067fcd5e800000000000000000000000000000000000000000000000000000000000000000000000000000000a51afafe0263b40edaef0df8781ea9aa03e381a30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000003253593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000067fccee0000000000000000000000000000000000000000000000000000000000000000308060c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000003635c9adc5dea00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000003a8f583b44fc86c32c192a377cb5e861310f869d00000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1000000000000000000000000000000000000000000000000000000000000006000000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab100000000000000000000000089f30783108e2f9191db4a44ae2a516327c995750000000000000000000000000000000000000000000000000000000000000019000000000000000000000000000000000000000000000000000000000000004000000000000000000000000090675445bd3297431e7424c17474985ee676cc690000000000000000000000000000000000000000000000000000000024bb8a8b0c000000000000000000000000000000000000000000000000000000",
        },
        false
      );
      
      console.log("🚀 ~ handleSwapTokens ~ tx:", tx);

    } catch (error) {
      console.log("🚀 ~ handleSwapTokens ~ error:", error);
      
    }
  };

  const handleTransferERC20 = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    if (!marketplace) {
      return;
    }

    const amount = formatUnits(BigInt(1), 18);

    const txData = await smartAccount.getTransferERC20CallData({
      amount: "0.2",
      to: "0x8a99785fa4f290f96592667b4ff8b8c2a98a760f",
      token: {
        address: "0x00a2a54e483395f507663a9182c92de4408ed5ac",
        decimals: 18,
      },
    });

    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData!.callData,
      },
      true
    );

    console.log("🚀 ~ handleTransferERC20 ~ tx:", tx);
  };

  const handleTransferETH = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    if (!marketplace) {
      return;
    }

    const txData = await smartAccount.getTransferCallData({
      amount: "0.0000000000012",
      to: "0xe450584F78be9DdeA56A535125Aa400F67BAbA36",
      token: {
        address: NATIVE_TOKEN_ADDRESS,
        decimals: 18,
      }
    });

    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData!.callData,
      },
      false
    );
    console.log("🚀 ~ handleTransferETH ~ tx:", tx);
  };

  const handleBidAuction = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }

    const auctionId = "5";
    const txData = await marketplace?.bidInAuction({
      auctionId: auctionId,
      bidAmount: "2500",
      currency: {
        address: "0xa8166BD637210470B55bb489aE8e4C936b5520C9",
        decimals: 18,
      },
    });

    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData?.calldata as Hex,
      },
      false
    );

    console.log("🚀 ~ handleTransferERC20 ~ tx:", tx);
  };

  const handleCheckUserOp = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }

    smartAccount.checkUserOperation(
      "0x92F85CD3CD215BCC2C78737920793606DF103997B1AF9EC391FE0ACFCC45E37B"
    );
  };

  const handleTestChainClient = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    console.log("🚀 ~ handleTestChainClient ~ smartAccount:", chainClient)

    try {
      const test = await chainClient.wallet.proxyPaymentUrl({
        entryPoint06Address: entryPoint06Address,
        order: {
          id: "123",
        },
        paymentUrl: "https://payapi.beincom.io/v1/payment/operator/products/purchase",
        userOp: {
          initCode:"0x",
          callData: "0x",
          callGasLimit: "100000",
          maxFeePerGas: "1000000000",
          maxPriorityFeePerGas: "1000000000",
          nonce: "1",
          preVerificationGas: "100000",
          sender: smartAccountAddress!,
          verificationGasLimit: "100000",
        },
      })
      console.log("🚀 ~ handleTestChainClient ~ test:", test)
    } catch (error) {
      console.log("🚀 ~ handleTestChainClient ~ error:", error)
      
    }
  }
  

  const handleGetBalance = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    const balances = await smartAccount?.getBalances({
      accountAddress: "0x90675445BD3297431E7424c17474985eE676Cc69",
      tokens: [
        {
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          symbol: "ETH",
          name: "ETH Coin",
          decimals: 18,
        },
        {
          address: "0xa8166BD637210470B55bb489aE8e4C936b5520C9",
          symbol: "BIC",
          name: "BIC",
          decimals: 18,
        },
        {
          address: "0xf0f9805c32936e14d8217f2df4145e45a82d0bcb",
          symbol: "BIC",
          name: "BIC",
          decimals: 18,
        },
      ],
    });
    console.log("🚀 ~ handleGetBalance ~ balances:", balances);
  };

  const handleBoughtOut = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    const auctionId = "109";
    // const requestBuyOut = await chainClient.nft.requestBuyOutAuction(auctionId);
    // const boughtOutTx = smartAccount.getBidBoughtOutAuctionCallData({
    //   auctionId: auctionId,
    //   bidAmount: "1000",
    //   currency: {
    //     decimals: 18,
    //     address: "0xa8166BD637210470B55bb489aE8e4C936b5520C9",
    //     name: "",
    //     symbol: "",
    //   },
    //   requestPayload: requestBuyOut,
    // });
    // console.log("🚀 ~ handleBoughtOut ~ boughtOutTx:", boughtOutTx);
  };

  const handleCreateAuction = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    const address = (await smartAccount.getAccount()).address;

    const txData = await marketplace?.createAuction(address, {
      assetContract: "0xcC2f5d08Af7A54472dCDda8F575C5031Ac1056E1",
      tokenId:
        "85953578058066798493840950251408469963304994687806594278688616624242791137352",
      bidBufferBps: "900",
      buyoutBidAmount: "1000",
      currency: {
        decimals: 18,
        address: "0xFc53d455c2694E3f25A02bF5a8F7a88520b77F07",
      },
      startTimestamp: Math.floor(Date.now() / 1000).toString(),
      endTimestamp: (Math.floor(Date.now() / 1000) + 60 * 60 * 24).toString(),
      timeBufferInSeconds: "900",
      minimumBidAmount: "1",
      quantity: "1",
    });
    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData?.calldata as Hex,
      },
      false
    );
    console.log("🚀 ~ handleCreateAuction ~ tx:", tx);
  };

  const handleCreateListing = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    const address = (await smartAccount.getAccount()).address;

    const txData = await marketplace?.createListing(address, {
      assetContract: "0xcC2f5d08Af7A54472dCDda8F575C5031Ac1056E1",
      tokenId:
        "104619109315199483478158034938143026495471375306508965611209822193894182809175",
      pricePerToken: "1",
      quantity: "1",
      reserved: false,
      currency: {
        decimals: 18,
        address: "0xFc53d455c2694E3f25A02bF5a8F7a88520b77F07",
      },
      startTimestamp: Math.floor(Date.now() / 1000).toString(),
      endTimestamp: (Math.floor(Date.now() / 1000) + 60 * 60 * 24).toString(),
    });
    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData?.calldata as Hex,
      },
      false
    );
    console.log("🚀 ~ handleCreateAuction ~ tx:", tx);
  };

  const handleBuyAccount = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    const ownerAddress = (await smartAccount.getAccount()).address;
    const orderPayload = {
      orderId: "1111-1111-1111-1111",
    }
    const txData = await paymentService?.getBuyAccountCallData({
      token: {
        decimals: 18,
        address: "0x00a2a54e483395f507663a9182c92de4408ed5ac",
      },
      amount: "1.1",
      accountAddress: ownerAddress,
      to: "0xeaBcd21B75349c59a4177E10ed17FBf2955fE697",
      orderId: orderPayload.orderId,
    });
    // const fee = await smartAccount?.executeTransactionWithCallData(
    //   {
    //     callData: txData?.calldata as Hex,
    //   },
    //   true
    // );
    // console.log("🚀 ~ handleCreateAuction ~ fee:", fee);
    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData?.calldata as Hex,
        orderPayload,
      },
      false
    );
    console.log("🚀 ~ handleBuyAccount ~ tx:", tx)
  };

  const handleGetPaymentFee = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    const ownerAddress = (await smartAccount.getAccount()).address;

    const token  = {
      address: "0xFc53d455c2694E3f25A02bF5a8F7a88520b77F07",
      decimals: 18,
    }
    const balance = await smartAccount.getBalances({
      accountAddress: ownerAddress,
      tokens: [
        token
      ],
    })
    console.log("🚀 ~ handleGetPaymentFee ~ balance:", balance)
    const orderPayload = {
      orderId: "1111-1111-1111-1111",
    }
    const txData = await paymentService?.buyAccount({
      payload: {
        token,
        amount: "0.00000001",
        accountAddress: ownerAddress,
        to: "0xeaBcd21B75349c59a4177E10ed17FBf2955fE697",
        orderId: orderPayload.orderId,
        submitCode:"123123"
      },
      order: orderPayload,
    }, false);
    console.log("🚀 ~ handleGetPaymentFee ~ txData:", txData)

  }

  const handleGetOwners = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    const owners = await smartAccount.getOwners();
    console.log("🚀 ~ handleGetOwners ~ owners:", owners);
  };

  const handleSetupSmartAccount = async () => {
    if (!smartAccount) {
      return;
    }
    try {
      await smartAccount.setupSmartAccount();
      console.log("🚀 ~ handleSetupSmartAccount ~ Smart Account setup complete");
    } catch (error) {
      console.error("🚀 ~ handleSetupSmartAccount ~ error:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <LoginForm />
      </div>
      <div className="mb-4">
        <ConnectButton />
      </div>
      <div>
        {smartAccount && (
          <div className="m-6 p-6 w-full mx-auto border rounded-lg shadow-lg bg-white">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Account</h2>
              <p>Address: {smartAccountAddress}</p>
            </div>
          </div>
        )}
      </div>

      <div className="m-6 p-6 w-full mx-auto border rounded-lg shadow-lg bg-white">
        <div className="mb-4 flex flex-col gap-4">
          {/* Account Management */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Account Management</h3>
            <div className="flex flex-col gap-2">
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleSetupSmartAccount}
              >
                Setup Smart Account
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleGetBalance}
              >
                Get Balances
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleGetOwners}
              >
                Get Owners
              </button>
            </div>
          </div>

          {/* Token Operations */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Token Operations</h3>
            <div className="flex flex-col gap-2">
            <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleApproveERC20}
              >
                Approve ERC20
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleTransferERC20}
              >
                Transfer ERC20
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleTransferETH}
              >
                Transfer ETH
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleTransferERC20Mainnet}
              >
                Transfer ERC20 Mainnet
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleSwapTokens}
              >
                Swap Tokens
              </button>
            </div>
          </div>

          {/* NFT Operations */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">NFT Operations</h3>
            <div className="flex flex-col gap-2">
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleCreateNFT}
              >
                Create NFT
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleCreateAuction}
              >
                Create Auction
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleBidAuction}
              >
                Bid Auction
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleBoughtOut}
              >
                BuyOut
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleCreateListing}
              >
                Create Listing
              </button>
            </div>
          </div>

          {/* Premium Features */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Premium Features</h3>
            <div className="flex flex-col gap-2">
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleBuyAccount}
              >
                Buy Premium Account
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleGetPaymentFee}
              >
                Get Payment Fee
              </button>
            </div>
          </div>

          {/* System Operations */}
          <div>
            <h3 className="text-lg font-semibold mb-3">System Operations</h3>
            <div className="flex flex-col gap-2">
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleTestChainClient}
              >
                Test Chain Client
              </button>
              <button
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                onClick={handleCheckUserOp}
              >
                Check by UserOp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DexAggregator;
