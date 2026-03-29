import { useEffect, useState } from 'react';
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN });

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    octokit.rest.users.getByUsername({ username: 'gerson-bruno' })
      .then(res => setUser(res.data));
  }, []);

  if (!user) return <div>Carregando...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>{user.name}</h1>
      <img src={user.avatar_url} alt={user.name} style={{ width: '150px', borderRadius: '50%' }} />
      <p>{user.bio}</p>
      <p>Repositórios públicos: {user.public_repos}</p>
    </div>
  );
}

export default App;