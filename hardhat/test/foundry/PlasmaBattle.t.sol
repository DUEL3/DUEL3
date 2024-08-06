// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import {BaseTest, console2} from "./BaseTest.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {PlasmaBattle, Result, PlasmaBattleErrors} from "../../contracts/core/PlasmaBattle.sol";
import {PlasmaBattleMock} from "../../contracts/mocks/PlasmaBattleMock.sol";

contract PlasmaBattleTest is BaseTest {
    PlasmaBattleMock internal battle;

    /// @dev A function invoked before each test case is run.
    function setUp() public virtual {
        _setUp();
        battle = new PlasmaBattleMock(signer);
    }

    function test_setSigner_Success() external {
        address _newSigner = vm.addr(1);
        battle.setSigner(_newSigner);
        assertEq(battle.signer(), _newSigner);
    }

    function test_startBattle_Success() external {
        uint _battleId = battle.startBattle();
        assertEq(_battleId, 1);
        assertEq(battle.battleId(), 1);
        assertEq(battle.latestBattleIds(address(this)), 1);
        (
            address player,
            Result result,
            uint startTimestamp,
            uint endTimestamp
        ) = battle.battleRecord(_battleId);
        assertEq(player, address(this));
        assertEq(uint(result), uint(Result.NOT_YET));
        assertEq(startTimestamp, block.timestamp);
        assertEq(endTimestamp, 0);
        //Random seed
        (uint prevBlockNumber, uint timestamp, address txOrigin) = battle
            .randomSeeds(_battleId);
        assertEq(prevBlockNumber, 0);
        assertEq(timestamp, block.timestamp);
        assertEq(txOrigin, tx.origin);
    }

    //TODO yam
    function test_endBattle_Success() external {
        battle.startBattle();
        battle.startBattle();
        uint _startTimestamp = block.timestamp;
        vm.warp(100); // proceed time

        uint _battleId = 2;
        Result _result = Result.WIN;
        bytes memory signature = getSignatureBySigner(
            battle.hashTypedDataV4(_battleId, _result)
        );

        battle.endBattle(_battleId, _result, signature);
        (, Result result, uint startTimestamp, uint endTimestamp) = battle
            .battleRecord(_battleId);
        assertEq(uint(result), uint(_result));
        assertEq(startTimestamp, _startTimestamp);
        assertEq(endTimestamp, 100);
    }

    function test_endBattle_Fail1() external {
        vm.expectRevert(PlasmaBattleErrors.MustResultEnd.selector);
        battle.endBattle(1, Result.NOT_YET, new bytes(0));
    }

    function test_endBattle_Fail2() external {
        vm.expectRevert(PlasmaBattleErrors.BattleNotStartedYet.selector);
        battle.endBattle(1, Result.WIN, new bytes(0));
    }

    function test_endBattle_Fail3() external {
        battle.startBattle();

        bytes memory signature = getSignatureBySigner(
            battle.hashTypedDataV4(uint(1), Result.WIN)
        );

        battle.endBattle(1, Result.WIN, signature);

        vm.expectRevert(PlasmaBattleErrors.BattleAlreadyEnd.selector);
        battle.endBattle(1, Result.WIN, signature);
    }

    function test_endBattle_Fail4() external {
        battle.startBattle();

        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(
            keccak256(abi.encodePacked(uint(1), Result.WIN))
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, digest);
        bytes memory signature = abi.encodePacked(r, s, v); // note the order here is different from line above.

        vm.expectRevert(PlasmaBattleErrors.InvalidSignature.selector);
        battle.endBattle(1, Result.LOSE, signature);
    }

    function test_prevBlockNumber_Success() external {
        console2.log("prevBlockNumber: ", Strings.toString(block.number - 1));
        //proceed time
        vm.warp(100);
        //proceed block
        vm.roll(100);
        console2.log("prevBlockNumber: ", Strings.toString(block.number - 1));
    }

    function test_getRandomNumbers_Success() external {
        uint256[] memory randomNumbers = battle.getRandomNumbers(1, 0, 8);
        for (uint i = 0; i < randomNumbers.length; i++) {
            console2.log("randomNumbers: ", Strings.toString(randomNumbers[i]));
        }
    }
}
