import { Hex } from "viem";

export const BIC_CHAIN_API_WALLET_LOCAL_URL = 'http://localhost:3000';
export const BIC_CHAIN_API_NFT_LOCAL_URL = 'http://localhost:3001';

export const BIC_CHAIN_API_DEV_URL = 'https://chain.beincom.io/v1/chain';
export const BIC_CHAIN_API_REL_URL = 'https://chain.beincom.biz/v1/chain';
export const BIC_CHAIN_API_PROD_URL = 'https://chain.beincom.com/v1/chain';

export const BIC_CHAIN_API_URL = BIC_CHAIN_API_REL_URL;

export const BIC_APP_API_URL = 'https://auth.beincom.biz';

export const BIC_APP_API_DEV_URL = 'https://auth.beincom.com';
export const BIC_APP_API_REL_URL = 'https://api.beincom.biz';
export const BIC_APP_API_PROD_URL = 'https://api.beincom.com';

export const BIC_ORIGIN = 'group.beincom.biz';

export const BUNDLER_API_URL = {
    pimilico: 'https://api.pimlico.io/v2/421614/rpc?apikey=pim_6fLiG3s7NjuA3uaAKnzMNc',
    alchemy: 'https://arb-mainnet.g.alchemy.com/v2/XO6yJ11T_WbzeilZidRMw3-zpe-MQJlu'
};



// Secret
export const OWNER_COINBASE_ACCOUNT = process.env.NEXT_PUBLIC_OWNER_COINBASE_ACCOUNT as Hex;

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
    SESSION_TOKEN: 'session_token',
};