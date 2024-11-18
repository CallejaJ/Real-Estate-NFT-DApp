import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
    const [buyer, setBuyer] = useState(null);
    const [lender, setLender] = useState(null);
    const [inspector, setInspector] = useState(null);
    const [seller, setSeller] = useState(null);
    const [hasBought, setHasBought] = useState(false);
    const [hasLended, setHasLended] = useState(false);
    const [hasInspected, setHasInspected] = useState(false);
    const [hasSold, setHasSold] = useState(false);
    const [owner, setOwner] = useState(null);

    const fetchDetails = async () => {
        try {
            if (!escrow || !home) return;

            // Buyer
            const buyer = await escrow.buyer(home.id);
            setBuyer(buyer);
            const hasBought = await escrow.approval(home.id, buyer);
            setHasBought(hasBought);

            // Lender
            const lender = await escrow.lender();
            setLender(lender);
            const hasLended = await escrow.approval(home.id, lender);
            setHasLended(hasLended);

            // Inspector
            const inspector = await escrow.inspector();
            setInspector(inspector);
            const hasInspected = await escrow.inspectionPassed(home.id);
            setHasInspected(hasInspected);

            // Seller
            const seller = await escrow.seller();
            setSeller(seller);
            const hasSold = await escrow.approval(home.id, seller);
            setHasSold(hasSold);

        } catch (error) {
            console.error("Error in fetchDetails:", error);
        }
    }

    const fetchOwner = async () => {
        try {
            if (!escrow || !home) return;

            const isListed = await escrow.isListed(home.id);
            if (!isListed) {
                const owner = await escrow.buyer(home.id);
                setOwner(owner);
            } else {
                setOwner(null);
            }
        } catch (error) {
            console.error("Error in fetchOwner:", error);
        }
    }


    useEffect(() => {
        const init = async () => {
            try {
                await fetchOwner();
                await fetchDetails();
            } catch (error) {
                console.error("Error initializing:", error);
            }
        };

        if (home && escrow) {
            init();
        }
    }, [account, home, escrow, hasSold]); 

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

                    {owner ? (
                        <div className="home__owned">
                            Owned by {owner.slice(0, 6) + "..." + owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div className="home__buttons">
                            {account === inspector ? (
                                <button className="home__buy">
                                    Approve Inspection
                                </button>
                            ) : account === lender ? (
                                <button className="home__buy">
                                    Approve & Lend
                                </button>
                            ) : account === seller ? (
                                <button className="home__buy">
                                    Approve & Sell
                                </button>
                            ) : (
                                <button className="home__buy">
                                    Buy
                                </button>
                            )}
                            <button className="home__contact">
                                Contact agent
                            </button>
                        </div>

                    )}

                    <div>
                        <h2>Overview</h2>
                        <p>{home.description}</p>
                    </div>

                    <div>
                        <h2>Facts and Features</h2>
                        <ul>
                            {home.attributes.map((attribute, index) => (
                                <li key={index}>
                                    <strong>{attribute.trait_type}</strong> {attribute.value}
                                </li>
                            ))}
                        </ul>
                    </div>

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