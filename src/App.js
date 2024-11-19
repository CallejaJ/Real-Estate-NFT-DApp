import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [account, setAccount] = useState(null);
  const [homes, setHomes] = useState([]);
  const [home, setHome] = useState({});
  const [toggle, setToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadBlockchainData = async () => {
    setIsLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const network = await provider.getNetwork();

      const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider);
      const totalSupply = await realEstate.totalSupply();
      const homes = [];

      for (let i = 1; i <= totalSupply; i++) {
        const uri = await realEstate.tokenURI(i);
        const response = await fetch(uri);
        const metadata = await response.json();
        homes.push(metadata);
      }

      setHomes(homes);

      const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider);
      setEscrow(escrow);

      // Obtener la cuenta actual si existe
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const account = ethers.utils.getAddress(accounts[0]);
        setAccount(account);
      }

    } catch (error) {
      console.error('Error loading blockchain data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlockchainData();

    // Manejadores de eventos de MetaMask
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          const account = ethers.utils.getAddress(accounts[0]);
          setAccount(account);
        } else {
          setAccount(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    // Limpieza de eventos
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => { });
        window.ethereum.removeListener('chainChanged', () => { });
      }
    };
  }, []);

  // Debug: Monitorear cambios en la cuenta
  useEffect(() => {
    console.log('Current account:', account);
  }, [account]);

  const togglePop = (home) => {
    setHome(home);
    setToggle(!toggle);
  };

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <div className="container">
        <header className="header">
          <h1 className="header__title">Discover, Buy and Sell Real Estate NFTs</h1>
          <p className="header__subtitle">The future of real estate investment is here</p>

          <Search />

          <div className="stats">
            <div className="stat__item">
              <span className="stat__number">1000+</span>
              <span className="stat__label">Properties Listed</span>
            </div>
            <div className="stat__item">
              <span className="stat__number">500+</span>
              <span className="stat__label">Successful Sales</span>
            </div>
            <div className="stat__item">
              <span className="stat__number">100+</span>
              <span className="stat__label">Cities</span>
            </div>
          </div>
        </header>

        <main>
          <section className="featured__properties">
            {isLoading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading properties...</p>
              </div>
            ) : (
                <div className="cards__grid">
                  {homes.map((home, index) => (
                    <div className="property__card" key={index} onClick={() => togglePop(home)}>
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
                        <span><strong>{home.attributes[2].value}</strong> bed</span>
                        <span className="separator">|</span>
                        <span><strong>{home.attributes[3].value}</strong> bath</span>
                        <span className="separator">|</span>
                        <span><strong>{home.attributes[4].value}</strong> sqft</span>
                      </div>

                      <div className="property__address">
                        {home.address}
                      </div>

                      <button
                        className="more-info-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePop(home);
                        }}
                      >
                        More Info
                      </button>
                    </div>
                  ))}
                </div>
            )}
          </section>
        </main>
      </div>

      {toggle && (
        <Home
          home={home}
          provider={provider}
          account={account} // Añadimos la cuenta aquí
          escrow={escrow}
          togglePop={togglePop}
        />
      )}
    </div>
  );
}

export default App;