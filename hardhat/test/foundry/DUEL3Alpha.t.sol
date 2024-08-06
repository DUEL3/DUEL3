// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import {BaseTest, console2} from "./BaseTest.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {Result, PlasmaBattleErrors} from "../../contracts/core/PlasmaBattle.sol";
import {DUEL3Alpha} from "../../contracts/alpha/DUEL3Alpha.sol";
import {DUEL3NFTAlpha} from "../../contracts/alpha/DUEL3NFTAlpha.sol";
import {DUEL3AlphaMock} from "../../contracts/mocks/DUEL3AlphaMock.sol";

contract DUEL3AlphaTest is BaseTest {
    DUEL3AlphaMock internal alpha;

    /// @dev A function invoked before each test case is run.
    function setUp() public virtual {
        _setUp();
        alpha = new DUEL3AlphaMock(signer);
    }

    function _assertUnits(uint[10] memory _playerUnits) internal view {
        uint[10] memory playerUnits_ = alpha.getPlayerUnits(address(this));
        for (uint i = 0; i < 10; i++) {
            // console2.log("playerUnits_[i]: ", playerUnits_[i]);
            assertEq(playerUnits_[i], _playerUnits[i]);
        }
    }

    function test_sortUnits_Success() public view {
        uint[10] memory _playerUnits = [uint(3), 4, 0, 2, 0, 1, 0, 2, 0, 0];
        uint[10] memory _sortedUnits = alpha.sortUnits(_playerUnits);

        uint[10] memory _expectUnits = [uint(4), 3, 2, 2, 1, 0, 0, 0, 0, 0];
        for (uint i = 0; i < 10; i++) {
            assertEq(_sortedUnits[i], _expectUnits[i]);
        }
    }

    function test_validateUnits_Success1() public view {
        uint[10] memory _beforeUnits = [uint(3), 2, 1, 0, 1, 2, 3, 0, 0, 0];
        uint[10] memory _playerUnits = [uint(0), 2, 2, 0, 3, 3, 0, 1, 1, 0];
        assertEq(alpha.validateUnits(_beforeUnits, _playerUnits), true);
    }

    function test_validateUnits_Fail1() public view {
        uint[10] memory _beforeUnits = [uint(3), 1, 0, 0, 0, 0, 0, 0, 0, 0];
        uint[10] memory _playerUnits = [uint(3), 1, 1, 0, 0, 0, 0, 0, 0, 0];
        assertEq(alpha.validateUnits(_beforeUnits, _playerUnits), false);
    }

    function test_startBattle_Success() public {
        // prettier-ignore
        uint[10] memory _playerUnits = [uint(1001),1003,1001,0,0,0,0,0,0,0];

        alpha.startBattle(_playerUnits);
        (address _player, , , ) = alpha.battleRecord(1);
        assertEq(_player, address(this));
        _assertUnits(_playerUnits);
        assertEq(alpha.staminas(address(this)), 1);
    }

    function test_startBattle_Fail1() public {
        uint[10] memory _playerUnits = [uint(2), 0, 0, 0, 0, 0, 0, 0, 0, 0];

        vm.expectRevert(DUEL3Alpha.InvalidUnitId.selector);
        alpha.startBattle(_playerUnits);
    }

    function test_endBattle_Success() public {
        // prettier-ignore
        uint[10] memory _playerUnits = [uint(1001),1003,1001,0,0,0,0,0,0,0];

        alpha.startBattle(_playerUnits);
        Result _result = Result.WIN;
        bytes memory _signature = getSignatureBySigner(
            alpha.hashTypedDataV4(1, _result)
        );
        alpha.endBattle(1, _result, _signature);
        assertEq(alpha.playerStage(address(this)), 1);
        _playerUnits = [uint(1001), 1003, 1001, 0, 0, 1004, 0, 0, 0, 0];
        _assertUnits(_playerUnits);
    }

    function test_battleEndMint_Success() public {
        //Deploy NFT
        DUEL3NFTAlpha nft = new DUEL3NFTAlpha(address(alpha));
        alpha.setNftAddress(address(nft));

        // prettier-ignore
        uint[10] memory _playerUnits = [uint(1001),1003,1001,0,0,0,0,0,0,0];

        alpha.startBattle(_playerUnits);
        Result _result = Result.WIN;
        bytes memory _signature = getSignatureBySigner(
            alpha.hashTypedDataV4(1, _result)
        );
        alpha.endBattle(1, _result, _signature);

        //Battle 2
        // prettier-ignore
        _playerUnits = [uint(1001),1003,1001,1004,0,0,0,0,0,0];
        alpha.startBattle(_playerUnits);
        _signature = getSignatureBySigner(alpha.hashTypedDataV4(2, _result));
        alpha.endBattle(2, _result, _signature);
        //Battle 3
        _playerUnits = [uint(1001), 1003, 1001, 1004, 1005, 0, 0, 0, 0, 0];
        alpha.startBattle(_playerUnits);
        _signature = getSignatureBySigner(alpha.hashTypedDataV4(3, _result));
        alpha.endBattle(3, _result, _signature);

        //Battle 4 (mint)
        _playerUnits = [uint(1001), 1003, 1001, 1004, 1005, 1006, 0, 0, 0, 0];
        alpha.startBattle(_playerUnits);
        _signature = getSignatureBySigner(alpha.hashTypedDataV4(4, _result));
        alpha.endBattle(4, _result, _signature);

        vm.expectRevert(DUEL3Alpha.StageOver.selector);
        alpha.startBattle(_playerUnits);

        assertEq(nft.ownerOf(1), address(this));
    }

    function test_stamina_Fail() public {
        // prettier-ignore
        uint[10] memory _playerUnits = [uint(1001),1003,1001,0,0,0,0,0,0,0];

        alpha.startBattle(_playerUnits);
        alpha.startBattle(_playerUnits);
        alpha.startBattle(_playerUnits);
        alpha.startBattle(_playerUnits);
        alpha.startBattle(_playerUnits);
        alpha.startBattle(_playerUnits);
        vm.expectRevert(DUEL3Alpha.StaminaNotEnough.selector);
        alpha.startBattle(_playerUnits);
    }

    function test_recoverStamina_Fail1() public {
        vm.expectRevert(DUEL3Alpha.StaminaRecoveryAlreadyFull.selector);
        alpha.recoverStamina();
    }

    function test_recoverStamina_Success() public {
        // prettier-ignore
        uint[10] memory _playerUnits = [uint(1001),1003,1001,0,0,0,0,0,0,0];

        alpha.startBattle(_playerUnits);
        alpha.recoverStamina{value: 0.003 ether}();
        assertEq(alpha.staminas(address(this)), 0);
        assertEq(address(alpha).balance, 0.003 ether);

        alpha.withdraw();
        assertEq(address(alpha).balance, 0);
    }

    function test_endAndStartBattle_Success() public {
        // prettier-ignore
        uint[10] memory _playerUnits = [uint(1001),1003,1001,0,0,0,0,0,0,0];

        alpha.startBattle(_playerUnits);
        Result _result = Result.WIN;
        bytes memory _signature = getSignatureBySigner(
            alpha.hashTypedDataV4(1, _result)
        );

        // prettier-ignore
        _playerUnits = [uint(1001),1003,1001,1004,0,0,0,0,0,0];
        alpha.endAndStartBattle(1, _result, _signature, _playerUnits);
        assertEq(alpha.playerStage(address(this)), 1);
        _assertUnits(_playerUnits);
    }

    receive() external payable {}
}
