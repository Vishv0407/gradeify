import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { backend } from '../data';

const Semesters = () => {

    const { semesters } = useContext(UserContext); // Access user and semesters

    const [editingIndex, setEditingIndex] = useState(null);
    const [updatedCourses, setUpdatedCourses] = useState([]);

    if (!semesters || semesters.length === 0) {
        return <div>No semester data available.</div>;
    }

    // Function to handle editing a semester
    const handleEdit = (index) => {
        setEditingIndex(index);
        setUpdatedCourses(JSON.parse(JSON.stringify(semesters[index].courses))); // Deep copy of current courses to edit
    };

    // Function to handle course changes
    const handleCourseChange = (index, field, value) => {
        const updatedCoursesCopy = [...updatedCourses];
        updatedCoursesCopy[index][field] = value;
        setUpdatedCourses(updatedCoursesCopy);
    };

    // Function to add a new course
    const handleAddCourse = () => {
        setUpdatedCourses((prev) => [...prev, { courseCode: '', cgpa: '', credit: '', _id: null }]);
    };

    // Function to remove a course
    const handleRemoveCourse = (index) => {
        const updatedCoursesCopy = [...updatedCourses];
        updatedCoursesCopy.splice(index, 1);
        setUpdatedCourses(updatedCoursesCopy);
    };

    // Function to update individual course details
    const updateCourse = async (courseId, course) => {
        try {
            await axios.put(`${backend}/api/course/updateCourse/${courseId}`, {
                courseCode: course.courseCode,
                credit: course.credit,
                cgpa: parseFloat(course.cgpa.toFixed(2)),
            });

            console.log('Course updated successfully:', courseId);
        } catch (error) {
            console.error('Error updating course:', error);
        }
    };

    // Function to handle the update of the entire semester and course data
    // Function to handle the update of the entire semester and course data
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
                    await updateCourse(updatedCourse._id, updatedCourse, userId); // Pass userId to update
                }

                // Handle new courses (those without _id)
                if (!updatedCourse._id && (updatedCourse.courseCode || updatedCourse.cgpa || updatedCourse.credit)) {
                    const response = await axios.post(`${backend}/api/course/addSingleCourse`, {
                        semesterId,
                        userId, // Add userId here
                        courseCode: updatedCourse.courseCode,
                        credit: updatedCourse.credit,
                        cgpa: parseFloat(updatedCourse.cgpa.toFixed(2)),
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
            await axios.put(`${backend}/api/semester/updateSemester/${semesterId}`, {
                semesterNumber: semesters[editingIndex].semesterNumber,
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
            alert('Semester updated successfully!');
        } catch (error) {
            console.error('Error updating semester:', error);
            alert('Failed to update semester');
        }
    };



    // Function to calculate CGPA across all semesters on the frontend
    const calculateCGPA = () => {
        const totalCredits = semesters.reduce((total, semester) =>
            total + semester.courses.reduce((sum, course) => sum + parseFloat(course.credit || 0), 0), 0);
        const totalGrades = semesters.reduce((total, semester) =>
            total + semester.courses.reduce((sum, course) => sum + (parseFloat(course.cgpa || 0) * parseFloat(course.credit || 0)), 0), 0);

        return totalGrades / totalCredits || 0;
    };

    return (
        <div>
            <h1>Semesters Information</h1>
            {/* Display dynamically calculated CGPA */}
            <p>Total CGPA: {calculateCGPA().toFixed(2)}</p>

            {semesters.map((semester, index) => (
                <div key={index}>
                    <h3>Semester {index + 1}</h3>

                    <table>
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>CGPA</th>
                                <th>Credit</th>
                                {editingIndex === index && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {(editingIndex === index ? updatedCourses : semester.courses).map((course, courseIndex) => (
                                <tr key={courseIndex}>
                                    <td>
                                        {editingIndex === index ? (
                                            <input
                                                type="text"
                                                value={course.courseCode}
                                                onChange={(e) => handleCourseChange(courseIndex, 'courseCode', e.target.value)}
                                            />
                                        ) : (
                                            course.courseCode
                                        )}
                                    </td>
                                    <td>
                                        {editingIndex === index ? (
                                            <input
                                                type="number"
                                                value={course.cgpa}
                                                onChange={(e) => handleCourseChange(courseIndex, 'cgpa', e.target.value)}
                                            />
                                        ) : (
                                            course.cgpa
                                        )}
                                    </td>
                                    <td>
                                        {editingIndex === index ? (
                                            <input
                                                type="number"
                                                value={course.credit}
                                                onChange={(e) => handleCourseChange(courseIndex, 'credit', e.target.value)}
                                            />
                                        ) : (
                                            course.credit
                                        )}
                                    </td>
                                    {editingIndex === index && (
                                        <td>
                                            <button onClick={() => handleRemoveCourse(courseIndex)}>Remove</button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div>
                        <p>Total SGPA: {semester.sgpa}</p>
                    </div>

                    {editingIndex === index ? (
                        <div>
                            <button onClick={handleAddCourse}>Add Course</button>
                            <button onClick={() => handleUpdate(semester._id)}>Update</button>
                            <button onClick={() => setEditingIndex(null)}>Cancel</button>
                        </div>
                    ) : (
                        <button onClick={() => handleEdit(index)}>Edit</button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Semesters;
