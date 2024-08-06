import { useEffect, useState } from "react";
import {
  useReadContract,
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import { DUEL3BattleAlphaAbi } from "src/constants/DUEL3BattleAlphaAbi";
import { DUEL3NFTAlphaAbi } from "src/constants/DUEL3NFTAlphaAbi";
import addresses from "src/constants/addresses";
import toast from "react-hot-toast";
import { debounce } from "lodash";
/**============================
 * useWatchContractEvent
 ============================*/
//unused
export const useWatchBattleIdIncremented = () => {
  const chainId = useChainId();
  useWatchContractEvent({
    address: addresses(chainId)!.DUEL3BattleAlpha as `0x${string}`,
    abi: DUEL3BattleAlphaAbi,
    eventName: "BattleIdIncremented",
    onLogs(logs) {
      console.log("BattleIdIncremented event:", logs);
      logs.forEach((log) => {
        //TODO hash check
        // if (log.transactionHash === hash) {
        // Redirect to battle scene with battleId by router query in index.tsx
        const battleId = (log as any).args.battleId.toString();
        const currentUrl = window.location.href;
        window.location.href = `${currentUrl}?battle_id=${battleId}`;
        // }
      });
    },
    onError(error) {
      console.log("Error", error);
    },
    poll: true,
    pollingInterval: 500,
  });
};

/**============================
 * useRead
 ============================*/
//Unused
export const useReadGetRandomNumbers = (_battleId, _index, _i) => {
  const { data } = useRead("getRandomNumbers", [_battleId, _index, _i]);
  return data;
};

export const useReadWatchLatestBattleIds = () => {
  const { address } = useAccount();
  const { data, refetch } = useRead("latestBattleIds", [
    address as `0x${string}`,
  ]);
  return { data, refetch };
};

export const useReadRandomSeeds = (_battleId) => {
  const { data } = useRead("randomSeeds", [_battleId]);
  return data;
};

export const useReadPlayerStamina = () => {
  const { address } = useAccount();
  const { data } = useRead("staminas", [address as `0x${string}`]);
  return data;
};

export const useReadMaxStamina = () => {
  const { data } = useRead("maxStamina", []);
  return data;
};

export const useReadStarminaRecoveryCost = () => {
  const { data } = useRead("starminaRecoveryCost", []);
  return data;
};

export const useReadMaxStage = () => {
  const { data } = useRead("maxStage", []);
  return data;
};

export const useReadPlayerStage = () => {
  const { address } = useAccount();
  const { data, refetch } = useRead("playerStage", [address as `0x${string}`]);
  return { data, refetch };
};

export const useReadPlayerUnits = () => {
  const { address } = useAccount();
  const { data } = useRead("getPlayerUnits", [address as `0x${string}`]);
  return data;
};

export const useReadGetEnemyUnits = (stage: number) => {
  const { data } = useRead("getEnemyUnits", [BigInt(stage)]);
  return data;
};

export const useReadNewUnitByStage = (stage: number) => {
  const { data } = useRead("newUnitByStage", [BigInt(stage)]);
  return data;
};

export const useReadCurrentTokenId = () => {
  const chainId = useChainId();

  const { data, refetch } = useReadContract({
    abi: DUEL3NFTAlphaAbi,
    address: addresses(chainId)!.DUEL3NFTAlpha as `0x${string}`,
    functionName: "currentTokenId",
    args: [],
  });

  return { data, refetch };
};

export const useReadMaxSupply = () => {
  const chainId = useChainId();

  const { data } = useReadContract({
    abi: DUEL3NFTAlphaAbi,
    address: addresses(chainId)!.DUEL3NFTAlpha as `0x${string}`,
    functionName: "MAX_SUPPLY",
    args: [],
  });

  return data;
};

export const useReadTokenUri = (tokenId) => {
  const chainId = useChainId();

  const { data } = useReadContract({
    abi: DUEL3NFTAlphaAbi,
    address: addresses(chainId)!.DUEL3NFTAlpha as `0x${string}`,
    functionName: "tokenURI",
    args: [tokenId],
  });

  return data;
};

export const useReadBalanceOf = () => {
  const chainId = useChainId();
  const { address } = useAccount();

  const { data } = useReadContract({
    abi: DUEL3NFTAlphaAbi,
    address: addresses(chainId)!.DUEL3NFTAlpha as `0x${string}`,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  return data;
};

/**============================
 * useWrite
 ============================*/

export const useWriteRecoverStaminaAndStart = (
  onSuccess,
  onComplete,
  playerUnitIds,
  value
) => {
  return useWrite(
    onSuccess,
    onComplete,
    "recoverStaminaAndStartBattle",
    [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        if (playerUnitIds[i] === undefined) return BigInt(0);
        return BigInt(playerUnitIds[i]);
      }),
    ],
    value
  );
};

export const useWriteStartBattle = (onSuccess, onComplete, playerUnitIds) => {
  return useWrite(onSuccess, onComplete, "startBattle", [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
      if (playerUnitIds[i] === undefined) return BigInt(0);
      return BigInt(playerUnitIds[i]);
    }),
  ]);
};

export const useWriteEndBattle = (
  onSuccess,
  onComplete,
  battleId,
  battleResult,
  signature
): ReturnTypeWrite => {
  return useWrite(onSuccess, onComplete, "endBattle", [
    battleId,
    battleResult,
    signature,
  ]);
};

/**============================
 * Private
 ============================*/
interface ReturnTypeRead {
  data: any;
  refetch: () => Promise<any>;
}

const useRead = (
  functionName: string,
  args: any[],
  query?: any
): ReturnTypeRead => {
  const [data, setData] = useState<any>();
  const chainId = useChainId();

  const { data: resData, refetch } = useReadContract({
    abi: DUEL3BattleAlphaAbi,
    address: addresses(chainId)!.DUEL3BattleAlpha as `0x${string}`,
    functionName,
    args,
    query,
  });

  useEffect(() => {
    if (resData !== undefined) {
      setData(resData);
    }
  }, [resData]);

  return { data, refetch };
};

interface ReturnTypeWrite {
  hash?: `0x${string}`;
  write: () => Promise<void>;
  isLoading: boolean;
}

const useWrite = (
  onSuccess: () => void,
  onComplete: () => void,
  functionName: string,
  args: any[],
  value?: bigint
): ReturnTypeWrite => {
  const chainId = useChainId();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const {
    isSuccess: txSuccess,
    isError: txError,
    isLoading,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const [isToastShown, setIsToastShown] = useState(false);

  useEffect(() => {
    if (txSuccess && !isToastShown) {
      toast.success("Transaction completed!");
      setIsToastShown(true);
      onComplete();
    }
    if (txError) {
      toast.error("Transaction failed!");
      console.error(txError);
    }
  }, [txSuccess, txError, onComplete, isToastShown]);

  const debouncedOnSuccess = debounce(onSuccess, 3000); // Debounce onSuccess
  const write = async () => {
    writeContract(
      {
        address: addresses(chainId)!.DUEL3BattleAlpha as `0x${string}`,
        abi: DUEL3BattleAlphaAbi,
        functionName,
        args,
        value: value,
      },
      {
        onSuccess: () => {
          toast.success("Transaction sent!");
          debouncedOnSuccess(); // Use debounced onSuccess
        },
        onError: (e) => {
          toast.error("Transaction failed!");
          console.error(e);
        },
      }
    );
  };

  return { hash, write, isLoading: isPending || isLoading };
};
