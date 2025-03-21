import { useEffect, useState } from "react";
import { ERC20Token } from "../types";
import { Address, erc20Abi, formatUnits, getAddress } from "viem";
import { useBalance, useChainId, usePublicClient } from "wagmi";
import { arbitrum } from "viem/chains";
import { ETH_ADDRESS } from "../utils";
import { config } from "../wagmi";

const useBalances = (address: Address, tokens: ERC20Token[]) => {
  const chainId = useChainId();
  const [balances, setBalances] = useState<{ [key: Address]: string }>({});
  const { data: ethBalance,  } = useBalance({ address, config: config, chainId: chainId as any });
  const publicClient = usePublicClient({
    chainId: chainId
  });

  const fetch = async () => {
    if (!publicClient) {
      return;
    }
    if (tokens.length <= 0) { return }
    const result = await publicClient.multicall({
      contracts: tokens.map(token => ({
        abi: erc20Abi,
        address: token.address,
        functionName: "balanceOf",
        args: [address],
      })),
    });

    const balances = result.reduce((acc: { [key: Address]: string }, r, i) => {
      acc[getAddress(tokens[i].address)] = formatUnits(BigInt((r.result || 0) as bigint), tokens[i].decimals);
      return acc;
    }, {});
    balances[ETH_ADDRESS] = formatUnits(BigInt(ethBalance?.value || 0), 18);
    setBalances(balances);
  }

  useEffect(() => {
    fetch();
  }, [publicClient, tokens, address]);


  return balances;
};

export default useBalances;
