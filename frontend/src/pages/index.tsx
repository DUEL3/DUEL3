import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import {
  useReadPlayerStamina,
  useReadMaxStamina,
  useReadPlayerStage,
} from "src/hooks/useContractManager";
import HeaderComponent from "src/components/ingame/HeaderComponent";
import BattleScenes from "src/components/scenes/BattleScenes";
import EditScenes from "src/components/scenes/EditScenes";
import OverScenes from "src/components/scenes/OverScenes";
import EnterScence from "src/components/scenes/EnterScence";
import { RESULT, SCENE, TUTORIAL } from "src/constants/interface";
import { Toaster } from "react-hot-toast";
import TitleComponent from "src/components/ingame/TitleComponent";

const Index = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  /**============================
 * useState
 ============================*/
  const [scene, setScene] = useState(SCENE.Enter);
  const [result, setResult] = useState(RESULT.NOT_YET);
  const [tutorial, setTutorial] = useState<TUTORIAL>(TUTORIAL.None);
  const [stage, setStage] = useState(0);
  const [leftStamina, setLeftStamina] = useState<number>(0);
  const [battleId, setBattleId] = useState<number>(-1);

  /**============================
 * useReadContract
 ============================*/
  const { data, refetch } = useReadPlayerStage();
  const stamina = useReadPlayerStamina();
  const maxStamina = useReadMaxStamina();

  /**============================
 * useEffect
 ============================*/
  //Set stage by contract data
  useEffect(() => {
    if (data !== undefined) {
      setStage(Number(data));
    }
  }, [data]);

  useEffect(() => {
    if (stamina !== undefined && maxStamina !== undefined) {
      setLeftStamina(Number(maxStamina) - Number(stamina));
    }
  }, [stamina, maxStamina]);

  useEffect(() => {
    if (router.query.battle_id) {
      setScene(SCENE.Battle);
      setBattleId(Number(router.query.battle_id));
    }
  }, [router.query]);

  /**============================
 * Functions
 ============================*/
  const recoverStamina = () => {
    setLeftStamina(Number(maxStamina));
  };

  /**============================
 * Rendering
 ============================*/
  return (
    <>
      {isConnected ? (
        <>
          <HeaderComponent
            stage={stage}
            leftStamina={leftStamina}
            setScene={setScene}
          />
          <Toaster />
          {scene === SCENE.Enter ? (
            <EnterScence setScene={setScene} />
          ) : scene === SCENE.Edit ? (
            <EditScenes
              tutorial={tutorial}
              setTutorial={setTutorial}
              leftStamina={leftStamina}
              recoverStamina={recoverStamina}
              stage={stage}
            />
          ) : scene === SCENE.Battle ? (
            <BattleScenes
              setScene={setScene}
              setResult={setResult}
              battleId={battleId}
            />
          ) : (
            <OverScenes
              result={result}
              battleId={battleId}
              setTutorial={setTutorial}
              stage={stage}
              refetchStage={refetch}
              setScene={setScene}
            />
          )}
        </>
      ) : (
        <TitleComponent />
      )}
    </>
  );
};

export default Index;
