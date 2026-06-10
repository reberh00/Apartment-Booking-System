export default function StatsLineChart({ data, dataKey, stroke, title, formatter }) {
  const width = 680;
  const height = 220;
  const padding = 24;

  if (!data?.length) {
    return null;
  }

  const maxValue = Math.max(
    ...data.map((item) => Number(item[dataKey] || 0)),
    1,
  );
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const numericValue = Number(item[dataKey] || 0);
    const x = padding + index * stepX;
    const y =
      height - padding - (height - padding * 2) * (numericValue / maxValue);

    return {
      x,
      y,
      label: item.label,
      value: numericValue,
    };
  });

  const linePath = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="stats-chart-wrap">
      <h4>{title}</h4>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="stats-chart"
        role="img"
        aria-label={title}
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePath}
        />
        {points.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="3" fill={stroke}>
            <title>{`${point.label}: ${formatter(point.value)}`}</title>
          </circle>
        ))}
      </svg>
      <div className="stats-chart-labels">
        {data.map((item, index) =>
          index % 2 === 0 || index === data.length - 1 ? (
            <span key={`${title}-${item.label}`}>{item.label}</span>
          ) : null,
        )}
      </div>
    </div>
  );
}
