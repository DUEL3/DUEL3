import Head from "next/head";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const LpPlasmaAutoBattle = () => {
  const DESCRIPTION_TITLE = {
    className: "text-3xl mt-12",
    style: { fontFamily: "Londrina Solid" },
  };
  const DESCRIPTION_CONTENT = {
    className: "mt-4",
  };

  return (
    <div
      className="flex flex-col items-center m-auto"
      style={{ fontFamily: "Inter" }}
    >
      <Head>
        <title>PlasmaAutoBattle</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="w-full flex justify-between items-center p-4">
        <div
          className="flex justify-between items-center"
          style={{ width: "1080px", margin: "auto" }}
        >
          <div className="flex items-center">
            <Image
              src="/images/lp/HybridAutoBattle-logo.png"
              alt="Logo"
              width={36}
              height={36}
            />
            <div className="ml-2">PlasmaAutoBattle</div>
          </div>
          <div className="flex">
            <Link
              target="_blank"
              href="https://mirror.xyz/yamapyblack.eth/k7F3tdaBOvKlI-wdqBmUP7FXHR6ANEVLNby1eMuRBx8"
              className="bg-sub font-bold text-sm px-5 py-2 rounded-lg text-decoration-none mx-1"
            >
              Blog
            </Link>
            <Link
              href="/lpPlasmaAutoBattle"
              className="bg-sub font-bold text-sm px-5 py-2 rounded-lg text-decoration-none mx-1"
            >
              Coming Soon
            </Link>
          </div>
        </div>
      </header>
      <main
        className="flex flex-col"
        style={{ width: "880px", margin: "auto" }}
      >
        <section className="mt-16">
          <div
            className="text-center text-9xl mt-48"
            style={{ fontFamily: "Londrina Solid" }}
          >
            PlasmaAutoBattle
          </div>
          <div className="text-center mt-4 text-xl">
            Blockchain game for everyone
          </div>
        </section>
        <section className="text-center mt-28">
          <Link
            href="/lpPlasmaAutoBattle"
            className="bg-sub font-bold px-8 py-3 rounded-md text-decoration-none"
          >
            Coming Soon
          </Link>
        </section>
        <section className=" mt-52 flex justify-between">
          <div className="w-1/2 pr-6">
            <div className="text-5xl" style={{ fontFamily: "Londrina Solid" }}>
              Making Onchain Game Scalable, Infinitely
            </div>
            <div className="mt-6 ">
              “PlasmaEngine”, onchain and offchain integration, makes blockchain
              game infinitely scalable and provides an unprecedented UX.
            </div>
          </div>
          <div className="w-1/2 pl-6">
            <Image
              src="/images/lp/PlasmaEngineLp.png"
              alt="Under Image 2"
              width={1000}
              height={200}
            />
          </div>
        </section>
      </main>
      <div
        className="w-full mt-24 py-24"
        style={{ backgroundColor: "#3B392E" }}
      >
        <div
          className="flex flex-col"
          style={{ width: "800px", margin: "auto" }}
        >
          <section className="mx-auto w-11/12">
            <div className="text-5xl" style={{ fontFamily: "Londrina Solid" }}>
              WTF?
            </div>
            <div {...DESCRIPTION_CONTENT}>
              <p>
                Our goal is to create a genuine onchain game where you can enjoy
                using your own assets. Inspired by games like SuperAutoPets and
                AutoChess, our game is a strategic auto-battle experience.
                Currently, onchain games often have subpar user experiences.
              </p>
              <p className="mt-2">
                We&apos;re addressing this with a new approach:
                <b>PlasmaEngine.</b>
              </p>
            </div>
          </section>
          <section className="mt-20 mx-auto w-4/5">
            <div {...DESCRIPTION_TITLE}> Why Blockchain Game?</div>
            <div {...DESCRIPTION_CONTENT}>
              <p className="mt-2">
                The appeal of blockchain games is best captured by the phrase
                &quot;Play to earn by your own assets.&quot; Players utilize
                their owned assets to play and earn new assets.
              </p>
              <p className="mt-2">
                This is similar to the analog Pokémon card game, where players
                use their favorite cards to battle and earn rare cards as
                rewards.
              </p>
              <p className="mt-2">
                Blockchain technology allows humanity to own digital data for
                the first time, as detailed by Chris Dixon, a partner at a16z,
                in his concept of
                <Link
                  target="_blank"
                  className="  text-blue-500"
                  href="https://readwriteown.com/"
                >
                  ReadWriteOwn
                </Link>
                . The fun lies in playing with owned assets and earning new
                ones.
              </p>
            </div>
            <div {...DESCRIPTION_TITLE}> What is the Hybrid Game?</div>
            <div {...DESCRIPTION_CONTENT}>
              <p className="mt-2">
                We propose a <b>Hybrid Game</b>, onchain and offchain
                integration, maintaining asset ownership (Self-custody) while
                running the game Offchain to enhance UX.
              </p>
              <p className="mt-2">
                Specifically, the game records three elements Onchain: the
                &quot;start state,&quot; &quot;end state,&quot; and &quot;random
                number seed.&quot;
              </p>
              <p className="mt-2">
                This system is inspired by the Ethereum Layer2 solution
                &quot;Plasma&quot;, and we named it <b>PlasmaEngine</b>. Plasma
                writes the initial and final states to Ethereum L1, with
                intermediate states handled Offchain.
              </p>
            </div>
            <div {...DESCRIPTION_TITLE}>How does PlasmaEngine work?</div>
            <div {...DESCRIPTION_CONTENT}>
              <p className="mt-2">
                <b>PlasmaEngine</b> is primarily designed for auto-progress
                strategy battle games (not applicable to all game genres). In
                games using this engine, users make only two transactions: at
                the start and end of the game.
              </p>
              <p className="mt-2">
                For more{" "}
                <Link
                  target="_blank"
                  className="  text-blue-500"
                  href="https://mirror.xyz/yamapyblack.eth/k7F3tdaBOvKlI-wdqBmUP7FXHR6ANEVLNby1eMuRBx8"
                >
                  details
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
      <section className="text-center mt-10 mb-10"></section>

      {/* Twitter logo */}
      {/* <section className="text-center mt-32 mb-40">
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
        </section> */}
    </div>
  );
};

export default LpPlasmaAutoBattle;
