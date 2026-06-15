export default function StatsLineChart({
  data,
  dataKey,
  stroke,
  title,
  formatter,
  roundTicks,
}) {
  const width = 680;
  const height = 220;
  const padding = 24;
  const labelPadding = 60;

  if (!data?.length) {
    return null;
  }

  const maxValue = Math.max(
    ...data.map((item) => Number(item[dataKey] || 0)),
    1,
  );
  const chartTop = padding;
  const chartBottom = height - padding;
  const chartLeft = padding + labelPadding;
  const chartRight = width - padding;
  const chartHeight = chartBottom - chartTop;
  const chartWidth = chartRight - chartLeft;
  const stepX = data.length > 1 ? chartWidth / (data.length - 1) : 0;

  const points = data.map((item, index) => {
    const numericValue = Number(item[dataKey] || 0);
    const x = chartLeft + index * stepX;
    const y = chartBottom - chartHeight * (numericValue / maxValue);

    return {
      x,
      y,
      label: item.label,
      value: numericValue,
    };
  });

  const linePath = points.map((point) => `${point.x},${point.y}`).join(" ");

  let ticks;
  if (roundTicks) {
    const topValue = Math.max(1, Math.ceil(maxValue));
    const step = Math.max(1, Math.ceil(topValue / 4));
    const maxTick = Math.ceil(topValue / step) * step;
    const count = Math.floor(maxTick / step) + 1;
    ticks = Array.from({ length: count }, (_, i) => {
      const value = i * step;
      const fraction = maxTick > 0 ? value / maxTick : 0;
      const y = chartBottom - chartHeight * fraction;
      return { y, value };
    });
  } else {
    const tickCount = 5;
    ticks = Array.from({ length: tickCount }, (_, i) => {
      const fraction = i / (tickCount - 1);
      const y = chartBottom - chartHeight * fraction;
      const value = maxValue * fraction;
      return { y, value };
    });
  }

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
          x1={chartLeft}
          y1={chartBottom}
          x2={chartRight}
          y2={chartBottom}
          stroke="#cbd5e1"
          strokeWidth="1"
        />
        {ticks.map((tick, index) => (
          <g key={`tick-${index}`}>
            <line
              x1={chartLeft}
              y1={tick.y}
              x2={chartRight}
              y2={tick.y}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
            <text
              x={padding + labelPadding - 6}
              y={tick.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
            >
              {formatter
                ? formatter(roundTicks ? Math.round(tick.value) : tick.value)
                : roundTicks
                  ? Math.round(tick.value)
                  : tick.value}
            </text>
          </g>
        ))}
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePath}
        />
        {points.map((point) => (
          <circle
            key={point.label}
            cx={point.x}
            cy={point.y}
            r="3"
            fill={stroke}
          >
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
