import Head from "next/head";
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
              <Head>
                <title>DUEL3</title>
                <meta property="og:title" content="DUEL3" />
                <meta
                  property="og:description"
                  content="DUEL3 is an onchain card game with infinite scalability. It's your turn!"
                />
                <meta property="og:image" content="/duel3-ogp.png" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="DUEL3" />
                <meta
                  name="twitter:description"
                  content="DUEL3 is an onchain card game with infinite scalability. It's your turn!"
                />
                <meta name="twitter:image" content="/duel3-ogp.png" />
              </Head>
              <Component {...pageProps} />
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      )}
    </>
  );
}

export default MyApp;
