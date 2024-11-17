import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import close from '../assets/close.svg';

const Home = ({ home, provider, escrow, togglePop }) => {
    if (!home) return null;

    return (
        <div className="home">
            <div className="home__details">
                <div className="home__image">
                    <img
                        src={home.image}
                        alt="Property"
                    />
                </div>

                <div className="home__overview">
                    <h1>{home.name || "Luxury Property"}</h1>
                    <p className="home__overview-price">{home.attributes[0].value} ETH</p>
                    <div className="home__overview-details">
                        <span><strong>{home.attributes[2].value}</strong> bed</span>
                        <span className="separator">|</span>
                        <span><strong>{home.attributes[3].value}</strong> bath</span>
                        <span className="separator">|</span>
                        <span><strong>{home.attributes[4].value}</strong> sqft</span>
                    </div>
                    <p className="home__overview-address">{home.address}</p>
                </div>

                <img
                    src={close}
                    className="home__close"
                    onClick={togglePop}
                    alt="Close"
                />
            </div>
        </div>
    );
}

export default Home;