import React from 'react';
import {
    BarChart as RechartsBarChart,
    Bar,
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

interface BarChartProps {
    data: DataPoint[];
    bars: Array<{
        dataKey: string;
        color: string;
        name?: string;
    }>;
    xAxisDataKey?: string;
    height?: number;
}

const BarChart: React.FC<BarChartProps> = ({
                                               data,
                                               bars,
                                               xAxisDataKey = 'name',
                                               height = 300
                                           }) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart
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
                {bars.map((bar, index) => (
                    <Bar
                        key={index}
                        dataKey={bar.dataKey}
                        fill={bar.color}
                        name={bar.name || bar.dataKey}
                    />
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
};

export default BarChart;