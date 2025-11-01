import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/api';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [sort, setSort] = useState('default');
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/restaurants/${id}`)
      .then(res => setRestaurant(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const menus = restaurant?.Menus || [];
  const filteredMenus = useMemo(() => {
    let arr = menus.filter(m => m.name.toLowerCase().includes(q.toLowerCase()));
    switch (sort) {
      case 'price-asc':
        arr = [...arr].sort((a,b)=>Number(a.price)-Number(b.price));
        break;
      case 'price-desc':
        arr = [...arr].sort((a,b)=>Number(b.price)-Number(a.price));
        break;
      case 'name-asc':
        arr = [...arr].sort((a,b)=>a.name.localeCompare(b.name,'vi')); 
        break;
      default:
        break;
    }
    return arr;
  }, [menus, q, sort]);

  if (!restaurant) return <div>Loading...</div>;

  return (
    <div className="site-container">
      {/* Hero section */}
      <div className="rd">
        <div className="rd__grid">
          <div className="rd__media">
            {restaurant.imageUrl ? (
              <img className="rd__img" src={restaurant.imageUrl} alt={restaurant.name} onError={(e)=>{e.currentTarget.style.display='none';}} />
            ) : (
              <div className="rd__ph">🏪</div>
            )}
          </div>
          <div>
            <h2 className="rd__title">{restaurant.name}</h2>
            <div className="rd__addr">{restaurant.address}</div>
            {restaurant.promotion && <div className="rd__promo">🎉 {restaurant.promotion}</div>}
            {restaurant.description && <p className="rd__desc">{restaurant.description}</p>}
            <div className="rd__meta">
              <span className="chip chip--neutral">Số món: {menus.length}</span>
              <span className="chip chip--accent">Giao nhanh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menus grid */}
      <div className="section">
        <div className="section-header toolbar-spread">
          <h3 className="title-accent">Menu</h3>
          <div className="toolbar">
            <input className="ff-input ff-input--min" placeholder="Tìm món..." value={q} onChange={e=>setQ(e.target.value)} />
            <input 
              className="ff-input ff-input--min" 
              placeholder="Tìm món..." 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={(e) => { setIsComposing(false); setQ(e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isComposing) setQ(searchInput); }}
            />
            <button className="ff-btn ff-btn--normal" onClick={() => setQ(searchInput)}>Tìm</button>
            <select className="ff-select" value={sort} onChange={e=>setSort(e.target.value)}>
              <option value="default">Sắp xếp</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="name-asc">Tên A-Z</option>
            </select>
          </div>
        </div>
        {filteredMenus.length === 0 ? (
          <div className="muted">Không có món nào phù hợp.</div>
        ) : (
          <div className="grid-auto-260">
            {filteredMenus.map(item => (
            <div key={item.id} className="related-card is-clickable" onClick={()=>navigate(`/menu/${item.id}`)}>
              <div className="related-cover">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} onError={(e)=>{e.currentTarget.style.display='none';}} />
                ) : (
                  <div className="rd__coverph">🍽️</div>
                )}
              </div>
              <div className="related-body">
                <div className="related-name" title={item.name}>{item.name}</div>
                <div className="related-price">{Number(item.price).toLocaleString()}₫</div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
