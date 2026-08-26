'use client';

import { RATING_LEVELS, RatingLevel } from '@/lib/schema';

export default function RatingMatrix({
  title,
  items,
  value,
  onChange
}: {
  title: string;
  items: string[];
  value: Record<string, RatingLevel>;
  onChange: (next: Record<string, RatingLevel>) => void;
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="matrix">
        <thead>
          <tr>
            <th style={{ width: 30 }}>S/N</th>
            <th style={{ textAlign: 'left' }}>{title}</th>
            {RATING_LEVELS.map((lvl) => (
              <th key={lvl}>{lvl}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item}>
              <td>{idx + 1}</td>
              <td className="label">{item}</td>
              {RATING_LEVELS.map((lvl) => (
                <td key={lvl}>
                  <input
                    type="radio"
                    name={`matrix-${title}-${idx}`}
                    checked={value[item] === lvl}
                    onChange={() => onChange({ ...value, [item]: lvl })}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
