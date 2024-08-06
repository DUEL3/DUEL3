import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia, scrollSepolia, arbitrum } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import "../styles/global.css";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [arbitrum],
    transports: {
      // [scrollSepolia.id]: http(scrollSepolia.rpcUrls.default.http[0]),
      // [zkSyncSepoliaTestnet.id]: http(
      //   zkSyncSepoliaTestnet.rpcUrls.default.http[0]
      // ),
      // [base.id]: http(base.rpcUrls.default.http[0]),
      // [baseSepolia.id]: http(baseSepolia.rpcUrls.default.http[0]),
      [arbitrum.id]: http(arbitrum.rpcUrls.default.http[0]),
    },
    // Required API Keys
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,

    ssr: true,

    // Required App Info
    appName: "Your App Name",

    // Optional App Info
    appDescription: "Your App Description",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <>
      {router.pathname.startsWith("/lp") ? (
        <Component {...pageProps} />
      ) : (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider>
              <Component {...pageProps} />
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      )}
    </>
  );
}

export default MyApp;
