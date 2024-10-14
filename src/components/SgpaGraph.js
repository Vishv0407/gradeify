import React, { useState, useEffect } from 'react';
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
    const [isMobile, setMobile] = useState(false);

    // Manage responsiveness for mobile
    useEffect(() => {
        const handleResize = () => {
            setMobile(window.innerWidth < 768); // Check for mobile screens
        };

        // Set the initial screen size
        handleResize();
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Prepare data for the Line chart
    const sgpaData = {
        labels: semesters.map((sem, index) => `Sem ${index + 1}`),
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
                    label: (context) => `SGPA: ${context.raw.toFixed(2)}`,
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
                    autoSkip: false, // Ensure all labels are shown
                    callback: function (value, index, values) {
                        const sgpa = semesters[index].sgpa || 0;

                        // Display SGPA vertically on mobile, otherwise keep it normal
                        if (isMobile) {
                            return `Sem ${index + 1} SGPA: ${sgpa.toFixed(2)}`;
                        } else {
                            return [`Sem ${index + 1}`, `SGPA: ${sgpa.toFixed(2)}`];
                        }
                    },
                    maxRotation: isMobile ? 90 : 0,
                    minRotation: isMobile ? 90 : 0,
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
