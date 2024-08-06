import { useState, useEffect } from "react";
import {
  useReadCurrentTokenId,
  useReadMaxSupply,
  useReadBalanceOf,
} from "src/hooks/useContractManager";
import { SCENE } from "src/constants/interface";

interface Props {
  setScene: (scene: SCENE) => void;
}

const EnterScence = ({ setScene }: Props) => {
  /**============================
 * useState
 ============================*/
  const [currentTokenId, setCurrentTokenId] = useState<number>(0);
  const [maxSupply, setMaxSupply] = useState<number>(100);
  /**============================
 * useReadContract
 ============================*/
  const dataCurrentTokenId = useReadCurrentTokenId().data;
  const dataMaxSupply = useReadMaxSupply();
  const dataBalanceOf = useReadBalanceOf();

  /**============================
 * useEffect
 ============================*/
  useEffect(() => {
    if (dataCurrentTokenId !== undefined) {
      setCurrentTokenId(Number(dataCurrentTokenId));
    }
  }, [dataCurrentTokenId]);

  useEffect(() => {
    if (dataMaxSupply !== undefined) {
      setMaxSupply(Number(dataMaxSupply));
    }
  }, [dataMaxSupply]);

  /**============================
 * Rendering
 ============================*/
  const canEnter =
    currentTokenId !== maxSupply &&
    dataBalanceOf !== undefined &&
    Number(dataBalanceOf) === 0;

  return (
    <>
      <div className="flex flex-col items-center">
        <main className="flex flex-col" style={{ width: "1080px" }}>
          <section className=" mt-64 mx-auto">
            {dataBalanceOf !== undefined && Number(dataBalanceOf) > 0 && (
              <div className="flex justify-center text-2xl font-bold mb-4 text-red-500">
                <p>YOU ALREADY MINTED</p>
              </div>
            )}
            <button
              className={`text-2xl font-bold py-6 px-32 rounded-xl border border-white text-decoration-none hover:opacity-90 ${
                !canEnter
                  ? " border-gray-400 text-gray-400 cursor-not-allowed"
                  : ""
              }`}
              disabled={!canEnter}
              onClick={() => {
                setScene(SCENE.Edit);
              }}
            >
              ENTER SEASON 0
            </button>
            <div className="flex justify-center text-2xl font-bold mt-4">
              <p className="mr-3">MINTED</p>
              <p>
                {currentTokenId}/{maxSupply}
              </p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default EnterScence;
