import { NavLink, Link, useLocation } from 'react-router-dom'
import { GAME_GROUPS, ALL_GAMES } from '../data/games.js'
import './Sidebar.css'

export default function Sidebar({ open, onClose }) {
  const location = useLocation()
  const currentGame = ALL_GAMES.find((g) =>
    location.pathname.startsWith(g.path),
  )

  return (
    <>
      <div
        className={`sidebar__backdrop ${open ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <Link
          to="/"
          className="sidebar__brand"
          onClick={onClose}
        >
          <span className="sidebar__logo" aria-hidden="true">
            🧠
          </span>
          <span className="sidebar__name">Brain Rot</span>
          <button
            className="sidebar__close"
            onClick={(e) => {
              e.preventDefault()
              onClose()
            }}
            aria-label="Close menu"
          >
            ✕
          </button>
        </Link>

        {currentGame && (
          <div className="sidebar__current">
            <p className="sidebar__current-label">Currently Playing</p>
            <div className="sidebar__current-card">
              <span className="sidebar__current-name">{currentGame.name}</span>
              <span className="sidebar__current-group">
                {currentGame.group}
              </span>
            </div>
          </div>
        )}

        <nav className="sidebar__nav">
          {GAME_GROUPS.map((group) => (
            <div className="sidebar__group" key={group.label}>
              <p className="sidebar__group-label">{group.label}</p>
              <ul className="sidebar__list">
                {group.games.map((game) => (
                  <li key={game.id}>
                    <NavLink
                      to={game.path}
                      className="sidebar__link"
                      onClick={onClose}
                    >
                      {game.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}
