import Image from "next/image";
import Link from "next/link";
import { ConnectWallet } from "src/components/ConnectWallet";

const TitleComponent = () => {
  return (
    <div className="flex flex-col items-center m-auto">
      <div className="mt-48 mb-16 text-9xl">DUEL3</div>
      <ConnectWallet />
      <div className="mt-40 w-24">
        <div className="flex justify-center">
          <div className="w-7 mx-2">
            <Link href="https://twitter.com/DuelThree" target="_blank">
              <Image
                src={"/images/title/x-logo-white.png"}
                alt=""
                width={400}
                height={200}
              />
            </Link>
          </div>
          <div className="w-7 mx-2">
            <Link href="https://github.com/DUEL3/DUEL3" target="_blank">
              <Image
                src={"/images/title/github-mark-white.png"}
                alt=""
                width={400}
                height={200}
              />
            </Link>
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <Link href="https://paragraph.xyz/@duel3" target="_blank">
            <div className="w-8 mx-2">Blog</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TitleComponent;
