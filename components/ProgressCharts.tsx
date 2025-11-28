"use client";

interface ProgressChartProps {
  data: { date: string; count: number }[];
  title: string;
}

export default function ProgressChart({ data, title }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-background border border-neutral rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
        <div className="text-center py-8 text-foreground/50">
          <i className="fas fa-chart-bar text-4xl mb-2"></i>
          <p>No data to display yet</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barWidth = 100 / data.length;

  return (
    <div className="bg-background border border-neutral rounded-xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
      <div className="relative h-48">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={100 - y}
              x2="100"
              y2={100 - y}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="0.5"
            />
          ))}

          {/* Bars */}
          {data.map((item, index) => {
            const height = (item.count / maxCount) * 80;
            const x = index * barWidth + barWidth * 0.1;
            const width = barWidth * 0.8;

            return (
              <g key={item.date}>
                <rect
                  x={`${x}%`}
                  y={`${100 - height - 5}%`}
                  width={`${width}%`}
                  height={`${height}%`}
                  rx="2"
                  className="fill-primary opacity-80 hover:opacity-100 transition-opacity"
                />
                {item.count > 0 && (
                  <text
                    x={`${x + width / 2}%`}
                    y={`${100 - height - 8}%`}
                    textAnchor="middle"
                    className="fill-foreground text-[3px] font-semibold"
                  >
                    {item.count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.map((item) => (
            <div
              key={item.date}
              className="text-xs text-foreground/60 text-center"
              style={{ width: `${barWidth}%` }}
            >
              {new Date(item.date)
                .toLocaleDateString("en-US", { weekday: "short" })
                .slice(0, 2)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TypeDistributionProps {
  data: { type: string; count: number; color: string }[];
  title: string;
}

export function TypeDistribution({ data, title }: TypeDistributionProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="bg-background border border-neutral rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
        <div className="text-center py-8 text-foreground/50">
          <i className="fas fa-chart-pie text-4xl mb-2"></i>
          <p>No data to display yet</p>
        </div>
      </div>
    );
  }

  // Calculate segments for the donut chart
  let currentAngle = 0;
  const segments = data.map((item) => {
    const percentage = (item.count / total) * 100;
    const startAngle = currentAngle;
    const endAngle = currentAngle + (item.count / total) * 360;
    currentAngle = endAngle;
    return { ...item, percentage, startAngle, endAngle };
  });

  const polarToCartesian = (angle: number, radius: number) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(radians),
      y: 50 + radius * Math.sin(radians),
    };
  };

  const describeArc = (
    startAngle: number,
    endAngle: number,
    radius: number
  ) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      1,
      end.x,
      end.y,
    ].join(" ");
  };

  return (
    <div className="bg-background border border-neutral rounded-xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={segment.type}
                d={describeArc(segment.startAngle, segment.endAngle - 0.5, 40)}
                fill="none"
                stroke={segment.color}
                strokeWidth="16"
                strokeLinecap="round"
                className="opacity-80 hover:opacity-100 transition-opacity"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{total}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {segments.map((segment) => (
            <div key={segment.type} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="text-foreground/70 capitalize flex-1">
                {segment.type}
              </span>
              <span className="font-semibold text-foreground">
                {segment.count} ({segment.percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StreakCalendarProps {
  dates: string[];
  title: string;
}

export function StreakCalendar({ dates, title }: StreakCalendarProps) {
  const today = new Date();
  const daysToShow = 28; // Last 4 weeks
  const dateSet = new Set(dates.map((d) => new Date(d).toDateString()));

  const days = [];
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toDateString(),
      completed: dateSet.has(date.toDateString()),
      isToday: i === 0,
    });
  }

  return (
    <div className="bg-background border border-neutral rounded-xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
      <div className="grid grid-cols-7 gap-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div
            key={i}
            className="text-center text-xs text-foreground/50 font-medium pb-2"
          >
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div
            key={index}
            className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all ${
              day.completed
                ? "bg-success text-white"
                : "bg-neutral/30 text-foreground/50"
            } ${
              day.isToday
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : ""
            }`}
            title={day.date}
          >
            {new Date(day.date).getDate()}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success"></div>
          <span className="text-foreground/70">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral/30"></div>
          <span className="text-foreground/70">Missed</span>
        </div>
      </div>
    </div>
  );
}
