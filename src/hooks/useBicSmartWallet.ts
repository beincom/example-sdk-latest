import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { createBundlerClient } from "viem/account-abstraction";
import { Address, Hex, createPublicClient, http, getAddress } from "viem";

import { BUNDLER_API_URL, getBicSigner, MockSigner } from "../utils";
import { AuthSession, SIGNER_TYPE } from "../types";
import { createSmartAccountController } from "@beincom/aa-coinbase";
import useChainApiClient from "./useBicChainClient";


const useBicSmartWallet = () => {
  const chainClient = useChainApiClient();
  const [session] = useLocalStorage<AuthSession | null>("session", null);
  const [smartAccountAddress, setSmartAccountAddress] =
    useState<Address | null>(null);
  const [smartAccount, setSmartAccount] =
    useState<Awaited<ReturnType<typeof createSmartAccountController>>>();

  const publicClient = createPublicClient({
    chain: arbitrum,
    transport: http(),
  });

  const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http( BUNDLER_API_URL.alchemy),
  });

  const fetch = async () => {
    if (!session) {
      return;
    }
    if(!chainClient) {
      return;
    }

      // const signer = await getBicSigner();
      
      const signer = new MockSigner("0x87c39189c6426a86bd4f983f04b701070458d49a8bcd9ee2beddc88f30c15cc7");
      signer.startSession(session.access_token);
      // const systemOwner = await signer.getSystemOwnerAddress();
      // signer.address = getAddress(systemOwner);
      const config = await chainClient.nft.getPlatformConfiguration();
      const account = await createSmartAccountController({
        chain: arbitrumSepolia as any,
        signer,
        bundlerUrl: config.bundlerUrl,
        chainClient: chainClient,
        bicAddress: config.paymasterAddress,
        paymasterAddress: config.paymasterAddress,
        marketplaceAddress: config.marketplaceAddress,
        platformToken: config.platformToken,
        nftHandlerControllerAddress: config.nftHandlerControllerAddress,
        ethNativeAddress: config.ethNativeAddress,
        ethWrappedAddress: config.ethWrappedAddress,

      });
      await account.setupSmartAccount();
      setSmartAccountAddress(await account.getSmartAccountAddress());
      setSmartAccount(account);
  };

  useEffect(() => {
    fetch();
  }, [session, chainClient]);

  return { smartAccountAddress, smartAccount, bundlerClient };
};

export default useBicSmartWallet;
