import type { NextPage } from "next";
import { useState } from "react";
import {
  formatUnits,
  Hex,
  zeroAddress,
} from "viem";

import { NFT_ALIAS } from "@beincom/chain-client";

import useChainApiClient from "../../hooks/useBicChainClient";
import useNotification from "../../hooks/useNotification";
import useBalances from "../../hooks/useBalances";
import useBicSmartWallet from "../../hooks/useBicSmartWallet";

import { ERC20Token, SIGNER_TYPE } from "../../types";
import LoginForm from "../../components/login-form";

import {
  ETH_ADDRESS,
  OWNER_COINBASE_ACCOUNT,
  TOKENS_SUPPORTED,
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
  const { smartAccount } =
    useBicSmartWallet();

  const handleCreateNFT = async() => {
    console.log("Create NFT");
    if(!chainClient) {
      return;
    }

    const data = await chainClient.nft.signMintRequest({
      nftType: "bcnft" as any,
      value:"thigia:" + Date.now()
    });
    console.log("🚀 ~ handleCreateNFT ~ data:", data)

    const txData = await smartAccount?.getRequestHandleCallData({
      payload: data
    });
    console.log("🚀 ~ handleCreateNFT ~ smartAccount:", (await smartAccount!.getAccount()).address)

    const tx = await smartAccount?.executeTransactionWithCallData({
      callData: txData!.callData
    }, false)

    console.log("🚀 ~ handleCreateNFT ~ tx:", tx)
  };

  const handleTransferERC20 = async() => {
    if(!chainClient) {
      return;
    }
    if(!smartAccount) {
      return;
    }

    const amount = formatUnits(BigInt(1), 18);
    console.log("🚀 ~ handleTransferERC20 ~ amount:", amount)
    const txData = await smartAccount.getTransferERC20CallData({
      amount: amount,
      to: "0xe450584F78be9DdeA56A535125Aa400F67BAbA36",
      token: {
        address: "0xa8166BD637210470B55bb489aE8e4C936b5520C9",
        decimals: 18,
      },
    });
    console.log("🚀 ~ handleTransferERC20 ~ txData:", txData)

    const tx = await smartAccount?.executeTransactionWithCallData({
      callData: txData!.callData
    }, true)

    console.log("🚀 ~ handleTransferERC20 ~ tx:", tx)
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
        </div>
      </div>
    </div>
  );
};

export default DexAggregator;
