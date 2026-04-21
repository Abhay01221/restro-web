import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import FoodCard from '../components/FoodCard';
import SkeletonCard from '../components/SkeletonCard';
import { menuItems, menuCategories } from '../data/menuData';

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let items = [...menuItems];
    if (activeCategory !== 'all') items = items.filter(i => i.category === activeCategory);
    if (vegOnly) items = items.filter(i => i.isVeg);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    if (sort === 'price-asc') items.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') items.sort((a, b) => b.price - a.price);
    else if (sort === 'popular') items.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    return items;
  }, [activeCategory, vegOnly, search, sort]);

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setSearchParams(id !== 'all' ? { category: id } : {});
  };

  return (
    <>
      <Helmet>
        <title>Menu | Shiv Shankar Chinese Food</title>
        <meta name="description" content="Browse our full menu of authentic Chinese dishes — soups, starters, main course, noodles, rice, desserts and beverages." />
      </Helmet>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '3rem 1.5rem 2rem',
        textAlign: 'center',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="section-title"
          style={{ marginBottom: 8 }}
        >
          Our Menu
        </motion.h1>
        <div className="gold-divider" />
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          Authentic Chinese flavors crafted with love
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Search + Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: '1.5rem', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-dark"
              style={{ paddingLeft: 38, borderRadius: 50 }}
            />
          </div>

          {/* Veg toggle */}
          <button
            onClick={() => setVegOnly(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 50,
              border: `1px solid ${vegOnly ? '#22C55E' : 'var(--border)'}`,
              background: vegOnly ? 'rgba(34,197,94,0.1)' : 'var(--surface)',
              color: vegOnly ? '#22C55E' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            🟢 Veg Only
          </button>

          {/* Sort */}
          <div style={{ position: 'relative' }}>
            <SlidersHorizontal size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="input-dark"
              style={{ paddingLeft: 34, paddingRight: 12, borderRadius: 50, cursor: 'pointer', minWidth: 180 }}
            >
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="scroll-x" style={{ display: 'flex', gap: 10, marginBottom: '2rem', paddingBottom: 4 }}>
          {menuCategories.map(cat => (
            <button
              key={cat.id}
              className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {loading ? 'Loading...' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: 16 }}>No dishes found matching your search.</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all'); setVegOnly(false); }} className="btn-primary" style={{ marginTop: 16 }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((item, i) => (
              <FoodCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
