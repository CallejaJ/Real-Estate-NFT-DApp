const Search = () => {
    return (
        <div className="search">
            <input
                type="text"
                className="search__input"
                placeholder="Search by location, property type, or features..."
            />
            <button className="search__button">Search</button>
        </div>
    );
}

export default Search;