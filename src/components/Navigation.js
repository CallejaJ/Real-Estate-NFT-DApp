import dapp_logo from '../assets/dapp_logo.png';
import { ethers } from 'ethers';

const Navigation = ({ account, setAccount }) => {
    const connectHandler = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account);
    }
    return (
        <nav>
            <ul className='nav__links'>
                <li><a href="#">BUY</a></li>
                <li><a href="#">RENT</a></li>
                <li><a href="#">SELL</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={dapp_logo} alt="Logo" />
            </div>

            {account ? (
                <button
                    type='button'
                    className='nav__connect'
                >
                    {account.slice(0, 6) + ' ' + account.slice(38, 42)}
                </button>
            ) : (
                <button
                    type='button'
                    className='nav__connect'
                    onClick={connectHandler}
                >
                    Connect
                </button>
            )}
        </nav>
    );
}

export default Navigation;