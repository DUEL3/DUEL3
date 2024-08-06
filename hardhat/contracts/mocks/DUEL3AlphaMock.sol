// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {DUEL3Alpha, Result} from "../alpha/DUEL3Alpha.sol";

contract DUEL3AlphaMock is DUEL3Alpha {
    constructor(address _signer) DUEL3Alpha(_signer) {}

    function setPlayerStage(address _player, uint _stage) external {
        playerStage[_player] = _stage;
    }

    function setPlayerUnits(
        address _player,
        uint[10] memory _playerUnits
    ) external {
        playerUnits[_player] = _playerUnits;
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

    function validateUnits(
        uint[10] memory _beforeUnits,
        uint[10] memory _playerUnits
    ) external pure returns (bool) {
        return _validateUnits(_beforeUnits, _playerUnits);
    }

    function sortUnits(
        uint[10] memory _units
    ) external pure returns (uint[10] memory) {
        _sortUnits(_units);
        return _units;
    }
}
