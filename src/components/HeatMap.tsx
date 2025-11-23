import { useState } from 'react';

interface HeatMapCell {
    date: string;
    count: number;
}

interface HeatMapProps {
    data?: HeatMapCell[];
    weeks?: number;
}

const CELL_SIZE = 16; // px
const CELL_GAP = 4; // px
const MIN_VISIBLE_WIDTH = 640; // px

export default function HeatMap({ data, weeks = 24 }: HeatMapProps) {
    const [hoveredCell, setHoveredCell] = useState<HeatMapCell | null>(null);


    const generateMockData = (): HeatMapCell[] => {
        const cells: HeatMapCell[] = [];
        const today = new Date();
        const daysToShow = weeks * 7;

        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];


            const count = Math.random() > 0.3 ? Math.floor(Math.random() * 8) : 0;
            cells.push({ date: dateStr, count });
        }

        return cells;
    };

    const heatData = data || generateMockData();


    const getIntensity = (count: number): number => {
        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return 4;
    };


    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const weekGroups: HeatMapCell[][] = [];
    for (let i = 0; i < heatData.length; i += 7) {
        weekGroups.push(heatData.slice(i, i + 7));
    }

    const minWidth = Math.max(weekGroups.length * (CELL_SIZE + CELL_GAP) - CELL_GAP, MIN_VISIBLE_WIDTH);

    return (
        <div className="relative">
            <div className="flex items-start gap-1">
        
                <div className="flex flex-col gap-1 text-[10px] text-[var(--text-tertiary)] font-mono pr-2 pt-5">
                    <div className="h-2"></div>
                    <div></div>
                    <div className="h-2"></div>
                    <div></div>
                    <div className="h-2"></div>
                    <div></div>
                    <div className="h-2"></div>
                </div>


                <div className="flex-1 overflow-x-auto">
                    <div className="inline-flex gap-1 pb-2" style={{ minWidth: `${minWidth}px` }}>
                        {weekGroups.map((week, weekIdx) => (
                            <div key={weekIdx} className="flex flex-col gap-1">
                                {week.map((cell) => {
                                    const intensity = getIntensity(cell.count);
                                    return (
                                        <div
                                            key={cell.date}
                                            className={`rounded-sm heat-neon-${intensity} cursor-pointer transition-all hover:scale-125 hover:ring-1 hover:ring-[var(--accent-color)]`}
                                            style={{ width: CELL_SIZE, height: CELL_SIZE }}
                                            onMouseEnter={() => setHoveredCell(cell)}
                                            onMouseLeave={() => setHoveredCell(null)}
                                            title={`${formatDate(cell.date)}: ${cell.count} activities`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {hoveredCell && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-[var(--bg-page)] border-2 border-[var(--accent-color)] px-3 py-1.5 rounded text-xs font-mono whitespace-nowrap z-50 shadow-lg neon-glow">
                    <div className="text-[var(--text-primary)] font-bold">{hoveredCell.count} activities</div>
                    <div className="text-[var(--text-tertiary)] text-[10px]">{formatDate(hoveredCell.date)}</div>
                </div>
            )}

      
            <div className="flex items-center gap-2 mt-3 text-[10px] text-[var(--text-tertiary)] font-mono">

            </div>
        </div>
    );
}
