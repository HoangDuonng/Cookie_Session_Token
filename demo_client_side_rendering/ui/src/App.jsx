import { useEffect, useState } from 'react'

const baseApi = 'http://localhost:3000/api'

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [fields, setFields] = useState({
    email: 'nguyenvana@gmail.com',
    password: '123456',
  });

  const setFieldValues = ({ target: { name, value} }) => {
    setFields(prev => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    fetch(`${baseApi}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(fields),
    })
    .then((res) => {
      if(res.ok) return res.json()
      throw res;
    })
    .then(({ token }) => {
      localStorage.setItem('token', token);
    })
    .catch(() => {

    });
  }
  useEffect(() => {
    fetch(`${baseApi}/auth/me`, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then((res) => {
      if(res.ok) return res.json()
      throw res;
    })
    .then(me => {
      setUser(me);
    });
  }, []);

  return (
    <div>
      {user ? (
        <p>Xin chào, {user.name}</p>
        ) : (
          <>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
              <label htmlFor="email">Email</label> 
              <br />
              <input 
                type="email" 
                name="email" 
                id="email" 
                value={fields.email} 
                onChange={setFieldValues} 
              /> <br />
              <label htmlFor="password">Password</label> 
              <br />
              <input 
                type="password" 
                name="password" 
                id="password" 
                value={fields.password} 
                onChange={setFieldValues} 
              /> <br />
              <button>Login</button>
            </form>
            {!!error && <p style={{ color: 'red' }}>{error}</p>}
          </>
          )}
    </div>
  )
}

export default App
