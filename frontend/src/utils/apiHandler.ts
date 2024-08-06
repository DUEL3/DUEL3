export const getBattleResultApi = async (
  _chainId: number,
  _battleId: number,
  address: `0x${string}`
) => {
  console.log("getBattleResult");
  //url parameter craft_id
  const url = `/api/battleResultApi/?chainId=${_chainId}&battleId=${_battleId}&address=${address}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });
    const resJson = await response.json();
    console.log("res:", resJson);
    return resJson;
  } catch (error) {
    console.error("Error:", error);
  }
};
