import React from 'react';

const PropertyGrid = ({ homes, provider, escrow, account }) => {
    return (
        <div className="cards__grid">
            {homes.map((home, index) => (
                <div className="property__card" key={index}>
                    <div className="relative w-full overflow-hidden">
                        <img
                            src={home.image}
                            alt="Property"
                            className="w-full object-cover"
                        />
                    </div>

                    <div className="property__price">
                        {home.attributes[0].value} ETH
                    </div>

                    <div className="property__details">
                        <span><strong>{home.attributes[2].value}</strong>bed</span>
                        <span className="separator">|</span>
                        <span><strong>{home.attributes[3].value}</strong>bath</span>
                        <span className="separator">|</span>
                        <span><strong>{home.attributes[4].value}</strong>sqft</span>
                    </div>

                    <div className="property__address">
                        {home.address}
                    </div>

                    <button className="more-info-btn">
                        More Info
                    </button>
                </div>
            ))}
        </div>
    );
};

export default PropertyGrid;