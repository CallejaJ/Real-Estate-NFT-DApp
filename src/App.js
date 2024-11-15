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
    const provider = new ethers.providers.Web3Provider(window.ethereum)
  }

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <div className='container'>
        <header className="header">
          <h1 className="header__title">Discover, Buy and Sell Real Estate NFTs</h1>
          <p className="header__subtitle">The future of real estate investment is here</p>

          <div className="search">
            <input
              type="text"
              className="search__input"
              placeholder="Search by location, property type, or features..."
            />
            <button className="search__button">Search</button>
          </div>

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