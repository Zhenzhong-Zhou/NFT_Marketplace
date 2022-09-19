import React from 'react';

export const NFTContext = React.createContext();

export const NFTProvider = ({ children }) => {
    const nftCurrency = 'ETH';

    return (
        <NFTContext.Provider value={{ nftCurrency }}>
            {children}
        </NFTContext.Provider>
    );
};
