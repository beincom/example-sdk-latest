import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { arbitrum, arbitrumSepolia, bsc, bscTestnet } from "viem/chains";
import { createBundlerClient } from "viem/account-abstraction";
import { Address, Hex, createPublicClient, http } from "viem";
import { Marketplace } from "@beincom/marketplace";
import { PaymentService } from "@beincom/payments";

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
  const [marketplace, setMarketplace] = useState<Marketplace>();
  const [paymentService, setPaymentService] = useState<PaymentService>();

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
    const config = await getConfig();
    if (!config) {
      return;
    }

    // const signer = await getBicSigner();

    const signer = new MockSigner(
      process.env.NEXT_PUBLIC_OWNER_PRIVATE_KEY as Hex
    );
    signer.startSession(session.access_token);

    // // Explorer cho Redemption
    // const bscScan = config.chainConfig.currentChainId === String(arbitrum.id) ? bscMainnetConfig.scanUrl : bscTestnetConfig.scanUrl;

    const chains = {
      [arbitrum.id.toString()]: arbitrum,
      [arbitrumSepolia.id.toString()]: arbitrumSepolia,
    };
    const chain = chains[config.chainConfig.currentChainId] as any;
    const chainConfig =
      config.chainConfig.chains[Number(config.chainConfig.currentChainId)];

    const account = await createSmartAccountController({
      debug: true,
      chain: chain,
      getChainClient: () => chainClient as any,
      signer,
      // ...addresses,
      bundlerUrl: config.bundlerUrl,
      // bundlerUrl: "https://api.pimlico.io/v2/421614/rpc?apikey=pim_6fLiG3s7NjuA3uaAKnzMNc",
      // proxyUserOpUrl: "http://localhost:3000",
      paymentUrl: config.paymentUrl,
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
    setMarketplace(
      new Marketplace({
        ethNativeAddress: config.ethNativeAddress,
        marketplaceAddress: config.marketplaceAddress,
        providerUrl: chainConfig.rpcs[0],
      })
    );
    setPaymentService(
      new PaymentService({
        chain: chain,
        rpcs: chainConfig.rpcs,
        tokenMessageEmitterAddress: config.tokenMessageEmitterAddress,
        oneCPAddress: config.oneCPAddress,
        oneCPCaller: config.oneCPCaller,
        getChainClient: () => chainClient,
        paymentUrl: config.paymentUrl,
      })
    );
    await account.setupSmartAccount();
    setSmartAccountAddress(await account.getSmartAccountAddress());
    setSmartAccount(account);
  };

  const getConfig = async () => {
    return getMainnetConfig();
    if (!chainClient) {
      return null;
    }
    try {
      const config = await chainClient.nft.getPlatformConfiguration();
      return config;
    } catch (error) {
      return null;
    }
  };

  const getMainnetConfig = async () => {
   return {
    "platformToken": {
      "name": "Beincom",
      "chainId": 42161,
      "icon": "https://bic-pro-entity-attribute-s3-bucket.s3.ap-southeast-1.amazonaws.com/static/chain/tbic.png",
      "symbol": "BIC",
      "usdPrice": 0,
      "description": "",
      "address": "0xB1C3960aeeAf4C255A877da04b06487BBa698386",
      "decimal": 18
    },
    "chainConfig": {
      "currentChainId": "42161",
      "chains": {
        "56": {
          "rpcs": [
            "https://rpc.ankr.com/bsc"
          ],
          "scanUrl": "https://bscscan.com"
        },
        "97": {
          "rpcs": [
            "https://data-seed-prebsc-1-s1.bnbchain.org:8545"
          ],
          "scanUrl": "https://testnet.bscscan.com"
        },
        "42161": {
          "rpcs": [
            "https://arb1.arbitrum.io/rpc"
          ],
          "scanUrl": "https://arbiscan.io"
        },
        "421614": {
          "rpcs": [
            "https://sepolia-rollup.arbitrum.io/rpc",
            "https://sepolia-rollup.arbitrum.io/rpc",
            "https://arbitrum-sepolia-rpc.publicnode.com"
          ],
          "scanUrl": "https://sepolia.arbiscan.io"
        }
      },
      "proxyUserOpUrl": ""
    },
    "marketplaceAddress": "0x0000000000000000000000000000000000000000",
    "nftHandlerControllerAddress": "0x0000000000000000000000000000000000000000",
    "bundlerUrl": "https://arb-mainnet.g.alchemy.com/v2/gb4_H0SvXglmax2mYImE4lHTswdgs0_z",
    "factoryAddress": "0x0BA5ED0c6AA8c49038F819E587E2633c4A9F428a",
    "paymasterAddress": "0xB1C3960aeeAf4C255A877da04b06487BBa698386",
    "entrypointAddress": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
    "tokenMessageEmitterAddress": "0x0000000000000000000000000000000000000000",
    "oneCPAddress": "0x0000000000000000000000000000000000000000",
    "oneCPCaller": "0x0000000000000000000000000000000000000000",
    "paymentUrl": "",
    "paymentTreasuryAddress": "0x0000000000000000000000000000000000000000",
    "ethNativeAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    "ethWrappedAddress": "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    "uniswapFactoryAddress": "0x0000000000000000000000000000000000000000",
    "uniswapRouterAddress": "0x0000000000000000000000000000000000000000",
    "multicall3Address": "0x0000000000000000000000000000000000000000",
    "uniswapAutoSlippage": "50",
    "uniswapQuoterV2Address": "0x0000000000000000000000000000000000000000",
    "uniswapSubgraphUrl": "",
    "poolAddress": "0x0000000000000000000000000000000000000000",
    "tokens": {
      "bic": {
        "name": "RELTBIC",
        "symbol": "RELTBIC",
        "key": "BIC",
        "usdPrice": 0,
        "pricePairSymbol": "BICUSDT",
        "icon": "https://bic-rel-entity-attribute-s3-bucket.s3.ap-southeast-1.amazonaws.com/static/chain/tbic.png",
        "description": "Release Testnet Beincom Token",
        "address": "0x00A2a54E483395f507663a9182C92De4408ed5Ac",
        "chainId": 421614,
        "decimal": 18,
        "isHidden": false
      },
      "usdt": {
        "name": "Testnet USDT",
        "symbol": "TUSDT",
        "key": "USDT",
        "usdPrice": 1,
        "pricePairSymbol": "USDTUSD",
        "icon": "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        "description": "Testnet Tether",
        "address": "0x2D102740B3B14bea14b166CeFb52b714d82bA447",
        "chainId": 421614,
        "decimal": 18,
        "isHidden": false
      }
    }
  }
  };

  useEffect(() => {
    fetch();
  }, [session, chainClient]);

  return {
    smartAccountAddress,
    smartAccount,
    marketplace,
    paymentService,
    bundlerClient,
  };
};

export default useBicSmartWallet;
