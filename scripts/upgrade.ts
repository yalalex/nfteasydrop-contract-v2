import { ethers, upgrades } from 'hardhat';

const PROXY = '0x02f2CEC66630bEB9B2C64a09b67FCEFC85B8c0f1';

async function main() {
  const NFTEasyDrop = await ethers.getContractFactory('NFTEasyDropV3');
  await upgrades.upgradeProxy(PROXY, NFTEasyDrop);
  console.log('Implementation upgraded');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
