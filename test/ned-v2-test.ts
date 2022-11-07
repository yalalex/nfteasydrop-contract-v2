import { loadFixture, expect, ethers, time } from './setup';
import 'solidity-coverage';

import { addresses } from './addresses';

describe('NFTEasyDropV2Test', () => {
  const quantity = addresses.length;
  const ids = Array.from({ length: quantity }, () =>
    Math.floor(Math.random() * quantity)
  );
  const amounts = Array.from({ length: quantity }, () =>
    Math.floor(Math.random() * 10)
  );
  const sumAmountInt = amounts.reduce((x, y) => x + y);
  const sumAmount = ethers.utils.parseEther(sumAmountInt.toString());

  const deployNED = async () => {
    const [owner, user] = await ethers.getSigners();

    const NFTEasyDrop = await ethers.getContractFactory('NFTEasyDropV2Test');
    const nfteasydrop = await NFTEasyDrop.deploy();
    await nfteasydrop.deployed();

    return { nfteasydrop, owner, user };
  };

  const deployWithMocks = async () => {
    const [owner] = await ethers.getSigners();

    const NFTEasyDrop = await ethers.getContractFactory('NFTEasyDropV2Test');
    const nfteasydrop = await NFTEasyDrop.deploy();
    await nfteasydrop.deployed();

    const Mock721 = await ethers.getContractFactory('Mock721');
    const mock721 = await Mock721.deploy(quantity);
    await mock721.deployed();

    const Mock1155 = await ethers.getContractFactory('Mock1155');
    const mock1155 = await Mock1155.deploy(quantity, ids, amounts);
    await mock1155.deployed();

    const Mock20 = await ethers.getContractFactory('Mock20');
    const mock20 = await Mock20.deploy(sumAmount);
    await mock20.deployed();

    return { nfteasydrop, owner, mock721, mock1155, mock20 };
  };

  it('Should set msg.sender as the owner', async () => {
    const { nfteasydrop, owner } = await loadFixture(deployNED);
    expect(await nfteasydrop.owner()).to.equal(owner.address);
  });

  it('Should accept funds sent directly to the contract and emit ReceivedUndefiendETH event', async () => {
    const { owner, nfteasydrop } = await loadFixture(deployNED);
    const amountSent = ethers.utils.parseEther('1');
    const sendEth = await owner.sendTransaction({
      to: nfteasydrop.address,
      value: amountSent,
    });
    const timestamp = await time.latest();
    await expect(sendEth).to.changeEtherBalance(nfteasydrop, amountSent);
    await expect(sendEth)
      .to.emit(nfteasydrop, 'ReceivedUndefiendETH')
      .withArgs(owner.address, amountSent, timestamp);
  });

  it('Should change the owner', async () => {
    const { nfteasydrop, user } = await loadFixture(deployNED);
    await nfteasydrop.setOwner(user.address);
    expect(await nfteasydrop.owner()).to.equal(user.address);
  });

  it('Should change the transaction fee', async () => {
    const { nfteasydrop } = await loadFixture(deployNED);
    const newFee = ethers.utils.parseEther('1');
    await nfteasydrop.setTxFee(newFee);
    expect(await nfteasydrop.txFee()).to.equal(newFee);
  });

  it('Should change the subscription fees', async () => {
    const { nfteasydrop } = await loadFixture(deployNED);
    const newSubFees = ['1', '2', '3', '4'];
    const newSubFeesParsed = newSubFees.map((fee) =>
      ethers.utils.parseEther(fee)
    );
    await nfteasydrop.setSubFees(
      newSubFeesParsed[0],
      newSubFeesParsed[1],
      newSubFeesParsed[2],
      newSubFeesParsed[3]
    );
    expect(await nfteasydrop.subscriptionFees(1)).to.equal(
      ethers.utils.parseEther(newSubFees[1])
    );
  });

  it('Should revert user who is already subscribed or trying to pay less than minimum subscription fee', async () => {
    const { nfteasydrop, user } = await loadFixture(deployNED);
    await expect(
      nfteasydrop
        .connect(user)
        .subscribe({ value: ethers.utils.parseEther('0.1') })
    ).to.be.revertedWithCustomError(nfteasydrop, 'ValueIsLessThanMinimumFee');

    await nfteasydrop.addCustomSub(user.address, 1000);
    await expect(
      nfteasydrop
        .connect(user)
        .subscribe({ value: ethers.utils.parseEther('1') })
    ).to.be.revertedWithCustomError(nfteasydrop, 'AlreadySubscribed');
  });

  it('Should subscribe user and emit Subscription event', async () => {
    const { nfteasydrop, user } = await loadFixture(deployNED);
    const tx = await nfteasydrop
      .connect(user)
      .subscribe({ value: ethers.utils.parseEther('1') });
    expect(await nfteasydrop.subscribers(user.address)).to.equal(
      (await time.latest()) + 31556926
    );
    await expect(tx)
      .to.emit(nfteasydrop, 'Subscription')
      .withArgs(user.address, await time.latest(), 31556926);
  });

  it('Should emit ReceivedUndefiendETH event when called subscribe() with custom ETH amount', async () => {
    const { nfteasydrop, user } = await loadFixture(deployNED);
    const amount = ethers.utils.parseEther('2');
    const tx = await nfteasydrop.connect(user).subscribe({ value: amount });

    await expect(tx)
      .to.emit(nfteasydrop, 'ReceivedUndefiendETH')
      .withArgs(user.address, amount, await time.latest());
  });

  it('Should revert when trying to remove non-existing sub', async () => {
    const { nfteasydrop, user } = await loadFixture(deployNED);
    await expect(
      nfteasydrop.removeSub(user.address)
    ).to.be.revertedWithCustomError(nfteasydrop, 'NotSubscribed');
  });

  it('Should remove expired sub', async () => {
    const { nfteasydrop, user } = await loadFixture(deployNED);
    await nfteasydrop
      .connect(user)
      .subscribe({ value: ethers.utils.parseEther('1') });

    await nfteasydrop.removeSub(user.address);
    expect(await nfteasydrop.subscribers(user.address)).to.equal(0);
  });

  it('Should remove all expired subs', async () => {
    const { nfteasydrop } = await loadFixture(deployNED);
    const users = await ethers.getSigners();
    users.shift();

    const middleIndex = Math.floor(users.length / 2);
    const firstHalf = users.slice().splice(0, middleIndex);
    const secondHalf = users.slice().splice(-middleIndex);

    firstHalf.forEach(
      async (user) => await nfteasydrop.addCustomSub(user.address, 500)
    );
    secondHalf.forEach(
      async (user) => await nfteasydrop.addCustomSub(user.address, 1000)
    );

    const userAddresses = users.map((user) => user.address);

    await time.increase(600);

    await nfteasydrop.removeAllExpiredSubs(userAddresses);

    expect(await nfteasydrop.subscribers(users[3].address)).to.equal(0);
    expect(await nfteasydrop.subscribers(users[12].address)).to.be.greaterThan(
      0
    );
  });

  it('Should send erc-721 tokens to multiple addresses and emit Airdrop721 event', async () => {
    const { nfteasydrop, owner, mock721 } = await loadFixture(deployWithMocks);

    const ids = [...Array(addresses.length).keys()];

    await mock721.setApprovalForAll(nfteasydrop.address, true);

    const airdropTx = await nfteasydrop.airdropERC721(
      mock721.address,
      addresses,
      ids
    );

    await expect(airdropTx)
      .to.emit(nfteasydrop, 'AirdropERC721')
      .withArgs(owner.address, mock721.address, await time.latest());

    expect(await mock721.ownerOf(3)).to.equal(addresses[3]);
  });

  it('Should send erc-1155 tokens to multiple addresses and emit Airdrop1155 event', async () => {
    const { nfteasydrop, owner, mock1155 } = await loadFixture(deployWithMocks);

    await mock1155.setApprovalForAll(nfteasydrop.address, true);

    const airdropTx = await nfteasydrop.airdropERC1155(
      mock1155.address,
      addresses,
      ids,
      amounts
    );

    await expect(airdropTx)
      .to.emit(nfteasydrop, 'AirdropERC1155')
      .withArgs(owner.address, mock1155.address, await time.latest());

    expect(await mock1155.balanceOf(addresses[7], ids[7])).to.equal(amounts[7]);
  });

  it('Should send erc-20 tokens to multiple addresses and emit Airdrop20 event', async () => {
    const { nfteasydrop, owner, mock20 } = await loadFixture(deployWithMocks);

    await mock20.approve(nfteasydrop.address, sumAmount);

    const airdropTx = await nfteasydrop.airdropERC20(
      mock20.address,
      addresses,
      amounts,
      sumAmount
    );

    await expect(airdropTx)
      .to.emit(nfteasydrop, 'AirdropERC20')
      .withArgs(owner.address, mock20.address, await time.latest());

    expect(await mock20.balanceOf(addresses[5])).to.equal(
      ethers.utils.parseEther(amounts[5].toString())
    );
  });

  it('Should return correct NFT token approval status', async () => {
    const { nfteasydrop, owner, mock721, mock1155 } = await loadFixture(
      deployWithMocks
    );
    await mock721.setApprovalForAll(nfteasydrop.address, true);
    expect(await nfteasydrop.isApproved(mock721.address)).to.equal(
      await mock721.isApprovedForAll(owner.address, nfteasydrop.address)
    );
    expect(await nfteasydrop.isApproved(mock1155.address)).to.equal(
      await mock1155.isApprovedForAll(owner.address, nfteasydrop.address)
    );
  });

  it('Should revert erc-20 airdrop with custom error InsufficientBalance', async () => {
    const { nfteasydrop, mock20 } = await loadFixture(deployWithMocks);
    await expect(
      nfteasydrop.airdropERC20(
        mock20.address,
        addresses,
        amounts,
        ethers.utils.parseEther((sumAmountInt + 1).toString())
      )
    ).to.be.revertedWithCustomError(nfteasydrop, 'InsufficientBalance');
  });

  it('Should revert erc-20 airdrop with custom error InsufficientAllowance', async () => {
    const { nfteasydrop, mock20 } = await loadFixture(deployWithMocks);
    await mock20.approve(
      nfteasydrop.address,
      ethers.utils.parseEther((sumAmountInt - 1).toString())
    );
    await expect(
      nfteasydrop.airdropERC20(mock20.address, addresses, amounts, sumAmount)
    ).to.be.revertedWithCustomError(nfteasydrop, 'InsufficientAllowance');
  });

  it('Should track all received funds', async () => {
    const { nfteasydrop, user } = await loadFixture(deployNED);
    const amountSent1 = ethers.utils.parseEther('1');
    const amountSent2 = ethers.utils.parseEther('2');
    await user.sendTransaction({ to: nfteasydrop.address, value: amountSent1 });
    await nfteasydrop.withdraw();
    await user.sendTransaction({ to: nfteasydrop.address, value: amountSent2 });
    expect(await nfteasydrop.receivedTotal()).to.equal(
      amountSent1.add(amountSent2)
    );
  });

  it('Should return correct balance of the contract with checkBalance() function', async () => {
    const { nfteasydrop, user } = await loadFixture(deployNED);
    await user.sendTransaction({
      to: nfteasydrop.address,
      value: ethers.utils.parseEther('10'),
    });
    expect(await ethers.provider.getBalance(nfteasydrop.address)).to.equal(
      await nfteasydrop.contractBalance()
    );
  });

  it('Should withdraw full contract balance to the owner address', async () => {
    const { nfteasydrop, owner, user } = await loadFixture(deployNED);
    const amountSent1 = ethers.utils.parseEther('1');
    const amountSent2 = ethers.utils.parseEther('2');
    await user.sendTransaction({ to: nfteasydrop.address, value: amountSent1 });
    await user.sendTransaction({ to: nfteasydrop.address, value: amountSent2 });
    const balance = await nfteasydrop.contractBalance();
    await expect(await nfteasydrop.withdraw()).to.changeEtherBalance(
      owner,
      balance
    );
  });
});
