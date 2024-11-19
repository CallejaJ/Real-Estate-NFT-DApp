import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import close from '../assets/close.svg';

const EthLogo = () => (
    <svg width="11" height="18" viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
        <path d="M5.5 0L0 9.18L5.5 12.426L11 9.18L5.5 0Z" fill="currentColor" />
        <path d="M5.5 13.446L0 10.2L5.5 17.9999L11 10.2L5.5 13.446Z" fill="currentColor" />
    </svg>
);

const Home = ({ home, provider, account, escrow, togglePop }) => {
    const [hasBought, setHasBought] = useState(false)
    const [hasLended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    const [buyer, setBuyer] = useState(null)
    const [lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)

    const [owner, setOwner] = useState(null)
    const [error, setError] = useState(null)

    const fetchDetails = async () => {
        if (!escrow || !home || !home.id) {
            console.log('Missing required data:', { escrow: !!escrow, home: !!home, homeId: home?.id });
            return;
        }

        try {
            // -- Buyer
            const buyer = await escrow.buyer(home.id)
            setBuyer(buyer)

            const hasBought = await escrow.approval(home.id, buyer)
            setHasBought(hasBought)

            // -- Seller
            const seller = await escrow.seller()
            setSeller(seller)

            const hasSold = await escrow.approval(home.id, seller)
            setHasSold(hasSold)

            // -- Lender
            const lender = await escrow.lender()
            setLender(lender)

            const hasLended = await escrow.approval(home.id, lender)
            setHasLended(hasLended)

            // -- Inspector
            const inspector = await escrow.inspector()
            setInspector(inspector)

            const hasInspected = await escrow.inspectionPassed(home.id)
            setHasInspected(hasInspected)

            setError(null)
        } catch (error) {
            console.error('Error fetching details:', error)
            setError('Error loading property details')
        }
    }

    const fetchOwner = async () => {
        if (!escrow || !home || !home.id) return;

        try {
            const isListed = await escrow.isListed(home.id)
            if (isListed) return;

            const owner = await escrow.buyer(home.id)
            setOwner(owner)
        } catch (error) {
            console.error('Error fetching owner:', error)
        }
    }

    const buyHandler = async () => {
        try {
            const escrowAmount = await escrow.escrowAmount(home.id)
            const signer = await provider.getSigner()

            // Buyer deposit earnest
            let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount })
            await transaction.wait()

            // Buyer approves...
            transaction = await escrow.connect(signer).approveSale(home.id)
            await transaction.wait()

            setHasBought(true)
            setError(null)
        } catch (error) {
            console.error('Error in buy transaction:', error)
            setError('Error processing purchase')
        }
    }

    const inspectHandler = async () => {
        try {
            const signer = await provider.getSigner()

            const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true)
            await transaction.wait()

            setHasInspected(true)
            setError(null)
        } catch (error) {
            console.error('Error in inspection:', error)
            setError('Error updating inspection status')
        }
    }

    const lendHandler = async () => {
        try {
            const signer = await provider.getSigner()

            // Lender approves...
            let transaction = await escrow.connect(signer).approveSale(home.id)
            await transaction.wait()

            // Lender sends funds to contract...
            const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
            await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 })

            setHasLended(true)
            setError(null)
        } catch (error) {
            console.error('Error in lending:', error)
            setError('Error processing lending')
        }
    }

    const sellHandler = async () => {
        try {
            const signer = await provider.getSigner()

            // Seller approves...
            let transaction = await escrow.connect(signer).approveSale(home.id)
            await transaction.wait()

            // Seller finalize...
            transaction = await escrow.connect(signer).finalizeSale(home.id)
            await transaction.wait()

            setHasSold(true)
            setError(null)
        } catch (error) {
            console.error('Error in sale:', error)
            setError('Error processing sale')
        }
    }

    // Debug: Monitorear cambios en la cuenta
    useEffect(() => {
        console.log('Home component - current account:', account);
    }, [account]);

    useEffect(() => {
        if (escrow && home && home.id) {
            fetchDetails()
            fetchOwner()
        }
    }, [hasSold, escrow, home, account])

    if (!home || !home.id) {
        return <div className="home">Loading property details...</div>;
    }

    const formatPrice = (value) => {
        // Asumiendo que value es un string que contiene un número
        const numericValue = parseFloat(value);
        return numericValue === 10 ? "10" : value; // Convierte específicamente 10 ETH
    };

    return (
        <div className="home">
            {error && (
                <div className="error-message" style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '12px 24px',
                    margin: '10px auto',
                    maxWidth: '600px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    border: '1px solid #ef9a9a'
                }}>
                    {error}
                </div>
            )}

            <div className="home__details">
                <div className="home__image">
                    <img
                        src={home.image}
                        alt="Property"
                    />
                </div>

                <div className="home__overview">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <h1 style={{ margin: '0' }}>{home.name || "WA Nature Home"}</h1>
                        <p style={{
                            margin: '0',
                            fontSize: '32px',
                            fontWeight: '600',
                            color: '#2196F3',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            {home.attributes[0].value}
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                marginLeft: '8px',
                                fontSize: '28px'
                            }}>
                                ETH <EthLogo />
                            </span>
                        </p>
                    </div>

                    <div className="home__overview-details">
                        <span><strong>{home.attributes[2].value}</strong> bed</span>
                        <span className="separator">|</span>
                        <span><strong>{home.attributes[3].value}</strong> bath</span>
                        <span className="separator">|</span>
                        <span><strong>{home.attributes[4].value}</strong> sqft</span>
                    </div>
                    <p className="home__overview-address">{home.address}</p>

                    {!account ? (
                        <div className="home__connect-message">
                            Please connect your wallet to interact
                        </div>
                    ) : owner ? (
                        <div className="home__owned">
                            Owned by {owner.slice(0, 6) + "..." + owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div className="home__buttons">
                                    {(account === inspector) ? (
                                        <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                    Approve Inspection
                                </button>
                                    ) : (account === lender) ? (
                                        <button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                    Approve & Lend
                                </button>
                                        ) : (account === seller) ? (
                                            <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                    Approve & Sell
                                </button>
                            ) : (
                                                    <button className='home__buy' onClick={buyHandler} disabled={hasBought}>
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