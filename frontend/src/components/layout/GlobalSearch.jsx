import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Users, Handshake, ListTodo, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ user, onEventSelect }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState({ events: [], people: [], vendors: [], tasks: [] });
    const [activeFilter, setActiveFilter] = useState('All');
    
    const API_URL = import.meta.env.VITE_API_URL;
    const searchRef = useRef(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setResults({ events: [], people: [], vendors: [], tasks: [] });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const debounceTimer = setTimeout(async () => {
            try {
                const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(searchQuery)}&user=${user?.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (err) {
                console.error("Search fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, user, API_URL]);

    const handleResultClick = (result) => {
        setShowResults(false);
        setSearchQuery("");
        // Route based on type
        switch (result.type) {
            case 'Event':
                if (onEventSelect) onEventSelect(result.id);
                navigate(`/events/${result.id}`);
                break;
            case 'Guest':
                if (result.event && onEventSelect) onEventSelect(result.event);
                navigate(`/guests`); // Or specific guest modal if supported
                break;
            case 'Vendor':
                if (result.event && onEventSelect) onEventSelect(result.event);
                navigate(`/vendors`);
                break;
            case 'Task':
                if (result.event && onEventSelect) onEventSelect(result.event);
                navigate(`/tasks`);
                break;
            default:
                break;
        }
    };

    const hasResults = Object.values(results).some(arr => arr.length > 0);

    const filters = [
        { id: 'All', icon: null },
        { id: 'People', icon: <Users size={14} /> },
        { id: 'Events', icon: <Calendar size={14} /> },
        { id: 'Vendors', icon: <Handshake size={14} /> },
        { id: 'Tasks', icon: <ListTodo size={14} /> },
    ];

    return (
        <div className="search-input-wrapper" ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: '600px' }}>
            <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
                id="global-search-input"
                type="text"
                placeholder="Start searching..."
                value={searchQuery}
                onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                }}
                className="search-input"
                onFocus={e => {
                    e.target.style.background = "var(--bg-elevated)";
                    e.target.style.borderColor = "var(--accent-primary)";
                    e.target.style.boxShadow = "0 4px 20px rgba(249, 115, 22, 0.08)";
                    setShowResults(true);
                }}
                onBlur={e => {
                    e.target.style.background = "var(--bg-surface)";
                    e.target.style.borderColor = "var(--border-subtle)";
                    e.target.style.boxShadow = "none";
                }}
                style={{
                    width: '100%',
                    padding: '10px 16px 10px 38px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.2s',
                }}
            />
            {searchQuery && (
                <button 
                    onClick={() => { setSearchQuery(""); setShowResults(false); }}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                    <X size={14} />
                </button>
            )}

            {showResults && searchQuery.trim() && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    right: 0,
                    background: "#18181b", // Dark theme matching dashboard
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                    padding: "16px",
                    zIndex: 1000,
                    maxHeight: "500px",
                    overflowY: "auto",
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {filters.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setActiveFilter(f.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '100px',
                                    border: `1px solid ${activeFilter === f.id ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
                                    background: activeFilter === f.id ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                                    color: activeFilter === f.id ? '#f97316' : '#a1a1aa',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {f.icon} {f.id}
                            </button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#a1a1aa', fontSize: '13px' }}>
                            <div style={{ width: "24px", height: "24px", border: "2px solid #f97316", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 8px" }}></div>
                            Searching Planora...
                        </div>
                    ) : !hasResults ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#a1a1aa', fontSize: '13px' }}>
                            No results found for "{searchQuery}"
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            
                            {/* People / Guests */}
                            {(activeFilter === 'All' || activeFilter === 'People') && results.people.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>People</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {results.people.map(person => (
                                            <div key={person.id} onClick={() => handleResultClick(person)} className="search-result-item" style={resultItemStyle}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Users size={16} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f5' }}>{person.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {person.email}
                                                        {person.status && (
                                                            <>
                                                                <span>&bull;</span>
                                                                <span style={{ color: person.status === 'attending' ? '#10b981' : '#f59e0b' }}>{person.status}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginTop: '12px' }} />
                                </div>
                            )}

                            {/* Events */}
                            {(activeFilter === 'All' || activeFilter === 'Events') && results.events.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>Events</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {results.events.map(event => (
                                            <div key={event.id} onClick={() => handleResultClick(event)} className="search-result-item" style={resultItemStyle}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Calendar size={16} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f5' }}>{event.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {event.date ? new Date(event.date).toLocaleDateString() : 'No date set'}
                                                        {event.status && (
                                                            <>
                                                                <span>&bull;</span>
                                                                <span>{event.status}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginTop: '12px' }} />
                                </div>
                            )}

                            {/* Vendors */}
                            {(activeFilter === 'All' || activeFilter === 'Vendors') && results.vendors.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>Vendors</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {results.vendors.map(vendor => (
                                            <div key={vendor.id} onClick={() => handleResultClick(vendor)} className="search-result-item" style={resultItemStyle}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Handshake size={16} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f5' }}>{vendor.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {vendor.service}
                                                        {vendor.status && (
                                                            <>
                                                                <span>&bull;</span>
                                                                <span style={{ color: vendor.status === 'Approved' ? '#10b981' : '#f59e0b' }}>{vendor.status}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginTop: '12px' }} />
                                </div>
                            )}

                            {/* Tasks */}
                            {(activeFilter === 'All' || activeFilter === 'Tasks') && results.tasks.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>Tasks</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {results.tasks.map(task => (
                                            <div key={task.id} onClick={() => handleResultClick(task)} className="search-result-item" style={resultItemStyle}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <ListTodo size={16} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f4f4f5' }}>{task.title}</div>
                                                    <div style={{ fontSize: '12px', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        {task.category}
                                                        {task.status && (
                                                            <>
                                                                <span>&bull;</span>
                                                                <span>{task.status}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{__html: `
                .search-result-item:hover {
                    background: rgba(255,255,255,0.05) !important;
                }
            `}} />
        </div>
    );
};

const resultItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    background: 'transparent'
};

export default GlobalSearch;
