// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Mock20 is ERC20 {
  constructor(uint256 _quantity) ERC20('Mock20', 'M20') {
    _mint(msg.sender, _quantity);
  }
}
