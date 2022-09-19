import React, { useEffect, useState } from 'react';

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

    return (
        <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount }}>
            {children}
        </NFTContext.Provider>
    );
};
