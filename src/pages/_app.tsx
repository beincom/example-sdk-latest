import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { ToastContainer } from 'react-toastify';

import { config } from '../wagmi';
import { useEffect, useState } from 'react';
import { loadWasm } from '../utils/bic-signer';
import { CookiesProvider, useCookies } from 'react-cookie'

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoadWasm, setIsLoadWasm] = useState<boolean>(true);

  useEffect(() => {
    // loadWasm().then(() => {
    //     setTimeout(() => {
    //         setIsLoadWasm(true)
    //     }, 1000)
    // })
})
  return (
    <CookiesProvider>
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          {
            isLoadWasm && <Component {...pageProps} />
          }
          {
            !isLoadWasm && <div>Loading WASM</div>
          }
          <ToastContainer />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    </CookiesProvider>
  );
}

export default MyApp;
