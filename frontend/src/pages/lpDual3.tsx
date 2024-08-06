import Head from "next/head";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const Home = () => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
  }, []);

  return (
    <div className="flex flex-col items-center m-auto">
      <Head>
        <title>DUEL3</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header
        className="fixed w-full flex justify-between items-center p-2"
        style={{ backgroundColor: "rgba(38,37,61, 0.7)" }}
      >
        <div
          className="flex justify-between items-center"
          style={{ width: "1080px", margin: "auto" }}
        >
          <Image
            src="/images/common/dual3-icon.png"
            alt="DUEL3 Logo"
            width={50}
            height={50}
          />
          <Link
            href="/ingame/edit"
            className="bg-sub font-bold text-sm px-5 py-2 rounded text-decoration-none"
          >
            Launch App
          </Link>
        </div>
      </header>
      <main
        className="flex flex-col"
        style={{ width: "800px", margin: "auto" }}
      >
        <section className="mt-16">
          <div
            className="text-center text-9xl mt-48"
            style={{ fontFamily: "Montserrat" }}
          >
            DUEL3
          </div>
          <div className="text-center mt-8">
            Battle and build on the decentralized onchain game protocol
          </div>
        </section>
        <section className="text-center mt-40">
          <Link
            href="/ingame/edit"
            className="bg-sub font-bold px-8 py-3 rounded-md text-decoration-none"
          >
            Launch App
          </Link>
        </section>
        <section className="mt-48 flex justify-between">
          <div className="w-2/5">
            <div className="text-4xl">
              A starategic game with infinite scalablity
            </div>
            <div className="mt-6 text-gray-400 text-xl">
              The stateless architecture, designed for a risk-minimized hybrid
              app, enables an authentic simulation game on mainnet.
            </div>
          </div>
          <div className="w-2/5">
            <Image
              src="/images/common/lp-feature1.png"
              alt="Under Image 2"
              width={1000}
              height={200}
            />
          </div>
        </section>
        <section className="text-center mt-32 mb-40">
          <div className="w-7 m-auto">
            <Link href="/app" className="">
              <Image
                src="/images/common/x-logo-white.png"
                alt="Under Image 2"
                width={32}
                height={32}
              />
            </Link>
          </div>
        </section>
      </main>{" "}
    </div>
  );
};

export default Home;
