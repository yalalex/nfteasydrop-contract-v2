import { ethers, upgrades } from 'hardhat';

async function main() {
  const NFTEasyDrop = await ethers.getContractFactory('NFTEasyDropV2');
  const nfteasydrop = await upgrades.deployProxy(NFTEasyDrop);
  await nfteasydrop.deployed();
  console.log(
    `NFTEasyDrop contract has been deployed to ${nfteasydrop.address} address`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
