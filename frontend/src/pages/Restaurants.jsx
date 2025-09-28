import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RestaurantCard from '../components/RestaurantCard';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');

  useEffect(() => {
    axios.get('/api/restaurants')
      .then(res => setRestaurants(res.data))
      .catch(err => console.error(err));
  }, []);

  const filtered = restaurants
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a[sort].localeCompare(b[sort]));

  return (
    <div>
      <h2>Danh sách nhà hàng</h2>
      <input placeholder="Tìm kiếm" value={search} onChange={e => setSearch(e.target.value)} />
      <select value={sort} onChange={e => setSort(e.target.value)}>
        <option value="name">Tên</option>
        <option value="address">Địa chỉ</option>
      </select>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {filtered.map(r => (
          <RestaurantCard key={r.id} restaurant={r} />
        ))}
      </div>
    </div>
  );
};

export default Restaurants;
