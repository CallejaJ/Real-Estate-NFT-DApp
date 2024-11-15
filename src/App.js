import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

function App() {
  const [account, setAccount] = useState(null)

  const loadBlockchainData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)

      // Solicitar cuentas al cargar
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);

      // Escuchar cambios de cuenta
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          const account = ethers.utils.getAddress(accounts[0]);
          setAccount(account);
        } else {
          setAccount(null);
        }
      });

      // Opcional: Escuchar desconexión
      window.ethereum.on('disconnect', () => {
        setAccount(null);
      });

    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  }

  useEffect(() => {
    loadBlockchainData();

    // Cleanup de los event listeners cuando el componente se desmonta
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => { });
        window.ethereum.removeListener('disconnect', () => { });
      }
    };
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <div className='container'>
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

        <section className="featured__properties">
          <h3>Featured Properties</h3>
          <div className="cards__grid">
            {/* Aquí irán tus cards */}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;