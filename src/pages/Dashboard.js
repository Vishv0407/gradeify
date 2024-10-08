import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { backend } from '../data';

const Dashboard = () => {
    const { user, semesters = [], setSemesters, logout } = useContext(UserContext); // Default semesters to an empty array
    const [semesterNumber, setSemesterNumber] = useState('');
    const [courses, setCourses] = useState([{ courseCode: '', credit: '', cgpa: '' }]);
    const [finalCgpa, setFinalCgpa] = useState(null);
    const [finalSgpa, setFinalSgpa] = useState(null);
    const [isPressed, setIsPressed] = useState(false);
    const navigate = useNavigate();

    // Fetch user data with their semester details
    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    // Calculate CGPA whenever courses or semesters change
    useEffect(() => {
        calculateCGPA();
    }, [courses, semesters]); // Adding dependencies

    const fetchUserData = async () => {
        try {
            const response = await axios.post(`${backend}/api/auth/getUser`, { email: user.email });
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

        setFinalCgpa(cgpa.toFixed(2)); // Set CGPA
        setFinalSgpa(currentSGPA.toFixed(2)); // Set SGPA
    };

    // Check if inputs are valid and change state to reflect "pressed"
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

    // Combined function to calculate CGPA and check inputs
    const calculateCGPAWithPressCheck = () => {
        checkInputsAndSetPress();
        calculateCGPA();
    };

    // Handle course input change
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

    // Handle adding a new course
    const handleAddCourse = () => {
        setCourses([...courses, { courseCode: '', credit: '', cgpa: '' }]);
    };

    // Clear input fields
    const handleClearInputs = () => {
        setCourses([{ courseCode: '', credit: '', cgpa: '' }]);
        setFinalCgpa(null);
        setFinalSgpa(null);
        setIsPressed(false);
    };

    // Handle saving semester and courses to backend
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
            fetchUserData();
            handleClearInputs();
        } catch (error) {
            console.error('Error saving semester and courses:', error);
            alert('Failed to save semester data');
        }
    };

    // Handle logout
    const handleLogout = async () => {
        logout();
        navigate("/");
    };

    const knowMoreHandler = () => {
        navigate('/semesters', { state: { semesters: semesters } });
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

                    <button type="button" onClick={handleAddCourse}>Add Another Course</button>
                </form>
            </section>

            <section className="cgpa-section">
                <button onClick={calculateCGPAWithPressCheck}>Calculate CGPA</button>

                {isPressed && (
                    <div>
                        <h3>Current Semester SGPA: {finalSgpa}</h3>
                        <h4>Total CGPA: {finalCgpa}</h4>
                    </div>
                )}

                {isPressed && (
                    <div className="action-buttons">
                        <button onClick={handleSaveCGPA}>Save CGPA</button>
                        <button onClick={handleClearInputs}>Clear</button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
