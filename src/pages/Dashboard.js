// src/pages/Dashboard.js
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { backend } from '../data';
import SgpaGraph from '../components/SgpaGraph';
import SemesterGraph from '../components/SemesterGraph';
import { motion, AnimatePresence } from 'framer-motion';
import './dash.css'; // Optional: Add styling as needed
import Semesters from './Semesters';

const Dashboard = () => {
    const { user, semesters = [], setSemesters, logout } = useContext(UserContext);
    const [semesterNumber, setSemesterNumber] = useState('');
    const [courses, setCourses] = useState([{ courseCode: '', credit: '', cgpa: '' }]);
    const [finalCgpa, setFinalCgpa] = useState(null);
    const [finalSgpa, setFinalSgpa] = useState(null);
    const [isPressed, setIsPressed] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(null); // For SemesterGraph modal
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
            let totalCredits = courses.reduce((acc, course) => {
                const credit = parseFloat(course.credit);
                return acc + (isNaN(credit) ? 0 : credit);
            }, 0);

            let totalGrades = courses.reduce((acc, course) => {
                const credit = parseFloat(course.credit);
                const cgpa = parseFloat(course.cgpa);
                return acc + (isNaN(credit) || isNaN(cgpa) ? 0 : credit * cgpa);
            }, 0);

            // Add courses first
            const courseResponse = await axios.post(`${backend}/api/course/addCourses`, {
                courses,
                userId: user._id,
                semesterId: semesterNumber
            });

            const courseIds = courseResponse.data.map(course => course._id);

            await axios.post(`${backend}/api/semester/addSemester`, {
                userId: user._id,
                semesterNumber,
                sgpa: finalSgpa,
                courses: courseIds,
                totalCredits: totalCredits,
                totalGrades: totalGrades
            });

            alert('Semester and courses saved successfully!');
            fetchUserData(user.email);
            handleClearInputs();
        } catch (error) {
            console.error('Error saving semester and courses:', error);
            alert('Failed to save semester data');
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
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome, {user ? user.name : 'Guest'}</h1>
                <button onClick={handleLogout} className="logout-button">Log Out</button>
            </header>

            {semesters.length > 0 && (
                <div className="cgpa-info">
                    <h3>Your Current CGPA: {finalCgpa !== null ? finalCgpa : 'N/A'}</h3>
                    <h4>Previous Semester SGPA: {semesters[semesters.length - 1].sgpa}</h4>
                </div>
            )}

            <button onClick={knowMoreHandler}>Know more</button>

            <section className="add-semester">
                <h2>Add New Semester</h2>
                <h3>Semester: {semesterNumber}</h3>

                <form>
                    {courses.map((course, index) => (
                        <div key={index} className="course-input">
                            <label>
                                Course Code:
                                <input
                                    type="text"
                                    value={course.courseCode}
                                    onChange={(e) => handleCourseChange(index, 'courseCode', e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Credit:
                                <input
                                    type="number"
                                    value={course.credit}
                                    onChange={(e) => handleCourseChange(index, 'credit', e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                CGPA:
                                <input
                                    type="number"
                                    step="0.01"
                                    value={course.cgpa}
                                    onChange={(e) => handleCourseChange(index, 'cgpa', e.target.value)}
                                    required
                                />
                            </label>
                        </div>
                    ))}

                    <button type="button" onClick={handleAddCourse}>Add Course</button>
                    <button type="button" onClick={calculateCGPAWithPressCheck}>Calculate CGPA</button>
                    <button type="button" onClick={handleClearInputs}>Clear</button>
                    <button type="button" onClick={handleSaveCGPA} disabled={!isPressed}>Save CGPA</button>
                </form>
            </section>

            {/* Render SgpaGraph */}
            {semesters.length > 0 && (
                <section className="sgpa-graph-section">
                    <h2>SGPA Progression</h2>
                    <SgpaGraph semesters={semesters} handleSGPAClick={handleSGPAClick} />
                </section>
            )}

            {/* Render Semester Graph Modal */}
            {/* <AnimatePresence>
                {selectedSemester !== null && barChartData && (
                    <SemesterGraph barChartData={barChartData} handleClose={handleCloseSemesterGraph} />
                )}
            </AnimatePresence> */}

            <Semesters />
        </div>
    );

};

export default Dashboard;
