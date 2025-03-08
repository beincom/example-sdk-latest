import type { NextPage } from "next";
import { useState } from "react";
import { formatUnits, Hex, zeroAddress } from "viem";

import { NFT_ALIAS } from "@beincom/chain-client";

import useChainApiClient from "../../hooks/useBicChainClient";
import useNotification from "../../hooks/useNotification";
import useBicSmartWallet from "../../hooks/useBicSmartWallet";

import { ERC20Token, SIGNER_TYPE } from "../../types";
import LoginForm from "../../components/login-form";

import {
  OWNER_COINBASE_ACCOUNT,
} from "../../utils";

const DexAggregator: NextPage = () => {
  const chainClient = useChainApiClient();

  const [signerType, setSignerType] = useState<SIGNER_TYPE>(
    SIGNER_TYPE.PRIVATE_KEY
  );
  const [privateKey, setPrivateKey] = useState<Hex>(OWNER_COINBASE_ACCOUNT);
  const [supportTokens, setSupportTokens] = useState<ERC20Token[]>([]);
  const [hash, setHash] = useState<Hex>();

  const { notify } = useNotification();
  const { smartAccount, marketplace } = useBicSmartWallet();

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
    console.log("🚀 ~ handleTransferERC20 ~ amount:", amount);
    const txData = await smartAccount.getTransferERC20CallData({
      amount: "1.2",
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
      true
    );

    console.log("🚀 ~ handleTransferERC20 ~ tx:", tx);
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

  const handleGetBalance = async () => {
    if (!chainClient) {
      return;
    }
    if (!smartAccount) {
      return;
    }

    const balances = await smartAccount?.getBalances({
      accountAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
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

  return (
    <div className="w-full">
      <div className="mb-4">
        <LoginForm />
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
            onClick={handleBidAuction}
          >
            Bid auction
          </button>
        </div>
      </div>
    </div>
  );
};

export default DexAggregator;
