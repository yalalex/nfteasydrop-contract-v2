// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract Mock1155 is ERC1155, Ownable {
  constructor(
    uint256 _quantity,
    uint256[] memory _id,
    uint256[] memory _amount
  ) ERC1155('https://gateway.pinata.cloud/ipfs/whatever/') {
    for (uint256 i = 0; i < _quantity; i++) {
      _mint(msg.sender, _id[i], _amount[i], '');
    }
  }

  function mint(
    address account,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) public onlyOwner {
    _mint(account, id, amount, data);
  }

  function mintBatch(
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) public onlyOwner {
    _mintBatch(to, ids, amounts, data);
  }
}
