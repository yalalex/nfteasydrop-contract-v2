import { ethers } from 'hardhat';

async function main() {
  const [owner] = await ethers.getSigners();

  const quantity = 10000;
  const id = 1;
  const amount = 1;
  const ids = Array(quantity).fill(id);
  const amounts = Array(quantity).fill(amount);

  const NFTEasyDrop = await ethers.getContractFactory('NFTEasyDropV2Test');
  const nfteasydrop = await NFTEasyDrop.deploy();
  await nfteasydrop.deployed();
  console.log(
    `NFTEasyDrop contract has been deployed to ${nfteasydrop.address} address`
  );

  const Mock721 = await ethers.getContractFactory('Mock721');
  const mock721 = await Mock721.deploy(quantity);
  await mock721.deployed();
  console.log(
    `Mock721 contract has been deployed to ${mock721.address} address, ${quantity} tokens minted to ${owner.address} address`
  );

  const Mock1155 = await ethers.getContractFactory('Mock1155');
  const mock1155 = await Mock1155.deploy(quantity, ids, amounts);
  await mock1155.deployed();
  console.log(
    `Mock1155 contract has been deployed to ${mock1155.address} address, ${quantity} tokens with ID of ${id} has been minted to ${owner.address} address`
  );

  const Mock20 = await ethers.getContractFactory('Mock20');
  const mock20 = await Mock20.deploy(quantity * 10);
  await mock20.deployed();

  console.log(
    `Mock20 contract has been deployed to ${mock20.address} address, ${
      quantity * 10
    } tokens has been minted to ${owner.address} address`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
