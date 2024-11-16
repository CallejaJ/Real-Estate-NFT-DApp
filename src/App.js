import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import PropertyGrid from './components/PropertyGrid';

// ABIs
import RealEstate from './abis/RealEstate.json';
import Escrow from './abis/Escrow.json';

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [homes, setHomes] = useState([]);
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);

  const loadBlockchainData = async () => {
    try {
      if (window.ethereum) {
        // Connect to blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        // Get network
        const network = await provider.getNetwork();
        setNetwork(network);

        // Get contract instances
        const realEstate = new ethers.Contract(
          config[network.chainId].realEstate.address,
          RealEstate,
          provider
        );

        const escrow = new ethers.Contract(
          config[network.chainId].escrow.address,
          Escrow,
          provider
        );
        setEscrow(escrow);

        // Load homes
        const totalSupply = await realEstate.totalSupply();
        const homes = [];

        for (let i = 1; i <= totalSupply; i++) {
          const uri = await realEstate.tokenURI(i);
          const response = await fetch(uri);
          const metadata = await response.json();
          homes.push(metadata);
        }

        setHomes(homes);

        // Setup account change listener
        window.ethereum.on('accountsChanged', async () => {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = ethers.utils.getAddress(accounts[0]);
          setAccount(account);
        });

      } else {
        console.error('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
  };

  useEffect(() => {
    loadBlockchainData();

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => { });
      }
    };
  }, []);

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
            <PropertyGrid
              homes={homes}
              provider={provider}
              escrow={escrow}
              account={account}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;