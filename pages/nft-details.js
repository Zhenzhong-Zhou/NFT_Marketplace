import { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { NFTContext } from '../context/NFTContext';
import images from '../assets';

const NFTDetails = () => {
    const { currentAccount } = useContext(NFTContext);
    const [isLoading, setIsLoading] = useState(true);
    const [nft, setNft] = useState({ image: '', tokenId: '', name: '', owner: '', seller: '', price: '' });
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady) return;

        setNft(router.query);

        setIsLoading(false);
    }, [router.isReady]);

    return (
        <div className="relative flex justify-center md:flex-col min-h-screen">
            <div
              className="relative flex-1 flexCenter sm:px-4 p-12 border-r md:border-r-0 md:border-b dark:border-nft-black-1 border-nft-gray-1"
            >
                <div className="">
                    <Image src={nft.image || images.nft4} />
                </div>
            </div>
        </div>
    );
};

export default NFTDetails;
