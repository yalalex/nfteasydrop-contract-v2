// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract Mock721 is ERC721, Ownable {
  using Counters for Counters.Counter;

  Counters.Counter private _tokenIdCounter;

  constructor(uint256 _quantity) ERC721('Mock721', 'MCK') {
    for (uint i = 0; i < _quantity; i++) {
      safeMint(address(msg.sender));
    }
  }

  function _baseURI() internal pure override returns (string memory) {
    return 'https://gateway.pinata.cloud/ipfs/whatever/';
  }

  function safeMint(address to) public onlyOwner {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(to, tokenId);
  }
}
