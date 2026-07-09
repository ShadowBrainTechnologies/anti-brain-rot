import QuizGame from '../components/QuizGame.jsx'
import { generateQuestion } from './DataDetective.logic.js'
import './DataDetective.css'

const COLORS = ['#0ea5e9', '#f97316', '#22c55e', '#a855f7', '#eab308', '#ec4899']

function renderTable(chart) {
  return (
    <table className="dd-table">
      <thead>
        <tr>
          <th>Category</th>
          {chart.series.map((s) => (
            <th key={s.name}>{s.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {chart.categories.map((cat, i) => (
          <tr key={cat}>
            <td>{cat}</td>
            {chart.series.map((s) => (
              <td key={s.name}>{s.values[i]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function renderBar(chart) {
  const max = Math.max(...chart.series.flatMap((s) => s.values), 1)
  const count = chart.categories.length
  const seriesCount = chart.series.length
  const groupGap = 24
  const barGap = 6
  const chartHeight = 240
  const chartWidth = 420
  const pad = { top: 20, right: 10, bottom: 64, left: 44 }
  const plotW = chartWidth - pad.left - pad.right
  const plotH = chartHeight - pad.top - pad.bottom
  const groupW = plotW / count
  const barW = (groupW - groupGap - (seriesCount - 1) * barGap) / seriesCount

  return (
    <svg className="dd-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = plotH - t * plotH
          return (
            <line key={t} x1={0} y1={y} x2={plotW} y2={y} className="dd-grid" />
          )
        })}
        <line x1={0} y1={0} x2={0} y2={plotH} className="dd-axis" />
        <line x1={0} y1={plotH} x2={plotW} y2={plotH} className="dd-axis" />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={-8} y={plotH - t * plotH + 4} className="dd-label dd-label--y">
            {Math.round(t * max)}
          </text>
        ))}
        {chart.categories.map((cat, i) => {
          const groupX = i * groupW + groupGap / 2
          return (
            <g key={cat}>
              {chart.series.map((s, si) => {
                const val = s.values[i]
                const h = (val / max) * plotH
                const x = groupX + si * (barW + barGap)
                const y = plotH - h
                const color = seriesCount === 1 ? COLORS[i % COLORS.length] : COLORS[si % COLORS.length]
                return (
                  <rect
                    key={s.name}
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    fill={color}
                    rx={3}
                  />
                )
              })}
              <text
                x={groupX + (groupW - groupGap) / 2}
                y={plotH + 18}
                className="dd-label dd-label--x"
              >
                {cat}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

function renderLine(chart) {
  const max = Math.max(...chart.series.flatMap((s) => s.values), 1)
  const count = chart.categories.length
  const chartHeight = 240
  const chartWidth = 420
  const pad = { top: 20, right: 20, bottom: 64, left: 44 }
  const plotW = chartWidth - pad.left - pad.right
  const plotH = chartHeight - pad.top - pad.bottom

  const x = (i) => (i / (count - 1)) * plotW
  const y = (v) => plotH - (v / max) * plotH

  return (
    <svg className="dd-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
      <g transform={`translate(${pad.left},${pad.top})`}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const yy = plotH - t * plotH
          return <line key={t} x1={0} y1={yy} x2={plotW} y2={yy} className="dd-grid" />
        })}
        <line x1={0} y1={0} x2={0} y2={plotH} className="dd-axis" />
        <line x1={0} y1={plotH} x2={plotW} y2={plotH} className="dd-axis" />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={-8} y={plotH - t * plotH + 4} className="dd-label dd-label--y">
            {Math.round(t * max)}
          </text>
        ))}
        {chart.series.map((s, si) => {
          const d = s.values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')
          const color = COLORS[si % COLORS.length]
          return (
            <g key={s.name}>
              <path
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={4} fill={color} />
              ))}
            </g>
          )
        })}
        {chart.categories.map((cat, i) => (
          <text key={cat} x={x(i)} y={plotH + 18} className="dd-label dd-label--x">
            {cat}
          </text>
        ))}
      </g>
    </svg>
  )
}

function renderPie(chart) {
  const series = chart.series[0]
  const values = series.values
  const total = values.reduce((a, b) => a + b, 0)
  const radius = 90
  const cx = 100
  const cy = 100

  const slices = []
  let startAngle = 0
  for (let i = 0; i < values.length; i++) {
    const angle = (values[i] / total) * 2 * Math.PI
    const endAngle = startAngle + angle
    const x1 = cx + radius * Math.cos(startAngle)
    const y1 = cy + radius * Math.sin(startAngle)
    const x2 = cx + radius * Math.cos(endAngle)
    const y2 = cy + radius * Math.sin(endAngle)
    const largeArc = angle > Math.PI ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    slices.push({ d, color: COLORS[i % COLORS.length] })
    startAngle = endAngle
  }

  return (
    <svg className="dd-chart dd-chart--pie" viewBox="0 0 200 200">
      <g transform="translate(0, 10)">
        {slices.map((slice, i) => (
          <path key={i} d={slice.d} fill={slice.color} stroke="var(--border)" strokeWidth={2} />
        ))}
      </g>
    </svg>
  )
}

function renderChart(question) {
  const { chart } = question
  let chartEl
  switch (chart.type) {
    case 'table':
      chartEl = renderTable(chart)
      break
    case 'bar':
      chartEl = renderBar(chart)
      break
    case 'line':
      chartEl = renderLine(chart)
      break
    case 'pie':
      chartEl = renderPie(chart)
      break
    default:
      chartEl = null
  }

  const legendItems =
    chart.type === 'pie'
      ? chart.categories.map((cat, i) => ({ label: cat, color: COLORS[i % COLORS.length] }))
      : chart.series.map((s, i) => ({ label: s.name, color: COLORS[i % COLORS.length] }))

  return (
    <div className="dd-prompt">
      <div className="dd-chart-wrap">
        {chart.title && <div className="dd-chart-title">{chart.title}</div>}
        {chartEl}
      </div>
      <div className="dd-legend">
        {legendItems.map((item) => (
          <span key={item.label} className="dd-legend__item">
            <span className="dd-legend__swatch" style={{ background: item.color }} />
            <span>{item.label}</span>
          </span>
        ))}
      </div>
      <p className="dd-prompt__text">{question.prompt}</p>
    </div>
  )
}

export default function DataDetective() {
  return (
    <QuizGame
      gameId="data-detective"
      title="Data Detective"
      instructions="Read the chart and answer — tables, bar, pie and line charts."
      generate={generateQuestion}
      renderPrompt={renderChart}
    />
  )
}
