import { useEffect, useState } from 'react';

interface HealthStatus {
  status: string;
  database: string;
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://localhost:8080/health');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: HealthStatus = await response.json();
        setHealth(data);
      } catch (e: any) {
        setError(e.message);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div>
      <h1>Character Sheet App</h1>
      <h2>Backend Health:</h2>
      {health ? (
        <div>
          <p>Status: {health.status}</p>
          <p>Database: {health.database}</p>
        </div>
      ) : error ? (
        <p>Error fetching health: {error}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default App;
