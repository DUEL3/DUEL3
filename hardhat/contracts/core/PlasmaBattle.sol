// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// import {console2} from "forge-std/console2.sol";

struct Battle {
    address player;
    Result result;
    uint256 startTimestamp;
    uint256 endTimestamp;
}

struct RandomSeed {
    uint prevBlockNumber;
    uint timestamp;
    address txOrigin;
}

enum Result {
    NOT_YET,
    WIN,
    LOSE,
    DRAW
}

library PlasmaBattleErrors {
    error InvalidSignature();
    error BattleAlreadyEnd();
    error BattleNotStartedYet();
    error MustResultEnd();
}

event BattleIdIncremented(uint battleId);
event BattleRecorded(uint indexed battleId, address indexed player, Result indexed result, uint startTimestamp, uint endTimestamp);
event RandomSeedRecorded(uint indexed battleId, uint prevBlockNumber, uint timestamp, address txOrigin);

abstract contract PlasmaBattle is Ownable,EIP712 {

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    uint public battleId;
    address public signer;
    // mapping(battlId => info)
    mapping(uint => Battle) public battleRecord;
    // mapping(battleId => randomSeed)
    mapping(uint => RandomSeed) public randomSeeds;
    // mapping(address => latestBattleId)
    mapping(address => uint) public latestBattleIds;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address _signer) Ownable(msg.sender) EIP712("PlasmaBattle", "1")  {
        signer = _signer;
    }

    /*//////////////////////////////////////////////////////////////
                            OWNER UPDATE
    //////////////////////////////////////////////////////////////*/
    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                             EXTERNAL VIEW
    //////////////////////////////////////////////////////////////*/

    function verify(
        bytes memory signature,
        uint _battleId,
        Result _result
    ) external view returns (bool) {
        return _verify(signature, _battleId, _result);
    }

    function getRandomNumber(uint _battleId, uint8 _index) public view returns (uint256) {
        RandomSeed memory randomSeed = randomSeeds[_battleId];
        return uint256(keccak256(abi.encodePacked(_battleId, randomSeed.prevBlockNumber, randomSeed.timestamp, randomSeed.txOrigin, _index)));
    }

    function getRandomNumbers(uint _battleId, uint8 _index, uint8 _i) public view returns (uint256[] memory) {
        RandomSeed memory randomSeed = randomSeeds[_battleId];
        uint256[] memory randomNumbers_ = new uint256[](_i);
        for (uint8 i = 0; i < _i; ) {
            randomNumbers_[i] = uint256(
                keccak256(
                    abi.encodePacked(
                        _battleId,
                        randomSeed.prevBlockNumber,
                        randomSeed.timestamp,
                        randomSeed.txOrigin,
                        _index + i
                    )
                )
            );
            unchecked {
                i++;
            }
        }
        return randomNumbers_;
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/
    function _startBattle(address _player) internal virtual returns (uint battleId_) {
        battleId_ = ++battleId;
        emit BattleIdIncremented(battleId_);

        battleRecord[battleId_] = Battle(
            _player,
            Result.NOT_YET,
            block.timestamp,
            0
        );
        emit BattleRecorded(battleId_, _player, Result.NOT_YET, block.timestamp, 0);

        latestBattleIds[_player] = battleId_;

        randomSeeds[battleId_] = RandomSeed(
            block.number - 1,
            block.timestamp,
            tx.origin
        );
        emit RandomSeedRecorded(battleId_, block.number - 1, block.timestamp, tx.origin);
    }

    function _endBattle(
        uint _battleId,
        Result _result,
        bytes memory _signature
    ) internal virtual{
        if (_result == Result.NOT_YET) revert PlasmaBattleErrors.MustResultEnd();

        if (battleRecord[_battleId].startTimestamp == 0)
            revert PlasmaBattleErrors.BattleNotStartedYet();

        if (
            battleRecord[_battleId].result != Result.NOT_YET ||
            battleRecord[_battleId].endTimestamp != 0
        ) revert PlasmaBattleErrors.BattleAlreadyEnd();

        if (!_verify(_signature, _battleId, _result)) revert PlasmaBattleErrors.InvalidSignature();

        battleRecord[_battleId].result = _result;
        battleRecord[_battleId].endTimestamp = block.timestamp;
        emit BattleRecorded(_battleId, battleRecord[_battleId].player, _result, battleRecord[_battleId].startTimestamp, block.timestamp);
    }

    /*//////////////////////////////////////////////////////////////
                             INTERNAL VIEW
    //////////////////////////////////////////////////////////////*/
    function _verify(
        bytes memory signature,
        uint _battleId,
        Result _result
    ) internal view returns (bool) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("BattleResult(uint battleId,uint8 result)"),
                    _battleId,
                    _result
                )
            )
        );
        address recoveredSigner = ECDSA.recover(digest, signature);
        return recoveredSigner == signer;
    }
}
