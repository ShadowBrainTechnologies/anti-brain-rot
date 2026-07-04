import { Link } from 'react-router-dom'
import { GAME_GROUPS } from '../data/games.js'
import './HomePage.css'

export default function HomePage() {
  return (
    <div className="home">
      <section className="home__hero">
        <div className="home__hero-content">
          <span className="home__hero-emoji" aria-hidden="true">
            🧠
          </span>
          <h1 className="home__hero-title">Brain Rot</h1>
          <p className="home__hero-subtitle">
            A collection of fast, focused mini-games to sharpen memory, math,
            perception, and logic. Pick a category and start playing.
          </p>
        </div>
      </section>

      <div className="home__sections">
        {GAME_GROUPS.map((group) => (
          <section className="home__section" key={group.label}>
            <h2 className="home__section-title">{group.label}</h2>
            <div className="home__grid">
              {group.games.map((game) => (
                <Link
                  key={game.id}
                  to={game.path}
                  className="home__card"
                >
                  <div className="home__card-header">
                    <span className="home__card-name">{game.name}</span>
                    <span className="home__card-badge">{group.label}</span>
                  </div>
                  <p className="home__card-description">{game.description}</p>
                  <span className="home__card-action">Play →</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
