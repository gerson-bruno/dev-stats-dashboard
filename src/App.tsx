import { useEffect, useState } from 'react';
import { Octokit } from "@octokit/rest";
import './App.css'; 
const octokit = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN });


interface GitHubUser {
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  language: string; 
  html_url: string;
}

function App() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [languageStats, setLanguageStats] = useState<{ name: string; percentage: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const GITHUB_USERNAME = 'gerson-bruno'; 

  useEffect(() => {
    Promise.all([
      octokit.rest.users.getByUsername({ username: GITHUB_USERNAME }),
      octokit.rest.repos.listForUser({ username: GITHUB_USERNAME, sort: 'updated', per_page: 20 })
    ])
    .then(([userRes, reposRes]) => {
      setUser(userRes.data);
      const fetchedRepos = reposRes.data;
      setRepos(fetchedRepos.slice(0, 6)); 

     
      const langMap: { [key: string]: number } = {};
      let totalReposWithLanguage = 0;

      fetchedRepos.forEach(repo => {
        if (repo.language) {
          totalReposWithLanguage++;
          langMap[repo.language] = (langMap[repo.language] || 0) + 1;
        }
      });

      // Transforma o mapa em um array de porcentagens e ordena
      const stats = Object.keys(langMap).map(lang => ({
        name: lang,
        percentage: Math.round((langMap[lang] / totalReposWithLanguage) * 100)
      })).sort((a, b) => b.percentage - a.percentage); // Do maior para o menor

      setLanguageStats(stats.slice(0, 4)); // Mostra as top 4 linguagens
    })
    .catch(err => {
      console.error(err);
      setError("Não foi possível carregar os dados. Verifique seu Token e Usuário.");
    });
  }, []);

  if (error) return <div className="loading error">{error}</div>;
  if (!user) return <div className="loading">Sincronizando Dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* Header com Design System Simplificado */}
      <header className="header">
        <h1>📊 Dev Stats Dashboard</h1>
        <a 
          href={user.html_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-profile"
        >
          Ver Perfil Completo
        </a>
      </header>

      <main className="main-content">
        
        {/* Coluna do Perfil (Cartão Principal - UX) */}
        <aside className="profile-card">
          <img 
            src={user.avatar_url} 
            alt={`Foto de perfil de ${user.name}`} 
            className="avatar"
          />
          <h2>{user.name}</h2>
          <p className="bio">{user.bio} <span>💻</span></p>
          
          {/* Grid de Métricas (Hierarquia Visual - RESOLVIDO: SEM VAZAR) */}
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{user.public_repos}</span>
              <span className="stat-label">Projetos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.followers}</span>
              <span className="stat-label">Seguidores</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{user.following}</span>
              <span className="stat-label">Seguindo</span>
            </div>
          </div>

          {/* --- SEÇÃO DE SKILLS REAIS (RESOLVIDO: COM BARRAS) --- */}
          {languageStats.length > 0 && (
            <div className="lang-chart">
              <h4 className="skills-title">Linguagens mais utilizadas:</h4>
              
              {languageStats.map(lang => (
                <div key={lang.name} className="lang-item">
                  <div className="lang-info">
                    <span className="lang-name">{lang.name}</span>
                    <span className="lang-percentage">{lang.percentage}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${lang.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Coluna dos Repositórios (Grid de Cards - UI) */}
        <section className="repos-section">
          <h3 className="section-title">
            <span>📂</span> Repositórios Recentes
          </h3>
          
          <div className="repos-grid">
            {repos.map(repo => (
              <a 
                key={repo.id} 
                href={repo.html_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="repo-card"
              >
                <div>
                  <h4 className="repo-name">{repo.name} <span>📌</span></h4>
                  <p className="repo-desc">
                    {repo.description || "Sem descrição disponível neste repositório."}
                  </p>
                </div>
                
                <div className="repo-footer">
                  <span className="repo-lang">💻 {repo.language || 'Misto'}</span>
                  <span className="repo-stars">⭐ {repo.stargazers_count}</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;