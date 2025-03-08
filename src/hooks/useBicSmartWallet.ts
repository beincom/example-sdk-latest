import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { arbitrum, arbitrumSepolia, bsc, bscTestnet } from "viem/chains";
import { createBundlerClient } from "viem/account-abstraction";
import { Address, Hex, createPublicClient, http } from "viem";
import {Marketplace} from "@beincom/marketplace";

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
  const [marketplace, setMarketplace] = useState<Marketplace>()

  const publicClient = createPublicClient({
    chain: arbitrum,
    transport: http(),
  });

  const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http(BUNDLER_API_URL.alchemy),
  });

  const fetch = async () => {
    if (!session) {
      return;
    }
    if (!chainClient) {
      return;
    }

    // const signer = await getBicSigner();

    const signer = new MockSigner("0x");
    signer.startSession(session.access_token);
    const config = await chainClient.nft.getPlatformConfiguration();

    // // Explorer cho Redemption
    // const bscScan = config.chainConfig.currentChainId === String(arbitrum.id) ? bscMainnetConfig.scanUrl : bscTestnetConfig.scanUrl;

    const chains = {
      [arbitrum.id]: arbitrum,
      [arbitrumSepolia.id]: arbitrumSepolia,
    } as const;
    const chain = chains[arbitrumSepolia.id] as any;
    const chainConfig = config.chainConfig.chains[Number(config.chainConfig.currentChainId)];

    const addresses: any = {
      "bundlerUrl": "https://arb-sepolia.g.alchemy.com/v2/gA53VZ-kip4A01xx5mT2pKG3FbpKO1OW",
      // "bundlerUrl": "https://api.pimlico.io/v2/421614/rpc?apikey=pim_6fLiG3s7NjuA3uaAKnzMNc",

      "rpcs": [
        "https://arbitrum-sepolia-rpc.publicnode.com",
        "https://sepolia-rollup.arbitrum.io/rpc",
      ],
      "bicAddress": "0xa8166BD637210470B55bb489aE8e4C936b5520C9",
      "paymasterAddress": "0xa8166BD637210470B55bb489aE8e4C936b5520C9",
      "marketplaceAddress": "0x679f1b5503d77f8352239B9af90488E51750241d",
      "platformToken": {
        "name": "TBIC",
        "chainId": 421614,
        "icon": "https://bic-dev-entity-attribute-s3-bucket.s3.ap-southeast-1.amazonaws.com/static/bic-token.webp",
        "symbol": "TBIC",
        "usdPrice": 0,
        "description": "Beincom STG Token Testnet",
        "address": "0xa8166BD637210470B55bb489aE8e4C936b5520C9",
        "decimal": 18
      },
      "nftHandlerControllerAddress": "0x7a58BEAC3ea2461C63A85f517CB516B000654C00",
      "ethNativeAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      "ethWrappedAddress": "0xAA84765a5fDE01FDC84519eF13C9aC3b6D47E26F"
    }

    const account = await createSmartAccountController({
      chain: chain,
      chainClient: chainClient,
      signer,
      // ...addresses,
      bundlerUrl: config.bundlerUrl,
      // new updated for fallback rpc
      rpcs: chainConfig.rpcs,
      bicAddress: config.paymasterAddress,
      paymasterAddress: config.paymasterAddress,
      marketplaceAddress: config.marketplaceAddress,
      platformToken: config.platformToken,
      nftHandlerControllerAddress: config.nftHandlerControllerAddress,
      ethNativeAddress: config.ethNativeAddress,
      ethWrappedAddress: config.ethWrappedAddress,

    });
    setMarketplace(new Marketplace({
      ethNativeAddress: config.ethNativeAddress,
      marketplaceAddress: config.marketplaceAddress,
      providerUrl: addresses.rpcs[0],
    }))
    await account.setupSmartAccount();
    setSmartAccountAddress(await account.getSmartAccountAddress());
    setSmartAccount(account);
  };

  useEffect(() => {
    fetch();
  }, [session, chainClient]);

  return { smartAccountAddress, smartAccount, marketplace, bundlerClient };
};

export default useBicSmartWallet;
