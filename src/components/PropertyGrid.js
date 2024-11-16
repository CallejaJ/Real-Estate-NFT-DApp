import React from 'react';

const PropertyGrid = ({ homes, provider, escrow, account }) => {
    return (
        <div className="cards__grid">
            {homes.map((home, index) => (
                <div className="property__card" key={index}>
                    <div className="relative w-full h-40 overflow-hidden">
                        <img
                            src={home.image}
                            alt="Property"
                            className="w-full h-full object-cover"
                            style={{ maxHeight: '160px' }} // Altura fija más pequeña
                        />
                        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-sm">
                            <span className="font-bold text-gray-900">
                                {home.attributes[0].value} ETH
                            </span>
                        </div>
                    </div>

                    <div className="p-3"> {/* Reduced padding */}
                        <div className="flex items-center gap-3 mb-2 text-sm text-gray-600">
                            <span className="flex items-center">
                                <strong className="mr-1">{home.attributes[2].value}</strong> bed
                            </span>
                            <span className="flex items-center">
                                <strong className="mr-1">{home.attributes[3].value}</strong> bath
                            </span>
                            <span className="flex items-center">
                                <strong className="mr-1">{home.attributes[4].value}</strong> sqft
                            </span>
                        </div>

                        <p className="text-gray-700 font-medium text-sm">{home.address}</p>

                        <div className="mt-3 flex justify-between items-center">
                            <button
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                                style={{
                                    background: 'var(--gradient-primary)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PropertyGrid;