import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/iptv4ever-logo.svg';
import '../assets/css/header.css';
import { iptvKeywords } from '../data/searchKeywords';
import LoadingLine from './LoadingLine';
import { useAuth } from '../context/AuthContext';

// TODO: replace with real backend notifications
const TEMP_NOTIFICATIONS = [
  { id: 1, read: false, icon: 'bi-exclamation-triangle', text: 'Your subscription will expire in 3 days.' },
  { id: 2, read: true,  icon: 'bi-plus-circle',          text: 'New channels added to your plan.' },
  { id: 3, read: true, icon: 'bi-check-circle',         text: 'Your payment was successful.' },
  { id: 4, read: true, icon: 'bi-info-circle',          text: 'A new plan is now available — check it out and upgrade for more channels and features.' },
];

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [mobileSearchMode, setMobileSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileNavbarRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
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
              <li><a href="/plans">Plans</a><div className="inactive-link"></div></li>
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

        {user && (
          <div className="profile-section">
            <div className="profile-dropdown-wrapper" ref={profileRef}>
              <button
                className={`profile-dropdown${isProfileOpen ? ' profile-open' : ''}`}
                onClick={() => setIsProfileOpen(prev => !prev)}
              >
                <div className="profile-avatar">
                  <div className="bg-circle"></div>
                  <i className="bi bi-person-circle"></i>
                </div>
                <div className="profile-info">
                  <p className="profile-name">{user.name}</p>
                  <p className="profile-email">{user.email}</p>
                </div>
              </button>
              {isProfileOpen && (
                <div className="profile-menu">
                  <a href="/profile" className="profile-menu-item">
                    <i className="bi bi-person-gear"></i>
                    <span>Profile Settings</span>
                  </a>
                  <a href="/subscription" className="profile-menu-item">
                    <i className="bi bi-credit-card"></i>
                    <span>My Subscription</span>
                  </a>
                  <hr className="profile-menu-divider" />
                  <button
                    className="profile-menu-item profile-menu-logout"
                    onClick={() => {
                      logout();
                      setIsProfileOpen(false);
                      navigate('/login');
                    }}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
            <button
              ref={notificationRef}
              className={`notification-dropdown${isNotificationsOpen ? ' notification-open' : ''}`}
              onClick={() => setIsNotificationsOpen(prev => !prev)}
              aria-label="Notifications"
            >
              <i className="bi bi-bell"></i>
              <span className="notification-circle"></span>
              {isNotificationsOpen && (
                <div className="notification-list">
                  {TEMP_NOTIFICATIONS.map(n => (
                    <p key={n.id} className={`notification-item ${n.read ? '' : 'notification-unread'}`}>
                      <i className={`bi ${n.icon}`}></i>
                      <span className="notification-text">{n.text}</span>
                    </p>
                  ))}
                </div>
              )}
            </button>
          </div>
        )}

        {!user && (
            <button
              className="auth-btn"
              onClick={() => navigate('/login')}
              aria-label="Login or Register"
            >
              <i className="bi bi-person-circle"></i>
              <p>Login / Register</p>
              <div className="circle-small"></div>
            </button>
          )}

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
      <LoadingLine width={'0%'} />
    </header>
  );
};

export default Header;
