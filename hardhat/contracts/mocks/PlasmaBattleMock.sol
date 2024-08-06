// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {PlasmaBattle, Result} from "../core/PlasmaBattle.sol";

contract PlasmaBattleMock is PlasmaBattle {
    constructor(address _signer) PlasmaBattle(_signer) {}

    function startBattle() external returns (uint) {
        return _startBattle(msg.sender);
    }

    function endBattle(
        uint _battleId,
        Result _result,
        bytes memory _signature
    ) external {
        _endBattle(_battleId, _result, _signature);
    }

    function hashTypedDataV4(
        uint _battleId,
        Result _result
    ) external view returns (bytes32 digest) {
        digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("BattleResult(uint battleId,uint8 result)"),
                    _battleId,
                    _result
                )
            )
        );
    }
}
