import React, {useState, useEffect} from 'react';

function App(){
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const api = process.env.REACT_APP_API_URL || '/api';

  useEffect(()=> {
    fetch(`${api}/items`).then(r=>r.json()).then(setItems);
  },[]);

  async function add(){
    if(!name) return;
    const res = await fetch(`${api}/items`, {
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ name })
    });
    const j = await res.json();
    setItems([...items, j]);
    setName('');
  }

  return (
    <div style={{padding:20}}>
      <h1>Simple App</h1>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="item name"/>
      <button onClick={add}>Add</button>
      <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>
    </div>
  )
}

export default App;

