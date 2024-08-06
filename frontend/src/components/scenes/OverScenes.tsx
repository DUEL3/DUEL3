import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { units } from "src/constants/units";
import { RESULT, TUTORIAL, SCENE } from "src/constants/interface";
import { useAccount, useChainId } from "wagmi";
import { getBattleResultApi } from "../../utils/apiHandler";
import ButtonComponent from "src/components/ingame/ButtonComponent";
import {
  useWriteEndBattle,
  useReadMaxStage,
  useReadNewUnitByStage,
  useReadCurrentTokenId,
  useReadMaxSupply,
  useReadTokenUri,
} from "src/hooks/useContractManager";
import addresses from "src/constants/addresses";

enum RESULT_PHASE {
  LOSE = 0,
  WIN = 1,
  WIN_MAX_STAGE = 2,
  MINTED = 3,
}

const OverScenes = ({
  result,
  battleId,
  setTutorial,
  stage,
  refetchStage,
  setScene,
}) => {
  const { address } = useAccount();
  const chainId = useChainId();
  const router = useRouter();

  /**============================
 * useState
 ============================*/
  const [battleResult, setBattleResult] = useState<any>(BigInt(0));
  const [signature, setSignature] = useState<string>("");
  const [isMinted, setIsMinted] = useState<boolean>(false);
  const [resultPhase, setResultPhase] = useState<RESULT_PHASE>(
    RESULT_PHASE.LOSE
  );

  /**============================
 * useReadContract
 ============================*/
  const dataMaxStage = useReadMaxStage();
  const dataNewUnit = useReadNewUnitByStage(stage + 1);
  const { data: dataCurrentTokenId, refetch: refetchCurrentTokenId } =
    useReadCurrentTokenId();
  const dataMaxSupply = useReadMaxSupply();
  const dataTokenUri = useReadTokenUri(dataCurrentTokenId);

  /**============================
 * useEffect
 ============================*/
  useEffect(() => {
    //If debug mode is true, don't get battle result from api
    if (!address || battleId < 0) return;
    getBattleResultApi(chainId, battleId, address).then((res) => {
      // console.log("battleResultData", res);
      setBattleResult(res.result);
      setSignature(res.signature);
    });
  }, [chainId, battleId, address, result]);

  /**============================
 * useWrite
 ============================*/
  const { write, isLoading } = useWriteEndBattle(
    () => {},
    () => {
      if (stage === Number(dataMaxStage)) {
        refetchCurrentTokenId();
        setIsMinted(true);
        return;
      } else {
        if (stage === 0) {
          setTutorial(TUTORIAL.MoveSubUnit);
        } else if (stage === 1) {
          setTutorial(TUTORIAL.ReverseUnit);
        }
      }
      refetchStage();
      //If battle result is win, back to edit scene without url parameters
      router.push("/");
      setScene(SCENE.Edit);
    },
    battleId,
    battleResult,
    signature
  );

  /**============================
 * Rendering
 ============================*/
  //Set resultPhase
  useEffect(() => {
    if (result !== RESULT.WIN) {
      setResultPhase(RESULT_PHASE.LOSE);
    } else if (isMinted) {
      setResultPhase(RESULT_PHASE.MINTED);
    } else if (stage === Number(dataMaxStage) && result === RESULT.WIN) {
      setResultPhase(RESULT_PHASE.WIN_MAX_STAGE);
    } else if (result === RESULT.WIN) {
      setResultPhase(RESULT_PHASE.WIN);
    }
  }, [result, stage, dataMaxStage, isMinted]);

  const renderResultText = () => {
    if (resultPhase === RESULT_PHASE.MINTED) return "Minted!";
    if (resultPhase === RESULT_PHASE.WIN_MAX_STAGE) return "Congrats!";
    return resultPhase === RESULT_PHASE.WIN ? "Win!" : "Lose...";
  };

  const renderResultImage = () => {
    if (resultPhase === RESULT_PHASE.LOSE) {
      return (
        <Image
          src="/images/gameOver/lose-icon.png"
          alt=""
          width={240}
          height={240}
        />
      );
    } else if (
      resultPhase === RESULT_PHASE.WIN ||
      resultPhase === RESULT_PHASE.WIN_MAX_STAGE
    ) {
      if (dataNewUnit && Number(dataNewUnit) > 0) {
        //Get new unit
        return renderNewUnit(Number(dataNewUnit));
      } else {
        return (
          <Image
            src="/images/gameOver/win-icon.png"
            alt=""
            width={240}
            height={240}
          />
        );
      }
    } else if (resultPhase === RESULT_PHASE.MINTED) {
      //Svg rendering
      if (dataTokenUri) {
        // console.log("dataTokenUri", dataTokenUri);

        const _splitedData = (dataTokenUri as string).split(",")[1];
        // console.log("_splitedData", _splitedData);
        const _decodedData = window.atob(_splitedData);
        // console.log("_decodedData", _decodedData);

        //to json
        const _dataTokenUriJson = JSON.parse(_decodedData);
        // console.log("_dataTokenUriJson", _dataTokenUriJson);
        const _image = _dataTokenUriJson.image;
        // console.log("_image", _image);

        return (
          <>
            <Image src={_image} alt="" width={200} height={200} />
          </>
        );
      }
      return <>Invalid Token URI</>;
    }
  };

  //Called from renderResultImage
  const renderNewUnit = (unitId: number) => {
    return (
      <>
        <div
          style={{
            width: "200px",
            height: "255px",
          }}
        >
          <Image
            src={`/images/cards/${units[unitId].imagePath}.png`}
            alt=""
            width={200}
            height={255}
          />
        </div>
        <div className="flex justify-between">
          <div className="w-8 relative" style={{ top: "2px", left: "9px" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={`/images/common/numbers/${units[unitId].attack}.png`}
                alt=""
                width={160}
                height={204}
              />
            </div>
          </div>
          <div className="w-8 relative" style={{ top: "2px", right: "8px" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={`/images/common/numbers/${units[unitId].life}.png`}
                alt=""
                width={160}
                height={204}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderButton = () => {
    if (resultPhase === RESULT_PHASE.LOSE) {
      return (
        <ButtonComponent
          write={() => {
            router.push("/");
            setScene(SCENE.Edit);
          }}
          isLoading={false}
          text={"CONTINUE"}
        />
      );
    }

    //TODO share button
    if (resultPhase === RESULT_PHASE.MINTED) {
      //OpenSea URL
      const linkToOpenSea = () => {
        const nftAddress = addresses(chainId)!.DUEL3NFTAlpha;
        const openSeaUrl = `https://opensea.io/assets/arbitrum/${nftAddress}/${dataCurrentTokenId}`;
        window.open(openSeaUrl, "_blank");
      };

      const shareOnX = () => {
        const nftAddress = addresses(chainId)!.DUEL3NFTAlpha;
        const text = encodeURIComponent("I'm a fantastic duelist!! @DuelThree");
        const url = encodeURIComponent(
          `https://opensea.io/assets/arbitrum/${nftAddress}/${dataCurrentTokenId}`
        );
        const hashtags = "duel3";
        const shareUrl = `https://x.com/intent/post?text=${text}&url=${url}&hashtags=${hashtags}`;
        window.open(shareUrl, "_blank");
      };

      return (
        <>
          <div className="mb-8">
            <ButtonComponent
              write={linkToOpenSea}
              isLoading={false}
              text="OpenSea"
            />
          </div>
          <div className="">
            <ButtonComponent
              write={shareOnX}
              isLoading={false}
              text="SHARE"
              class="px-12"
            />
          </div>
        </>
      );
    }

    if (battleResult) {
      return resultPhase === RESULT_PHASE.WIN_MAX_STAGE ? (
        dataCurrentTokenId === dataMaxSupply ? (
          <ButtonComponent
            write={() => {}}
            isLoading={false}
            text={`MINT ${Number(dataCurrentTokenId)}/${Number(dataMaxSupply)}`}
            class="disabled"
          />
        ) : (
          <ButtonComponent
            write={write}
            isLoading={isLoading}
            text={`MINT ${Number(dataCurrentTokenId)}/${Number(dataMaxSupply)}`}
          />
        )
      ) : (
        <ButtonComponent write={write} isLoading={isLoading} text={"CONFIRM"} />
      );
    }
  };

  return (
    <div className="flex flex-col items-center m-auto">
      <main className="flex flex-col" style={{ width: "1080px" }}>
        <section className="mt-8">
          <div className="flex justify-center p-4">
            <div className="m-2 mx-6 text-8xl font-bold">
              {renderResultText()}
            </div>
          </div>
        </section>
        <section className="">
          <div className="flex justify-center">
            <div className="mt-8 mb-8">{renderResultImage()}</div>
          </div>
        </section>
        <section className="mt-16 mb-8">
          <div className="text-center">{renderButton()}</div>
        </section>
      </main>
    </div>
  );
};

export default OverScenes;
