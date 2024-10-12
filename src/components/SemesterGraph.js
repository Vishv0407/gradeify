// src/components/SemesterGraph.js
import React, { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
} from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';
import './SemesterGraph.css'; // CSS for modal and animations

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement
);

const SemesterGraph = ({ barChartData, handleClose }) => {
    useEffect(() => {
        return () => {
            const chart = ChartJS.getChart('semesterChart');
            if (chart) {
                chart.destroy();
            }
        };
    }, []);

    // Validate barChartData
    if (!barChartData || !barChartData.labels || !barChartData.datasets) {
        return null; // Do not render if data is invalid
    }

    return (
        <AnimatePresence>
            <motion.div
                className="semester-graph-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <motion.div
                    className="modal-content"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                >
                    <button className="close-button" onClick={handleClose}>X</button>
                    <div className="canvas-container">
                        <Bar
                            id="semesterChart"
                            data={barChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'top',
                                    },
                                    tooltip: {
                                        enabled: true,
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            stepSize: 0.3,
                                            callback: (value) => value.toFixed(1),
                                        },
                                        min: 0,
                                        max: 4.0,
                                    },
                                },
                            }}
                        />
                    </div>
                    <div className="course-info">
                        {barChartData.labels.map((label, index) => (
                            <div key={index} className="course-label">
                                <span>{label}: {barChartData.datasets[0].data[index]}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SemesterGraph;
