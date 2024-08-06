import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const DynamicComponentWithNoSSR = dynamic(
  () => import("src/phaser/PhaserConfig"),
  {
    ssr: false,
  }
);

const BattleScenes = ({ setScene, setResult, battleId }) => {
  const [loading, setLoading] = useState(false);
  const [phaserComponent, setPhaserComponent] = useState<React.ReactNode>(null);
  const phaserInstanceRef = useRef<Element | null>(null);

  useEffect(() => {
    setLoading(true);
  }, []);

  useEffect(() => {
    if (loading && !phaserInstanceRef.current) {
      setPhaserComponent(
        <DynamicComponentWithNoSSR
          setScene={setScene}
          setResult={setResult}
          battleId={battleId}
        />
      );
    }
  }, [loading, setScene, setResult, battleId]);

  return <div>{phaserComponent}</div>;
};

export default BattleScenes;
