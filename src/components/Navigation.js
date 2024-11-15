import dapp_logo from '../assets/dapp_logo.png';

const Navigation = ({ account, setAccounts }) => {
    return (
        <nav>
            <ul className='nav__links'>
                <li><a href="#">Buy</a></li>
                <li><a href="#">Rent</a></li>
                <li><a href="#">Sell</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={dapp_logo} alt="Logo" />
            </div>

            <button
                type="button"
                className='nav__connect'
            >
                0x0...
            </button>
        </nav>
    );
}

export default Navigation;