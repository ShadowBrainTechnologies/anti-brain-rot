import { NavLink, Link } from 'react-router-dom'
import { GAME_GROUPS } from '../data/games.js'
import './Sidebar.css'

export default function Sidebar({ open, onClose }) {
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
          <span className="sidebar__name">Anti Brain Rot</span>
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

        <nav className="sidebar__nav">
          {GAME_GROUPS.map((group) => (
            <div className="sidebar__group" key={group.label}>
              <p className="sidebar__group-label">{group.label}</p>
              <ul className="sidebar__list">
                {group.games.map((game) => (
                  <li key={game.id}>
                    <NavLink
                      to={game.path}
                      className={({ isActive }) =>
                        `sidebar__link${isActive ? ' is-active' : ''}`
                      }
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
