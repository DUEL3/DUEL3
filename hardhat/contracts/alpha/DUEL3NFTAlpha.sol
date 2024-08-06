// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

// import { console2 } from "forge-std/console2.sol";

struct TokenURIParams {
    string name;
    string description;
    string image;
}

contract DUEL3NFTAlpha is ERC721, Ownable {
    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/
    uint public currentTokenId;

    string constant NAME = "DUEL3NFTAlpha";
    string constant DESCRIPTION =
        "This is proof that you are a fantastic duelist! DUEL3: https://x.com/DuelThree";
    uint8 public constant SEASON = 0;
    uint8 public constant MAX_SUPPLY = 100;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address _minter) ERC721(NAME, NAME) Ownable(_minter) {}

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/
    function mint(address _to) external onlyOwner {
        require(currentTokenId < MAX_SUPPLY, "DUEL3NFTAlpha: MAX_SUPPLY");
        currentTokenId++;
        _mint(_to, currentTokenId);
    }

    /*//////////////////////////////////////////////////////////////
                             EXTERNAL VIEW
    //////////////////////////////////////////////////////////////*/

    // prettier-ignore
    function generateImage(uint256 _tokenId)
        public
        pure
        returns (string memory)
    {
        return
            Base64.encode(bytes(
                string(
                    abi.encodePacked(
'<svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg"><defs><style type="text/css">.text-style { fill: #fff;text-anchor: middle; }</style></defs><rect width="100%" height="100%" fill="#06330D" /><circle cx="160" cy="160" r="157" fill="none" stroke="#FFFFFF" stroke-width="6" /><circle cx="160" cy="160" r="148" fill="none" stroke="#FFFFFF" stroke-width="1" /><text x="160" y="136" font-size="48" class="text-style">DUEL COIN</text><text x="160" y="168" font-size="22" class="text-style">SEASON ',
Strings.toString(SEASON),
'</text><text x="160" y="232" font-size="32" class="text-style">',
Strings.toString(_tokenId),
'/',
Strings.toString(MAX_SUPPLY),
'</text><text x="160" y="252" font-size="14" class="text-style">You are a fantastic duelist!</text><text x="160" y="290" font-size="18" class="text-style">by DUEL3</text></svg>'
                    )
                )
            ));
    }

    function tokenURI(
        uint256 _id
    ) public pure override returns (string memory) {
        TokenURIParams memory params = TokenURIParams({
            name: string(abi.encodePacked(NAME, " #", Strings.toString(_id))),
            description: DESCRIPTION,
            image: generateImage(_id)
        });
        return constructTokenURI(params);
    }

    /*//////////////////////////////////////////////////////////////
                             INTERNAL VIEW
    //////////////////////////////////////////////////////////////*/
    function constructTokenURI(
        TokenURIParams memory params
    ) public pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                params.name,
                                '", "description":"',
                                params.description,
                                '", "image": "data:image/svg+xml;base64,',
                                params.image,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    /*//////////////////////////////////////////////////////////////
                            INTERNAL UPDATE
    //////////////////////////////////////////////////////////////*/
}
