import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { formatUnits, Hex, pad, zeroAddress } from "viem";
import { toCoinbaseSmartAccount } from "viem/account-abstraction";

import { NFT_ALIAS } from "@beincom/chain-client";

import useChainApiClient from "../../hooks/useBicChainClient";
import useNotification from "../../hooks/useNotification";
import useBicSmartWallet from "../../hooks/useBicSmartWallet";

import { ERC20Token, SIGNER_TYPE } from "../../types";
import LoginForm from "../../components/login-form";

import {
  OWNER_COINBASE_ACCOUNT,
} from "../../utils";
  console.log("🚀 ~ OWNER_COINBASE_ACCOUNT:", pad("0x27400DCBcbf8048eb16ccF3c856BF50BfE64D515"))

const DexAggregator: NextPage = () => {
  const chainClient = useChainApiClient();

  const [signerType, setSignerType] = useState<SIGNER_TYPE>(
    SIGNER_TYPE.PRIVATE_KEY
  );
  const [privateKey, setPrivateKey] = useState<Hex>(OWNER_COINBASE_ACCOUNT);
  const [supportTokens, setSupportTokens] = useState<ERC20Token[]>([]);
  const [hash, setHash] = useState<Hex>();

  const { notify } = useNotification();
  const { smartAccount,smartAccountAddress ,marketplace } = useBicSmartWallet();

  useEffect(() => {
    if(smartAccount) {
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

  const handleTransferERC20 = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    if(!marketplace) {
      return;
    }

    const amount = formatUnits(BigInt(1), 18);

    const txData = await smartAccount.getTransferERC20CallData({
      amount: "0.2",
      to: "0xd85bcA9b8A279Ed7cB03770644261F348E71D9E1",
      token: {
        address: "0xfc53d455c2694e3f25a02bf5a8f7a88520b77f07",
        decimals: 18,
      },
    });
    console.log("🚀 ~ handleTransferERC20 ~ txData:", txData);

    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData!.callData,
      },
      false
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
    if(!marketplace) {
      return;
    }

    const txData = await smartAccount.getTransferETHCallData({
      amount: "0.0000000000012",
      to: "0xe450584F78be9DdeA56A535125Aa400F67BAbA36",
    });

    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData!.callData,
      },
      true
    );
    console.log("🚀 ~ handleTransferETH ~ tx:", tx)
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
      }
    });
    console.log("🚀 ~ handleTransferERC20 ~ txData:", txData);

    const tx = await smartAccount?.executeTransactionWithCallData(
      {
        callData: txData?.calldata as Hex,
      },
      false
    );

    console.log("🚀 ~ handleTransferERC20 ~ tx:", tx);
  };

  const handleGetFee = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }

    smartAccount.checkUserOperation("0x865EC73E047AC8A77DD9F06CC2C5437A03733C2625F114A5FB03CC5F8949B32B");
  }
    

  const handleGetBalance = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    const allowance = await smartAccount.getAllowance({
      token: {
        address: "0xa8166BD637210470B55bb489aE8e4C936b5520C9",
        decimals: 18,
      },
      spender: "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
      owner: smartAccountAddress!,
    });
    console.log("🚀 ~ handleGetBalance ~ allowance:", allowance)

    const data = await smartAccount.getApproveCallData({
      amount: "123",
      spender: "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf",
      token: { 
        address: "0xa8166BD637210470B55bb489aE8e4C936b5520C9",
        decimals: 18,
      }
    });
    const tx = await smartAccount.executeTransactionWithCallData({
      callData: data.callData,
    }, false);
    console.log("🚀 ~ handleGetBalance ~ tx:", tx)
    // const balances = await smartAccount?.getBalances({
    //   accountAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    //   tokens: [
    //     {
    //       address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    //       symbol: "ETH",
    //       name: "ETH Coin",
    //       decimals: 18,
    //     },
    //     {
    //       address: "0xa8166BD637210470B55bb489aE8e4C936b5520C9",
    //       symbol: "BIC",
    //       name: "BIC",
    //       decimals: 18,
    //     },
    //     {
    //       address: "0xf0f9805c32936e14d8217f2df4145e45a82d0bcb",
    //       symbol: "BIC",
    //       name: "BIC",
    //       decimals: 18,
    //     },
    //   ],
    // });
    // console.log("🚀 ~ handleGetBalance ~ balances:", balances);
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
    const address = (await smartAccount.getAccount()).address

    const txData = await marketplace?.createAuction(address,{
      assetContract: "0xcC2f5d08Af7A54472dCDda8F575C5031Ac1056E1",
      tokenId: "85953578058066798493840950251408469963304994687806594278688616624242791137352",
      bidBufferBps: '900',
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
    console.log("🚀 ~ handleCreateAuction ~ tx:", tx)

  };

  const handleCreateListing = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }
    const address = (await smartAccount.getAccount()).address

    const txData = await marketplace?.createListing(address,{
      assetContract: "0xcC2f5d08Af7A54472dCDda8F575C5031Ac1056E1",
      tokenId: "104619109315199483478158034938143026495471375306508965611209822193894182809175",
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
    console.log("🚀 ~ handleCreateAuction ~ tx:", tx)

  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <LoginForm />
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
          <button
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            onClick={handleCreateNFT}
          >
            Create NFT
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
            onClick={handleGetBalance}
          >
            Get Balances
          </button>
          <button
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            onClick={handleBoughtOut}
          >
            BuyOut
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
            Bid auction
          </button>
          <button
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            onClick={handleCreateListing}
          >
            Create Listing
          </button>
          <button
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            onClick={handleGetFee}
          >
            Check gas by userOp
          </button>
        </div>
      </div>
    </div>
  );
};

export default DexAggregator;
