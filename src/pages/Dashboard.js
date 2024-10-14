import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { backend } from '../data';
import SgpaGraph from '../components/SgpaGraph';
import SemesterGraph from '../components/SemesterGraph';
import { motion, AnimatePresence } from 'framer-motion';
import Semesters from './Semesters';
import { XCircle, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { HyperText } from '../components/HyperText';

const Dashboard = () => {
    const { user, semesters = [], setSemesters, logout } = useContext(UserContext);
    const [semesterNumber, setSemesterNumber] = useState('');
    const [courses, setCourses] = useState([{ courseCode: '', credit: '', cgpa: '' }]);
    const [finalCgpa, setFinalCgpa] = useState(null);
    const [finalSgpa, setFinalSgpa] = useState(null);
    const [isPressed, setIsPressed] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [barChartData, setBarChartData] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        if (user && user.email) {
            fetchUserData(user.email);
        }
    }, [user?.email]);

    useEffect(() => {
        calculateCGPA();
    }, [courses, semesters]);

    const areAllInputsFilled = () => {
        return courses.every(course =>
            course.courseCode.trim() !== '' &&
            course.credit.trim() !== '' &&
            course.cgpa.trim() !== ''
        );
    };

    const handleCalculateCGPA = () => {
        if (areAllInputsFilled()) {
            calculateCGPAWithPressCheck();
            toast.success('CGPA calculated successfully!');
        } else {
            toast.error('Please fill in all course details before calculating CGPA.');
        }
    };

    const fetchUserData = async (email) => {
        try {
            const response = await axios.post(`${backend}/api/auth/getUser`, { email });
            const userData = response.data;

            if (userData.semesters.length > 0) {
                setSemesters(userData.semesters);
                setSemesterNumber(userData.semesters.length + 1);
            } else {
                setSemesterNumber(1);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const calculateCGPA = () => {
        let totalCredits = 0;
        let weightedSum = 0;

        // Add previous semesters' contributions to CGPA
        semesters.forEach(sem => {
            if (!isNaN(sem.totalCredits) && !isNaN(sem.totalGrades)) {
                totalCredits += parseFloat(sem.totalCredits);
                weightedSum += parseFloat(sem.totalGrades);
            }
        });

        // Calculate current semester's total credits and weighted sum
        const currentTotalCredits = courses.reduce((acc, course) => {
            const credit = parseFloat(course.credit);
            return acc + (isNaN(credit) ? 0 : credit);
        }, 0);

        const currentWeightedSum = courses.reduce((acc, course) => {
            const credit = parseFloat(course.credit);
            const courseCgpa = parseFloat(course.cgpa);
            return acc + (isNaN(credit) || isNaN(courseCgpa) ? 0 : credit * courseCgpa);
        }, 0);

        // Calculate current SGPA
        const currentSGPA = currentTotalCredits > 0 ? currentWeightedSum / currentTotalCredits : 0;

        // Add current semester's contributions to total CGPA
        totalCredits += currentTotalCredits;
        weightedSum += currentWeightedSum;

        // Final CGPA calculation
        const cgpa = totalCredits > 0 ? weightedSum / totalCredits : 0;

        setFinalCgpa(cgpa.toFixed(2));
        setFinalSgpa(currentSGPA.toFixed(2));

        // Prepare data for SgpaGraph
        // (Assuming you want to show SGPA over all semesters, including the current one)
        const sgpaGraphData = {
            labels: [...semesters.map((_, index) => `Semester ${index + 1}`), `Semester ${semesterNumber}`],
            datasets: [
                {
                    label: 'SGPA',
                    data: [...semesters.map(sem => parseFloat(sem.sgpa) || 0), parseFloat(currentSGPA) || 0],
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

        // Update SgpaGraph data
        // Assuming SgpaGraph component can accept data as prop directly
        // Otherwise, manage it via state and pass as a prop

        // Prepare data for Semester Graph
        if (selectedSemester !== null) {
            const semester = semesters[selectedSemester];
            if (semester && semester.courses) {
                const graphData = {
                    labels: semester.courses.map(course => course.courseCode || 'N/A'),
                    datasets: [
                        {
                            label: 'Course CGPA',
                            data: semester.courses.map(course => parseFloat(course.cgpa) || 0),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        },
                    ],
                };
                setBarChartData(graphData);
            }
        } else {
            setBarChartData(null);
        }
    };

    const checkInputsAndSetPress = () => {
        const areInputsValid = courses.every(course =>
            course.courseCode !== '' &&
            !isNaN(parseFloat(course.credit)) &&
            !isNaN(parseFloat(course.cgpa))
        );

        if (areInputsValid) {
            setIsPressed(true);
        } else {
            alert('Please fill in all the course fields correctly.');
            setIsPressed(false);
        }
    };

    const calculateCGPAWithPressCheck = () => {
        checkInputsAndSetPress();
        calculateCGPA();
    };

    const handleCourseChange = (index, field, value) => {
        if (field === 'credit' || field === 'cgpa') {
            const parsedValue = parseFloat(value);
            if (isNaN(parsedValue) && value !== '') {
                return; // Prevent setting invalid values
            }
        }

        const updatedCourses = [...courses];
        updatedCourses[index][field] = value;
        setCourses(updatedCourses);
    };

    const handleAddCourse = () => {
        setCourses([...courses, { courseCode: '', credit: '', cgpa: '' }]);
    };

    const handleRemoveCourse = (index) => {
        const updatedCourses = courses.filter((_, i) => i !== index);
        setCourses(updatedCourses);
    };

    const handleClearInputs = () => {
        setCourses([{ courseCode: '', credit: '', cgpa: '' }]);
        setFinalCgpa(null);
        setFinalSgpa(null);
        setIsPressed(false);
        setBarChartData(null);
        setSelectedSemester(null);
    };

    const handleSaveCGPA = async () => {
        try {
            // Calculate total credits and grades for the semester
            let totalCredits = courses.reduce((acc, course) => {
                const credit = parseFloat(course.credit);
                return acc + (isNaN(credit) ? 0 : credit);
            }, 0);
    
            let totalGrades = courses.reduce((acc, course) => {
                const credit = parseFloat(course.credit);
                const cgpa = parseFloat(course.cgpa);
                return acc + (isNaN(credit) || isNaN(cgpa) ? 0 : credit * cgpa);
            }, 0);
    
            // First, create the semester to get its ObjectId
            const semesterResponse = await axios.post(`${backend}/api/semester/addSemester`, {
                userId: user._id,
                semesterNumber,
                sgpa: finalSgpa,  // You can provide a default or calculated value here
                totalCredits: 0,   // Initially set total credits to 0
                totalGrades: 0,    // Initially set total grades to 0
                courses: []        // Initially empty
            });
    
            const semesterId = semesterResponse.data._id;
    
            // Now add the courses and associate them with the semester
            const courseResponse = await axios.post(`${backend}/api/course/addCourses`, {
                courses,
                userId: user._id,
                semesterId: semesterId // Associate the courses with the newly created semester
            });
    
            const courseIds = courseResponse.data.map(course => course._id);
    
            // Update the semester with actual course IDs, total credits, and total grades
            await axios.put(`${backend}/api/semester/updateSemester`, {
                semesterId,          // Update this specific semester
                totalCredits: totalCredits,
                totalGrades: totalGrades,
                courses: courseIds,   // Update with the actual course IDs
            });
    
            toast.success('CGPA saved successfully!');
            fetchUserData(user.email);
            handleClearInputs();
        } catch (error) {
            console.error('Error saving semester and courses:', error);
            toast.error('Failed to save CGPA. Please try again.');
        }
    };
    

    const handleLogout = async () => {
        logout();
        navigate("/");
    };

    const knowMoreHandler = () => {
        navigate('/semesters', { state: { semesters: semesters } });
    };

    // Handle clicking on a semester point in SgpaGraph
    const handleSGPAClick = (index) => {
        setSelectedSemester(index);
    };

    // Handle closing the SemesterGraph modal
    const handleCloseSemesterGraph = () => {
        setSelectedSemester(null);
        setBarChartData(null);
    };

    return (
        <div className="min-h-screen bg-[rgb(1,8,21)] text-white p-4">
            <Toaster position="top-right" />
            <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-bold">Gradeify</h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300 ease-in-out"
                >
                    Log Out
                </button>
            </header>

            

            <div className="max-w-6xl mx-auto px-4 lg:px-0">

                    <HyperText
                         text={`Welcome, ${user.name}`}
                        duration={1000} // Optional: Adjust the animation duration
                        className=" text-xl md:text-2xl font-bold my-4" // Optional: Custom class names
                        animateOnLoad={true} // Optional: If you want the animation to trigger on load
                    />

                {semesters.length > 0 && (
                    <div className="bg-white/5 p-6 rounded-lg mb-8">
                        <h3 className="text-xl font-semibold mb-2">Your Current CGPA: {finalCgpa !== null ? finalCgpa : 'N/A'}</h3>
                        <h4 className="text-lg">Previous {semesters.length} Semester SGPA: {semesters[semesters.length - 1].sgpa}</h4>
                    </div>
                )}

                <section className="bg-white/5 p-6 rounded-lg mb-8">
                    <h2 className="text-2xl font-bold mb-4">Add New Semester</h2>
                    <h3 className="text-xl mb-4">Semester: {semesterNumber}</h3>

                    <form className="space-y-6">
                        {courses.map((course, index) => (
                            <div key={index} className="relative bg-white/10 p-6 rounded-lg mt-8">
                                {courses.length > 1 && ( // Only show button if there is more than one course
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCourse(index)}
                                        className="absolute -top-3 -right-3 text-red-500 hover:text-red-600 transition duration-300 ease-in-out bg-[rgb(1,8,21)] rounded-full p-1 z-10"
                                    >
                                        <XCircle size={24} />
                                    </button>
                                )}
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex-1 min-w-[200px]">
                                        <span className="block mb-1">Course Code:</span>
                                        <input
                                            type="text"
                                            value={course.courseCode}
                                            onChange={(e) => handleCourseChange(index, 'courseCode', e.target.value)}
                                            className="w-full bg-white/10 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </label>
                                    <label className="flex-1 min-w-[200px]">
                                        <span className="block mb-1">Credit:</span>
                                        <input
                                            type="number"
                                            value={course.credit}
                                            onChange={(e) => handleCourseChange(index, 'credit', e.target.value)}
                                            className="w-full bg-white/10 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </label>
                                    <label className="flex-1 min-w-[200px]">
                                        <span className="block mb-1">CGPA:</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={course.cgpa}
                                            onChange={(e) => handleCourseChange(index, 'cgpa', e.target.value)}
                                            className="w-full bg-white/10 border border-white/30 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}


                        <div className="flex flex-wrap gap-4">
                            <button
                                type="button"
                                onClick={handleAddCourse}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-300 ease-in-out flex items-center"
                            >
                                <Plus size={20} className="mr-2" /> Add Course
                            </button>
                            {courses.some(course => course.courseCode || course.credit || course.cgpa) && (
                                <button
                                    type="button"
                                    onClick={handleClearInputs}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300 ease-in-out"
                                >
                                    Clear Inputs
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {courses.some(course => course.courseCode && course.credit && course.cgpa) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-lg mb-8 shadow-lg"
                    >
                        <h3 className="text-2xl font-bold mb-2">Final CGPA: {finalCgpa}</h3>
                        <h4 className="text-xl">SGPA for this semester: {finalSgpa}</h4>
                        <button
                            onClick={handleSaveCGPA}
                            className="bg-white text-blue-500 hover:bg-blue-100 px-4 py-2 rounded transition duration-300 ease-in-out mt-4 font-semibold"
                        >
                            Save CGPA
                        </button>
                    </motion.div>
                )}


                {/* SGPA Graph */}
                {semesters.length > 0 && (
                    <div className="bg-white/5 p-6 rounded-lg mb-8">
                        <h3 className="text-xl font-bold mb-4">SGPA Over Semesters</h3>
                        <SgpaGraph semesters={semesters} handleSGPAClick={handleSGPAClick} />
                    </div>
                )}

                <AnimatePresence>
                    {selectedSemester !== null && barChartData && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
                        >
                            <div className="bg-white p-8 rounded-lg max-w-lg w-full relative">
                                <button
                                    onClick={handleCloseSemesterGraph}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-600 transition duration-300 ease-in-out"
                                >
                                    <XCircle size={32} />
                                </button>
                                <h3 className="text-xl font-bold mb-4">Semester {selectedSemester + 1} - Course CGPA</h3>
                                <SemesterGraph data={barChartData} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Semesters />
            </div>
        </div>
    );
};

export default Dashboard;