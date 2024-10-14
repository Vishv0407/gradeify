// src/components/SgpaGraph.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const SgpaGraph = ({ semesters, handleSGPAClick }) => {
    // Prepare data for the Line chart
    const sgpaData = {
        labels: [...semesters.map((_, index) => `Semester ${index + 1}`), `Semester ${semesters.length}`],
        datasets: [
            {
                label: 'SGPA',
                data: semesters.map(sem => parseFloat(sem.sgpa) || 0),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.4, // Smooth curves
            },
        ],
    };

    // Configure options for the Line chart
    const sgpaOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: (context) => `CGPA: ${context.raw.toFixed(2)}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: {
                    stepSize: 0.3, // Adjust as needed
                },
            },
            x: {
                ticks: {
                    autoSkip: true, // Automatically skip labels to avoid clutter
                    maxTicksLimit: 10, // Limit the number of ticks on the x-axis
                },
            },
        },
        onClick: (e, activeElements) => {
            if (activeElements.length > 0) {
                const index = activeElements[0].index;
                handleSGPAClick(index);
            }
        },
    };

    return (
        <div className="sgpa-graph-container" style={{ width: '100%', height: '400px', margin: '0 auto' }}>
            <h3>SGPA Progress</h3>
            <Line data={sgpaData} options={sgpaOptions} />
        </div>
    );
};

export default SgpaGraph;
