// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {PlasmaBattle, Result} from "../core/PlasmaBattle.sol";

// import {console2} from "forge-std/console2.sol";

interface IERC721Alpha {
    function mint(address to) external;
}

contract DUEL3Alpha is PlasmaBattle {
    error InvalidUnitId();
    error StaminaNotEnough();
    error StaminaRecoveryPaymentInvalid();
    error StaminaRecoveryAlreadyFull();
    error StageOver();
    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    // Mapping(playerAddress => stage)
    mapping(address => uint) public playerStage;
    // Mapping(playerAddress => playerUnits)
    mapping(address => uint[10]) playerUnits;
    // For alpha testing
    uint[10] public initialUnits;
    mapping(uint => uint) public newUnitByStage;
    mapping(uint => uint[5]) public enemyUnitsByStage;
    //Stamina Mapping(playerAddress => stamina)
    mapping(address => uint8) public staminas;
    uint8 public maxStamina = 6;
    uint public starminaRecoveryCost = 0.01 ether;

    //For completing the game
    address public nftAddress;

    uint public maxStage = 3;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address _signer) PlasmaBattle(_signer) {
        //Set initialUnits
        initialUnits[0] = 1001;
        initialUnits[1] = 1003;
        //Set newUnitsByStage
        newUnitByStage[1] = 1004;
        newUnitByStage[2] = 1005;
        newUnitByStage[3] = 1006;
        //Set enemyUnitsByStage
        enemyUnitsByStage[0] = [1001, 1004];
        enemyUnitsByStage[1] = [1005, 1002];
        enemyUnitsByStage[2] = [1001, 1001, 1002, 1006];
        enemyUnitsByStage[3] = [1007, 1007, 1008];
    }

    /*//////////////////////////////////////////////////////////////
                            OWNER UPDATE
    //////////////////////////////////////////////////////////////*/
    function setInitialUnits(uint[10] memory _initialUnits) external onlyOwner {
        initialUnits = _initialUnits;
    }

    function setNewUnitByStage(
        uint _stage,
        uint _newUnitId
    ) external onlyOwner {
        newUnitByStage[_stage] = _newUnitId;
    }

    function setEnemyUnitsByStage(
        uint _stage,
        uint[5] memory _enemyUnits
    ) external onlyOwner {
        enemyUnitsByStage[_stage] = _enemyUnits;
    }

    function setMaxStamina(uint8 _maxStamina) external onlyOwner {
        maxStamina = _maxStamina;
    }

    function setStaminaRecoveryCost(
        uint _starminaRecoveryCost
    ) external onlyOwner {
        starminaRecoveryCost = _starminaRecoveryCost;
    }

    function setMaxStage(uint _maxStage) external onlyOwner {
        maxStage = _maxStage;
    }

    function setNftAddress(address _nftAddress) external onlyOwner {
        nftAddress = _nftAddress;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/
    function startBattle(uint[10] memory _playerUnits) public returns (uint) {
        if (staminas[msg.sender] >= maxStamina) {
            revert StaminaNotEnough();
        }
        staminas[msg.sender]++;
        uint _stage = playerStage[msg.sender];
        if (_stage > maxStage) {
            revert StageOver();
        }

        //Set initial units
        if (_stage == 0) {
            uint8 _len = uint8(initialUnits.length);
            uint[10] memory _tmpUnits;
            for (uint i = 0; i < _len; i++) {
                _tmpUnits[i] = initialUnits[i];
            }
            playerUnits[msg.sender] = _tmpUnits;
        }

        if (!_validateUnits(playerUnits[msg.sender], _playerUnits)) {
            revert InvalidUnitId();
        }
        playerUnits[msg.sender] = _playerUnits;
        return _startBattle(msg.sender);
    }

    function endBattle(
        uint _battleId,
        Result _result,
        bytes memory _signature
    ) public {
        _endBattle(_battleId, _result, _signature);
        address _player = battleRecord[_battleId].player;
        if (_result == Result.WIN) {
            if (playerStage[_player] == maxStage) {
                //mintNFT
                if (nftAddress != address(0)) {
                    IERC721Alpha(nftAddress).mint(_player);
                }
            }

            //Increment player stage if win
            uint _newStage = playerStage[_player] + 1;
            playerStage[_player] = _newStage;

            uint[10] storage _playerUnits = playerUnits[_player];
            //Add new units to _subUnits (subUnits[5-9])
            for (uint8 i = 5; i < 10; i++) {
                if (_playerUnits[i] == 0) {
                    _playerUnits[i] = newUnitByStage[_newStage];
                    break;
                }
            }
        }
    }

    function recoverStamina() public payable {
        if (staminas[msg.sender] == 0) revert StaminaRecoveryAlreadyFull();
        //to recover, pay ETH
        if (msg.value != starminaRecoveryCost)
            revert StaminaRecoveryPaymentInvalid();

        staminas[msg.sender] = 0;
    }

    function recoverStaminaAndStartBattle(
        uint[10] memory _playerUnits
    ) external payable returns (uint) {
        recoverStamina();
        return startBattle(_playerUnits);
    }

    //Deprecated
    function endAndStartBattle(
        uint _battleId,
        Result _result,
        bytes memory _signature,
        uint[10] memory _playerUnits
    ) external returns (uint) {
        endBattle(_battleId, _result, _signature);
        return startBattle(_playerUnits);
    }

    /*//////////////////////////////////////////////////////////////
                             EXTERNAL VIEW
    //////////////////////////////////////////////////////////////*/
    function getPlayerUnits(
        address _player
    ) external view returns (uint[10] memory) {
        return playerUnits[_player];
    }

    function getEnemyUnits(uint _stage) external view returns (uint[5] memory) {
        return enemyUnitsByStage[_stage];
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                             INTERNAL VIEW
    //////////////////////////////////////////////////////////////*/
    function _validateUnits(
        uint[10] memory _beforeUnits,
        uint[10] memory _playerUnits
    ) internal pure returns (bool) {
        //Check if _beforeUnits and _playerUnits are same after ordering by unitId
        uint[10] memory _sortedBeforeUnits;
        uint[10] memory _sortedPlayerUnits;
        for (uint8 i = 0; i < 10; i++) {
            _sortedBeforeUnits[i] = _beforeUnits[i];
            _sortedPlayerUnits[i] = _playerUnits[i];
        }
        _sortUnits(_sortedBeforeUnits);
        _sortUnits(_sortedPlayerUnits);
        for (uint8 i = 0; i < 10; i++) {
            if (_sortedBeforeUnits[i] != _sortedPlayerUnits[i]) {
                return false;
            }
        }
        return true;
    }

    function _sortUnits(uint[10] memory _units) internal pure {
        for (uint8 i = 0; i < 10; i++) {
            for (uint8 j = i + 1; j < 10; j++) {
                if (_units[i] < _units[j]) {
                    uint _temp = _units[i];
                    _units[i] = _units[j];
                    _units[j] = _temp;
                }
            }
        }
    }
}
