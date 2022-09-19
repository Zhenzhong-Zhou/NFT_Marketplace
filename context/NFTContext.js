import React, { useEffect, useState } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_API_KEY;
const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;
const options = { host: 'ipfs.infura.io', protocol: 'https', port: 5001, headers: { authorization: auth } };
const client = ipfsHttpClient(options);
const dedicatedEndPoint = process.env.NEXT_PUBLIC_END_POINT;

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
    const nftCurrency = 'ETH';
    const [currentAccount, setCurrentAccount] = useState('');

    const checkIfWalletIsConnected = async () => {
        if (!window.ethereum) return alert('Please install MetaMask');

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });

        if (accounts.length) {
            setCurrentAccount(accounts[0]);
        } else {
            console.log('No accounts found.');
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected().then();
    }, []);

    const connectWallet = async () => {
        if (!window.ethereum) return alert('Please install MetaMask');

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        setCurrentAccount(accounts[0]);

        window.location.reload();
    };

    const uploadToIPFS = async (file) => {
        try {
            const added = await client.add({ content: file });

            return `${dedicatedEndPoint}/ipfs/${added.path}`;
        } catch (e) {
            console.log('Error uploading file to IPFS :', e);
        }
    };

    return (
        <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount, uploadToIPFS }}>
            {children}
        </NFTContext.Provider>
    );
};
