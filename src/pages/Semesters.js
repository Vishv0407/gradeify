import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../context/UserContext';
import { ChevronDown, ChevronUp, Edit2, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { backend } from '../data';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Semesters = () => {
    const { semesters } = useContext(UserContext);
    const [editingIndex, setEditingIndex] = useState(null);
    const [updatedCourses, setUpdatedCourses] = useState([]);
    const [dropdowns, setDropdowns] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!semesters || semesters.length === 0) {
        return <div className="text-white">No semester data available.</div>;
    }

    const handleEdit = (index) => {
        setEditingIndex(index);
        setUpdatedCourses(JSON.parse(JSON.stringify(semesters[index].courses)));
        setIsModalOpen(true);
    };

    const handleCourseChange = (index, field, value) => {
        const updatedCoursesCopy = [...updatedCourses];
        updatedCoursesCopy[index][field] = value;
        setUpdatedCourses(updatedCoursesCopy);
    };

    const handleAddCourse = () => {
        setUpdatedCourses((prev) => [...prev, { courseCode: '', cgpa: '', credit: '', _id: null }]);
    };

    const handleRemoveCourse = (index) => {
        const updatedCoursesCopy = [...updatedCourses];
        updatedCoursesCopy.splice(index, 1);
        setUpdatedCourses(updatedCoursesCopy);
    };

    const handleUpdate = async (semesterId) => {
        try {
            // ... (keep the existing update logic)
            setIsModalOpen(false);
            setEditingIndex(null);
            alert('Semester updated successfully!');
        } catch (error) {
            console.error('Error updating semester:', error);
            alert('Failed to update semester');
        }
    };

    const calculateCGPA = () => {
        const totalCredits = semesters.reduce((total, semester) =>
            total + semester.courses.reduce((sum, course) => sum + parseFloat(course.credit || 0), 0), 0);
        const totalGrades = semesters.reduce((total, semester) =>
            total + semester.courses.reduce((sum, course) => sum + (parseFloat(course.cgpa || 0) * parseFloat(course.credit || 0)), 0), 0);

        return totalGrades / totalCredits || 0;
    };

    const toggleDropdown = (index) => {
        setDropdowns((prevState) => ({ ...prevState, [index]: !prevState[index] }));
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 4.0,
                ticks: {
                    callback: (value) => value === 0 ? '0' : value.toFixed(1),
                    values: [0, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0],
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const course = context.dataset.courses[context.dataIndex];
                        return `${course.courseCode}: CGPA ${course.cgpa} (${course.credit} credits)`;
                    },
                },
            },
        },
    };

    return (
        <div className="bg-[rgb(1,8,21)] text-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Semesters Information</h1>
            <p className="text-xl mb-8">Total CGPA: {calculateCGPA().toFixed(2)}</p>

            {semesters.map((semester, index) => (
                <div key={index} className="mb-8 border-b border-gray-700 pb-6">
                    <button
                        onClick={() => toggleDropdown(index)}
                        className="flex items-center justify-between w-full text-left text-xl font-semibold mb-4 focus:outline-none"
                    >
                        <span>Semester {index + 1}</span>
                        {dropdowns[index] ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>

                    <AnimatePresence>
                        {dropdowns[index] && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <table className="w-full mb-4">
                                    <thead>
                                        <tr>
                                            <th className="text-left">Course Code</th>
                                            <th className="text-left">CGPA</th>
                                            <th className="text-left">Credit</th>
                                            <th className="text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {semester.courses.map((course, courseIndex) => (
                                            <tr key={courseIndex}>
                                                <td>{course.courseCode}</td>
                                                <td>{course.cgpa}</td>
                                                <td>{course.credit}</td>
                                                <td>
                                                    <button
                                                        onClick={() => handleEdit(index)}
                                                        className="mr-2 text-blue-400 hover:text-blue-300"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <p className="mb-4">Total SGPA: {semester.sgpa}</p>

                                <div className="h-64 mb-4">
                                    <Bar
                                        data={{
                                            labels: semester.courses.map(course => course.courseCode),
                                            datasets: [
                                                {
                                                    data: semester.courses.map(course => course.cgpa),
                                                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                                    courses: semester.courses,
                                                },
                                            ],
                                        }}
                                        options={barOptions}
                                    />
                                </div>
                                <p className="text-center">SGPA: {semester.sgpa}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[rgb(1,8,21)] p-6 rounded-lg w-full max-w-2xl"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Edit Semester</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <table className="w-full mb-4">
                                <thead>
                                    <tr>
                                        <th className="text-left">Course Code</th>
                                        <th className="text-left">CGPA</th>
                                        <th className="text-left">Credit</th>
                                        <th className="text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {updatedCourses.map((course, courseIndex) => (
                                        <tr key={courseIndex}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={course.courseCode}
                                                    onChange={(e) => handleCourseChange(courseIndex, 'courseCode', e.target.value)}
                                                    className="bg-gray-700 text-white p-2 rounded"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={course.cgpa}
                                                    onChange={(e) => handleCourseChange(courseIndex, 'cgpa', e.target.value)}
                                                    className="bg-gray-700 text-white p-2 rounded"
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={course.credit}
                                                    onChange={(e) => handleCourseChange(courseIndex, 'credit', e.target.value)}
                                                    className="bg-gray-700 text-white p-2 rounded"
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleRemoveCourse(courseIndex)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex justify-between">
                                <button
                                    onClick={handleAddCourse}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Add Course
                                </button>
                                <div>
                                    <button
                                        onClick={() => handleUpdate(semesters[editingIndex]._id)}
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
                                    >
                                        Update
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Semesters;