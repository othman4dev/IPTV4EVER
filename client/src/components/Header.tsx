import { useState, useRef, useEffect } from 'react';
import logo from '../assets/images/iptv4ever-logo.svg';
import '../assets/css/header.css';
import { iptvKeywords } from '../data/searchKeywords';

const Header = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [mobileSearchMode, setMobileSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileNavbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  useEffect(() => {
    if (mobileSearchMode && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
        setShowSuggestions(false);
        setSearchQuery('');
      }
      
      // Close mobile menu when clicking outside
      const target = event.target as Node;
      const isClickInsideMobileNavbar = mobileNavbarRef.current?.contains(target);
      const isClickOnMobileButton = (target as Element).closest('.mobile-navbar-search');
      
      if (!isClickInsideMobileNavbar && !isClickOnMobileButton) {
        setIsMenuActive(false);
        setMobileSearchMode(false);
        setShowSuggestions(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    if (isSearchActive) {
      setIsSearchActive(false);
      setShowSuggestions(false);
      setSearchQuery('');
    } else {
      setIsSearchActive(true);
    }
  };

  const handleMenuClick = () => {
    if (isMenuActive && !mobileSearchMode) {
      // Menu is open with links, close it
      setIsMenuActive(false);
    } else {
      // Open menu with links (or switch from search to links)
      setIsMenuActive(true);
      setMobileSearchMode(false);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleMobileSearchClick = () => {
    if (isMenuActive && mobileSearchMode) {
      // Search is open, close menu
      setIsMenuActive(false);
      setMobileSearchMode(false);
      setShowSuggestions(false);
      setSearchQuery('');
    } else {
      // Open menu with search (or switch from links to search)
      setIsMenuActive(true);
      setMobileSearchMode(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      const filtered = iptvKeywords.filter(keyword =>
        keyword.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // TODO: Navigate to search results or trigger search
    console.log('Search for:', suggestion);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search API call
      console.log('Searching for:', searchQuery);
      setShowSuggestions(false);
    }
  };

  return (
    <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="inner-header">
        <div className="logo-container">
          <img src={logo} alt="IPTV4EVER Logo" className="logo" />
        </div>
        <div className="header-center" ref={searchContainerRef}>
          <nav className={`navbar ${isSearchActive ? 'navbar-search-active' : ''}`}>
            <ul className={`nav-links ${isSearchActive ? 'nav-hidden' : ''}`}>
              <li><a href="/home">Home</a><div className="active-link"></div></li>
              <li><a href="/products">Products</a><div className="inactive-link"></div></li>
              <li><a href="/blogs">Blogs</a><div className="inactive-link"></div></li>
              <li><a href="/contact">Contact</a><div className="inactive-link"></div></li>
              <li><a href="/about">About</a><div className="inactive-link"></div></li>
            </ul>
            
            <div className={`search-container ${isSearchActive ? 'search-active' : ''}`}>
              <form onSubmit={handleSearchSubmit} className="search-form">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search IPTV services, channels, packages..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </form>
              
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  <ul className="suggestions-list">
                    {filteredSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <i className="bi bi-search"></i>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </nav>

          <nav className='navbar-search'>
            <button 
              className="search-btn" 
              onClick={handleSearchClick}
              aria-label={isSearchActive ? "Close search" : "Open search"}
              title={isSearchActive ? "Close search" : "Open search"}
            >
              <i className={`bi ${isSearchActive ? 'bi-x-lg' : 'bi-search'}`}></i>
            </button>
          </nav>
        </div>

        {isMenuActive && (
          <div className="mobile-navbar" ref={mobileNavbarRef}>
            {mobileSearchMode ? (
              <div className="mobile-search-container">
                <form onSubmit={handleSearchSubmit} className="mobile-search-form">
                  <i className="bi bi-search"></i>
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    className="mobile-search-input"
                    placeholder="Search IPTV services..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </form>
                
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <ul className="mobile-suggestions-list">
                    {filteredSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <i className="bi bi-search"></i>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <ul className="mobile-nav-links">
                <li><a href="/home">Home</a><div className="active-link"></div></li>
                <li><a href="/products">Products</a><div className="inactive-link"></div></li>
                <li><a href="/blogs">Blogs</a><div className="inactive-link"></div></li>
                <li><a href="/contact">Contact</a><div className="inactive-link"></div></li>
                <li><a href="/about">About</a><div className="inactive-link"></div></li>
              </ul>
            )}
          </div>
        )}
        
        <div className="button-group">
          <nav className='mobile-navbar-search'>
            <button 
              className="search-btn" 
              onClick={handleMobileSearchClick}
              aria-label={mobileSearchMode ? "Close search" : "Open search"}
              title={mobileSearchMode ? "Close search" : "Open search"}
            >
              <i className={`bi ${mobileSearchMode ? 'bi-x-lg' : 'bi-search'}`}></i>
            </button>
          </nav>
          <button 
            className="auth-btn" 
            onClick={() => window.location.href = '/login'}
            aria-label="Login or Register"
          >
            <i className="bi bi-person-circle"></i>
            <p>Login / Register</p>
            <div className="circle-small"></div>
          </button>
          <nav className='mobile-navbar-search'>
            <button 
              className="search-btn" 
              onClick={handleMenuClick}
              aria-label={isMenuActive && !mobileSearchMode ? "Close Menu" : "Open Menu"}
              title={isMenuActive && !mobileSearchMode ? "Close Menu" : "Open Menu"}
            >
              <i className={`bi ${isMenuActive && !mobileSearchMode ? 'bi-x-lg' : 'bi-list'}`}></i>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
