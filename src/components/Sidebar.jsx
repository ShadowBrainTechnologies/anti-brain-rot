import { NavLink } from 'react-router-dom'
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
        <div className="sidebar__brand">
          <span className="sidebar__logo">🧠</span>
          <span className="sidebar__name">Brain Rot</span>
          <button
            className="sidebar__close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

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
