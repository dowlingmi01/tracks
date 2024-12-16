import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
      {user ? (
        <p>You are logged in as {user.name}</p>
      ) : (
        <p>Please login or register to access all features</p>
      )}
    </div>
  );
};

export default Home;