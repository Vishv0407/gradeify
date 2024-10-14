import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { backend } from '../data';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Edit2, Trash2, X } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { toast } from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Semesters = () => {
    const { semesters } = useContext(UserContext);
    const [isMobile, setMobile] = useState(window.innerWidth < 768);
    const [editingIndex, setEditingIndex] = useState(null);
    const [updatedCourses, setUpdatedCourses] = useState([]);
    const [dropdowns, setDropdowns] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Effect for handling window resize
    useEffect(() => {
        const handleResize = () => {
            setMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            // Prevent background scrolling
            document.body.style.overflow = 'hidden';
        } else {
            // Reset overflow
            document.body.style.overflow = 'auto';
        }

        // Cleanup function to ensure overflow is reset
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isModalOpen]);

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

    const updateCourse = async (courseId, course) => {
        try {
            await axios.put(`${backend}/api/course/updateCourse/${courseId}`, {
                courseCode: course.courseCode,
                credit: course.credit,
                cgpa: parseFloat(course.cgpa),
            });
            toast.success('Course updated successfully');
        } catch (error) {
            console.error('Error updating course:', error);
            toast.error('Failed to update course');
        }
    };

    const handleUpdate = async (semesterId) => {
        try {
            const userId = semesters[0]?.courses[0].userId; // Replace this with the actual user ID you have
            // Loop through updated courses and compare them with the old courses
            for (let courseIndex = 0; courseIndex < updatedCourses.length; courseIndex++) {
                const updatedCourse = updatedCourses[courseIndex];
                const oldCourse = semesters[editingIndex].courses[courseIndex];
                // Check if the course exists (_id) and if it was modified
                if (updatedCourse._id && (
                    updatedCourse.courseCode !== oldCourse.courseCode ||
                    updatedCourse.cgpa !== oldCourse.cgpa ||
                    updatedCourse.credit !== oldCourse.credit
                )) {
                    await updateCourse(updatedCourse._id, updatedCourse); // Pass userId to update
                }
                // Handle new courses (those without _id)
                if (!updatedCourse._id && (updatedCourse.courseCode || updatedCourse.cgpa || updatedCourse.credit)) {
                    const response = await axios.post(`${backend}/api/course/addSingleCourse`, {
                        semesterId,
                        userId, // Add userId here
                        courseCode: updatedCourse.courseCode,
                        credit: updatedCourse.credit,
                        cgpa: parseFloat(updatedCourse.cgpa),
                    });
                    // Add the new course to updatedCourses with its _id
                    updatedCourses[courseIndex] = { ...updatedCourse, _id: response.data.savedCourse._id };
                }
            }
            // Calculate new SGPA and totalCredits and totalGrades for the updated semester
            const totalCredits = updatedCourses.reduce((total, course) => total + parseFloat(course.credit || 0), 0);
            const totalGrades = updatedCourses.reduce((total, course) => total + (parseFloat(course.cgpa || 0) * parseFloat(course.credit || 0)), 0);
            const newSGPA = totalGrades / totalCredits || 0;
            // Update semester data (without CGPA)
            await axios.put(`${backend}/api/semester/updateSemester`, {
                semesterId: semesterId,
                sgpa: parseFloat(newSGPA.toFixed(2)),
                courses: updatedCourses,
                totalCredits: totalCredits,
                totalGrades: totalGrades,
            });
            // Update state after updating semester
            const updatedSemesters = [...semesters];
            updatedSemesters[editingIndex] = {
                ...updatedSemesters[editingIndex],
                sgpa: parseFloat(newSGPA.toFixed(2)),
                courses: updatedCourses,
            };
            setEditingIndex(null); // Exit editing mode
            toast.success('Semester updated successfully');
        } catch (error) {
            console.error('Error updating semester:', error);
            toast.error('Failed to update semester');
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
            x: {
                ticks: {
                    autoSkip: false,
                    // Keep rotation horizontal for both mobile and desktop
                    maxRotation: isMobile ? 90 : 0,
                    minRotation: isMobile ? 90 : 0,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            },
            datalabels: {
                anchor: 'center',
                align: 'center',
                offset: 4,
                color: '#fff',
                font: {
                    weight: 'bold',
                },
                formatter: (value, context) => {
                    const course = context.dataset.courses[context.dataIndex];
                    return `${course.cgpa} (${course.credit})`;
                },
                rotation: isMobile ? -90 : 0, // Rotate labels for mobile
            },
        },
    };

    return (
        <div className="bg-[rgb(1,8,21)] text-white p-6 rounded-lg shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Semesters Information</h1>
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
                                <div className="space-y-2 mb-8">
                                    {semester.courses.map((course, courseIndex) => (
                                        <div key={courseIndex} className="w-full md:w-[50%] m-auto flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                                            <div className="w-5 flex-1 flex items-center justify-between space-x-4">
                                                <span className="font-medium">{course.courseCode}</span>
                                                <span>CGPA: {course.cgpa}</span>
                                                <span>Credit: {course.credit}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

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
                                        plugins={[ChartDataLabels]}
                                    />
                                </div>
                                <p className="text-center">SGPA: {semester.sgpa}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Move the Edit button to the end */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => handleEdit(index)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Edit Semester
                        </button>
                    </div>
                </div>
            ))}

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[rgb(1,8,21)] p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Edit Semester</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {updatedCourses.map((course, courseIndex) => (
                                    <div key={courseIndex} className="bg-gray-800 p-3 rounded-lg flex items-center justify-between">
                                        <div className="flex flex-wrap gap-4 w-full">
                                            <input
                                                type="text"
                                                value={course.courseCode}
                                                onChange={(e) => handleCourseChange(courseIndex, 'courseCode', e.target.value)}
                                                placeholder="Course Code"
                                                className="bg-gray-700 text-white p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                            <input
                                                type="number"
                                                value={course.cgpa}
                                                onChange={(e) => handleCourseChange(courseIndex, 'cgpa', e.target.value)}
                                                placeholder="CGPA"
                                                className="bg-gray-700 text-white p-2 rounded w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                            <input
                                                type="number"
                                                value={course.credit}
                                                onChange={(e) => handleCourseChange(courseIndex, 'credit', e.target.value)}
                                                placeholder="Credit"
                                                className="bg-gray-700 text-white p-2 rounded w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleRemoveCourse(courseIndex)}
                                            className="text-red-400 hover:text-red-300 ml-2 transition duration-200"
                                            aria-label="Remove Course"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6">
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
