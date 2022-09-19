const hre = require('hardhat');

async function main() {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

    const NFTMarketplace = await hre.ethers.getContractFactory('NFTMarketplace');
    const nftMarketplace = await NFTMarketplace.deploy();

    await nftMarketplace.deployed();

    console.log(
        `NFTMarketplace with 1 ETH and unlock timestamp ${unlockTime} deployed to ${nftMarketplace.address}`,
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
