// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EIP712SignatureMock is EIP712 {
    uint public counter;

    constructor(
        string memory name,
        string memory version
    ) EIP712(name, version) {}

    function verify(
        bytes memory signature,
        address signer,
        address mailTo,
        string memory mailContents
    ) external view returns (bool) {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("Mail(address to,string contents)"),
                    mailTo,
                    keccak256(bytes(mailContents))
                )
            )
        );
        address recoveredSigner = ECDSA.recover(digest, signature);
        return recoveredSigner == signer;
    }

    function increment() external {
        counter++;
    }
}
