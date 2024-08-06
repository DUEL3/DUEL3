import { encodePacked, keccak256, parseEther, formatUnits } from "viem";

export const convertUnitIdsToNumber = (unitIds: BigInt[]): number[] => {
  // If 0n is included in the array, it is removed.
  let unitNumbers: number[] = [];
  for (const id of unitIds as []) {
    if (Number(id) === 0) continue;
    unitNumbers.push(Number(id));
  }
  return unitNumbers;
};

export const convertUnitIdsToBigInt = (unitIds: number[]): BigInt[] => {
  return unitIds.map((id) => BigInt(id));
};

export const abiEncodePacked = (types: string[], values: any[]): bigint => {
  const _encodePacked = encodePacked(types, values);
  const _keccak256 = keccak256(_encodePacked);
  const _bigint = BigInt(_keccak256);
  return _bigint;
};

export const parseEtherToBigint = (value: string): bigint => {
  return parseEther(value);
};

export const gweiToEther = (gwei: bigint): string => {
  return formatUnits(gwei, 18);
};

export const truncatedText = (val: string, num: number): string => {
  return val.length > 8 ? `${val.slice(0, num)}...` : val;
};
