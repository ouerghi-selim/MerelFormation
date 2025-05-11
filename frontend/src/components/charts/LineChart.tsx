import React from 'react';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface DataPoint {
    name: string;
    [key: string]: number | string;
}

interface LineChartProps {
    data: DataPoint[];
    lines: Array<{
        dataKey: string;
        color: string;
        name?: string;
    }>;
    xAxisDataKey?: string;
    height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
                                                 data,
                                                 lines,
                                                 xAxisDataKey = 'name',
                                                 height = 300
                                             }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={xAxisDataKey} />
                <YAxis />
                <Tooltip />
                <Legend />
                {lines.map((line, index) => (
                    <Line
                        key={index}
                        type="monotone"
                        dataKey={line.dataKey}
                        stroke={line.color}
                        name={line.name || line.dataKey}
                        activeDot={{ r: 8 }}
                    />
                ))}
            </RechartsLineChart>
        </ResponsiveContainer>
    );
};

export default LineChart;