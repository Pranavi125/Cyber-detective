import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

// Create a context with default value as an empty object
export const UserContext = createContext({});

// UserContextProvider component
export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  // Fetch user profile if user is not set
  useEffect(() => {
    if (!user) {
      axios.get('/profile')
        .then(({ data }) => {
          setUser(data);
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
        });
    }
  }, [user]);

  const logout = async () => {
    try {
      // Example API call to log out
      await axios.post('/logout'); 
      setUser(null); // Clear user state
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Provide context to children
  return (
    <UserContext.Provider value={{ user, logout }}>
      {children}
    </UserContext.Provider>
  );
}
