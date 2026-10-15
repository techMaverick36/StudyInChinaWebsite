import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Scholarship } from '../data/scholarships'

interface CompareTableProps {
  scholarships: Scholarship[]
}

/* "None" carries no information, so it is set quietly and the cells that do
   say something stand out. */
const quietIfNone = (value: string) =>
  /^none\.?$/i.test(value.trim()) ? <span className="compare-muted">None</span> : value

interface Column {
  label: string
  /* Share of the table width, so columns keep their proportions whatever the
     content. The programme column takes what is left. */
  width: number
  cell: (s: Scholarship) => ReactNode
  /* Tuition is what people compare first, so it is set a shade darker. */
  key?: boolean
}

const columns: Column[] = [
  { label: 'Tuition', width: 17, key: true, cell: (s) => s.compare.tuition },
  { label: 'Accommodation', width: 14, cell: (s) => s.compare.accommodation },
  {
    label: 'CSCA exam',
    width: 10,
    cell: (s) => (
      <span className={`compare-flag${s.cscaRequired ? ' need' : ''}`}>
        {s.cscaRequired ? 'Required' : 'Not needed'}
      </span>
    ),
  },
  { label: 'Taught in', width: 11, cell: (s) => s.compare.taughtIn },
  { label: 'Open to', width: 13, cell: (s) => s.compare.openTo },
  { label: 'Extra award', width: 12, cell: (s) => quietIfNone(s.compare.extraAward) },
]
const programmeWidth = 100 - columns.reduce((sum, c) => sum + c.width, 0)

/* Side-by-side comparison. One row per programme, so the table grows downwards
   as the office adds scholarships in /admin instead of squeezing more columns
   into the same width. On phones each row becomes a block with labelled fields. */
export default function CompareTable({ scholarships }: CompareTableProps) {
  return (
    <div className="compare-wrap">
      <table className="compare">
        <colgroup>
          <col style={{ width: `${programmeWidth}%` }} />
          {columns.map((c) => (
            <col key={c.label} style={{ width: `${c.width}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Programme</th>
            {columns.map((c) => (
              <th scope="col" key={c.label}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scholarships.map((s) => (
            <tr key={s.id}>
              <th scope="row">
                <Link className="compare-name" to={`/scholarships/${s.id}`}>
                  {s.title}
                </Link>
                <span className="compare-sub">
                  {s.levels}, {s.majors.length} {s.majors.length === 1 ? 'major' : 'majors'}
                </span>
              </th>
              {columns.map((c) => (
                <td
                  key={c.label}
                  data-label={c.label}
                  className={c.key ? 'compare-key' : undefined}
                >
                  {c.cell(s)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
