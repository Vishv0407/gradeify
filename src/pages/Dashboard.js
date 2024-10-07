import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const location = useLocation();
    const user = location.state?.user; // Assumes you are passing the user on login
    const [semesters, setSemesters] = useState([]);
    const [semesterNumber, setSemesterNumber] = useState('');
    const [courses, setCourses] = useState([{ courseCode: '', credit: '', cgpa: '' }]);
    const [finalCgpa, setFinalCgpa] = useState(null);
    const [finalSgpa, setFinalSgpa] = useState(null);
    const navigate = useNavigate();

    // Fetch the user data with their semester details
    useEffect(() => {
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            const response = await axios.post('http://localhost:4000/api/auth/getUser', { email: user.email });
            const userData = response.data;

            if (userData.semesters.length > 0) {
                // Set the semesters and update the semester number to next one
                setSemesters(userData.semesters);
                setSemesterNumber(userData.semesters.length + 1); // Next semester number
            } else {
                // Ask user to add the first semester
                setSemesterNumber(1); // First semester
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    // Handle course input change
    const handleCourseChange = (index, field, value) => {
        const updatedCourses = [...courses];
        updatedCourses[index][field] = value;
        setCourses(updatedCourses);
    };

    // Handle adding new course
    const handleAddCourse = () => {
        setCourses([...courses, { courseCode: '', credit: '', cgpa: '' }]);
    };

    // Clear input fields
    const handleClearInputs = () => {
        setCourses([{ courseCode: '', credit: '', cgpa: '' }]);
        setFinalCgpa(null);
    };

    // Calculate CGPA based on courses entered
    const calculateCGPA = () => {
        let totalCredits = 0;
        let weightedSum = 0;
    
        // Add the previous semesters' contributions to CGPA
        semesters.forEach(sem => {
            if (!isNaN(sem.cgpa) && !isNaN(sem.totalCredits)) {
                totalCredits += parseFloat(sem.totalCredits);
                weightedSum += parseFloat(sem.totalGrades); 
            }
        });
    
        // Now, calculate SGPA for the current semester
        const currentTotalCredits = courses.reduce((acc, course) => {
            const credit = parseFloat(course.credit);
            return acc + (isNaN(credit) ? 0 : credit); // Add course credits if valid
        }, 0);
    
        const currentWeightedSum = courses.reduce((acc, course) => {
            const credit = parseFloat(course.credit);
            const courseCgpa = parseFloat(course.cgpa);
            return acc + (isNaN(credit) || isNaN(courseCgpa) ? 0 : credit * courseCgpa); // Weighted sum of current courses
        }, 0);
    
        const currentSGPA = currentTotalCredits > 0 ? currentWeightedSum / currentTotalCredits : 0;
    
        // Add the current semester's contributions to CGPA
        totalCredits += currentTotalCredits;
        weightedSum += currentWeightedSum;
    
        // Final CGPA calculation
        const cgpa = totalCredits > 0 ? weightedSum / totalCredits : 0;
    
        setFinalCgpa(cgpa.toFixed(2)); // Set CGPA
        setFinalSgpa(currentSGPA.toFixed(2)); // Set SGPA
    };
    
    // Handle saving semester and courses to backend
    const handleSaveCGPA = async () => {
        try {

            // Calculate total credits and total grades for the current semester
            let totalCredits = courses.reduce((acc, course) => {
                const credit = parseFloat(course.credit);
                return acc + (isNaN(credit) ? 0 : credit); // Sum up valid credits
            }, 0);

            let totalGrades = courses.reduce((acc, course) => {
                const credit = parseFloat(course.credit);
                const cgpa = parseFloat(course.cgpa);
                return acc + (isNaN(credit) || isNaN(cgpa) ? 0 : credit * cgpa); // Sum up valid grades (credit * CGPA)
            }, 0);
            
            // Add courses first
            const courseResponse = await axios.post('http://localhost:4000/api/course/addCourses', {
                courses,
                userId: user._id,
                semesterId: semesterNumber
            });

            // After courses are saved, add the semester
            const courseIds = courseResponse.data.map(course => course._id);

            await axios.post('http://localhost:4000/api/semester/addSemester', {
                userId: user._id,
                semesterNumber,
                cgpa: finalCgpa,
                sgpa: finalSgpa, // Assuming SGPA = CGPA for now
                courses: courseIds,
                totalCredits: totalCredits,
                totalGrades: totalGrades 
            });

            alert('Semester and courses saved successfully!');
            fetchUserData(); // Refresh user data after saving
            handleClearInputs(); // Clear input fields after saving

        } catch (error) {
            console.error('Error saving semester and courses:', error);
            alert('Failed to save semester data');
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            // await axios.post('http://localhost:4000/api/auth/logout');
            navigate('/'); // Redirect to login page
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const knowMoreHandler = () => {
        // console.log(semesters);
        navigate('/semesters', { state: { semesters: semesters } } );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome, {user.name}</h1>
                <button onClick={handleLogout} className="logout-button">Log Out</button>
            </header>

            {/* Display current CGPA and previous semester's SGPA */}
            {semesters.length > 0 && (
                <div className="cgpa-info">
                    <h3>Your Current CGPA: {semesters[semesters.length - 1].cgpa}</h3>
                    <h4>Previous Semester SGPA: {semesters[semesters.length - 1].sgpa}</h4>
                </div>
            )}

            <button onClick={knowMoreHandler}> Know more</button>

            {/* Add New Semester */}
            <section className="add-semester">
                <h2>Add New Semester</h2>
                <h3>Semester: {semesterNumber}</h3>

                {/* Course Input Fields */}
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

            {/* Calculate CGPA Button */}

            <section className="cgpa-section">
                <button onClick={calculateCGPA} className="calculate-cgpa-button">
                    Calculate CGPA
                </button>

                {finalCgpa && (
                    <div className="cgpa-result">
                        <h2>Your Calculated CGPA: {finalCgpa}</h2>
                        <h3>Your Calculated SGPA: {finalSgpa}</h3>
                        <button onClick={handleSaveCGPA} className="save-cgpa-button">Save CGPA</button>
                        <button onClick={handleClearInputs} className="clear-inputs-button">Clear</button>
                    </div>
                )}
            </section>

        </div>
    );
};

export default Dashboard;
