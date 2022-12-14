import React, { useEffect, useState } from 'react';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import axios from 'axios';

import { MarketAddress, MarketAddressABI } from './constants';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
const projectSecret = process.env.NEXT_PUBLIC_API_KEY;
const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;
const options = { host: 'ipfs.infura.io', protocol: 'https', port: 5001, headers: { authorization: auth } };
const client = ipfsHttpClient(options);
const dedicatedEndPoint = `https://${process.env.NEXT_PUBLIC_END_POINT}`;

const fetchContract = (signerOrProvider) => new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
    const nftCurrency = 'ETH';
    const [currentAccount, setCurrentAccount] = useState('');
    const [isLoadingNFT, setIsLoadingNFT] = useState(false);

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

    const createNFT = async (formInput, fileUrl, router) => {
        const { name, description, price } = formInput;

        if (!name || !description || !price || !fileUrl) return;

        const data = JSON.stringify({ name, description, image: fileUrl });

        try {
            const added = await client.add(data);

            const url = `${dedicatedEndPoint}/ipfs/${added.path}`;

            await createSale(url, price);

            router.push('/');
        } catch (e) {
            console.log('Error creating file to IPFS :', e);
        }
    };

    const createSale = async (url, formInputPrice, isReselling, id) => {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const price = ethers.utils.parseUnits(formInputPrice, 'ether');
        const contract = fetchContract(signer);
        const listingPrice = await contract.getListingPrice();
        const transaction = !isReselling
            ? await contract.createToken(url, price, { value: listingPrice.toString() })
            : await contract.resellToken(id, price, { value: listingPrice.toString() });

        setIsLoadingNFT(true);
        await transaction.wait();
    };

    const fetchNFTs = async () => {
        setIsLoadingNFT(false);

        const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_URL);
        const contract = fetchContract(provider);

        const data = await contract.fetchMarketItems();

        const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);
            const { data: { image, name, description } } = await axios.get(tokenURI);
            const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');

            return {
                price,
                tokenId: tokenId.toNumber(),
                id: tokenId.toNumber(),
                seller,
                owner,
                image,
                name,
                description,
                tokenURI,
            };
        }));

        return items;
    };

    const fetchMyNFTsOrListedNFTs = async (type) => {
        setIsLoadingNFT(false);

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();

        const contract = fetchContract(signer);

        const data = type === 'fetchItemsListed' ? await contract.fetchItemsListed() : await contract.fetchMyItems();

        const items = await Promise.all(data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);
            const { data: { image, name, description } } = await axios.get(tokenURI);
            const price = ethers.utils.formatUnits(unformattedPrice.toString(), 'ether');

            return {
                price,
                tokenId: tokenId.toNumber(),
                id: tokenId.toNumber(),
                seller,
                owner,
                image,
                name,
                description,
                tokenURI,
            };
        }));

        return items;
    };

    const buyNFT = async (nft) => {
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);

        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
        const transaction = await contract.createMarketSale(nft.tokenId, { value: price });

        setIsLoadingNFT(true);
        await transaction.wait();
        setIsLoadingNFT(false);
    };

    return (
        <NFTContext.Provider value={{
            nftCurrency,
            connectWallet,
            currentAccount,
            uploadToIPFS,
            createNFT,
            fetchNFTs,
            fetchMyNFTsOrListedNFTs,
            buyNFT,
            createSale,
            isLoadingNFT,
        }}
        >
            {children}
        </NFTContext.Provider>
    );
};
