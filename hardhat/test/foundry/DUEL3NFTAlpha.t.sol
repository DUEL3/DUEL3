// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.23 <0.9.0;

import {BaseTest, console2} from "./BaseTest.sol";
import {DUEL3NFTAlpha} from "../../contracts/alpha/DUEL3NFTAlpha.sol";

contract DUEL3NFTAlphaTest is BaseTest {
    DUEL3NFTAlpha internal nft;

    /// @dev A function invoked before each test case is run.
    function setUp() public virtual {
        _setUp();
        nft = new DUEL3NFTAlpha(address(this));
    }

    function test_mint_Success() public {
        nft.mint(address(this));
        assertEq(nft.ownerOf(1), address(this));
        // console2.log(nft.tokenURI(2));
    }
}
