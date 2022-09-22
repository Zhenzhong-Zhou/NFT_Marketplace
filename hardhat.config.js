const fs = require('fs');

require('@nomiclabs/hardhat-waffle');

const privateKey = fs.readFileSync('.secret').toString().trim();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    networks: {
        hardhat: {
            chainId: 5,
        },
        goerli: {
            url: 'https://eth-goerli.g.alchemy.com/v2/MUDsAx5V8sG53o6rbtu55_7EbBK9TEN-',
            accounts: [privateKey],
        },
    },
    solidity: '0.8.17',
};
