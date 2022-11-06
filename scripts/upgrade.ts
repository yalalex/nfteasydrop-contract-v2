import { ethers, upgrades } from 'hardhat';

const PROXY = ''; // FILL AFTER DEPLOYING TO MAINNET

async function main() {
  const NFTEasyDrop = await ethers.getContractFactory('NFTEasyDropV3');
  await upgrades.upgradeProxy(PROXY, NFTEasyDrop);
  console.log('Implementation upgraded');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
