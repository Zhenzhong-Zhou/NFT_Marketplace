import { useEffect, useState } from 'react';
import Script from 'next/script';
import { ThemeProvider } from 'next-themes';

import { NFTProvider } from '../context/NFTContext';
import { Footer, Navbar } from '../components';
import '../styles/globals.css';

const MyApp = ({ Component, pageProps }) => {
    const [showing, setShowing] = useState(false);

    useEffect(() => {
        setShowing(true);
    }, []);

    if (!showing) {
        return null;
    }

    if (typeof window === 'undefined') {
        return <></>;
    }
    return (
        <NFTProvider>
            <ThemeProvider attribute="class">
                <div className="dark:bg-nft-dark bg-white min-h-screen">
                    <Navbar />
                    <div className="pt-65">
                        <Component {...pageProps} />
                    </div>
                    <Footer />
                    <Script src="https://kit.fontawesome.com/e3d41100ae.js" crossOrigin="anonymous" />
                </div>
            </ThemeProvider>
        </NFTProvider>
    );
};

export default MyApp;
