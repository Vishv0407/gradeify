import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';
import { backend } from '../data';
import SemesterGraph from '../components/SemesterGraph'; // Import your graph component

const Semesters = () => {
    const { semesters } = useContext(UserContext);

    const [editingIndex, setEditingIndex] = useState(null);
    const [updatedCourses, setUpdatedCourses] = useState([]);
    const [dropdowns, setDropdowns] = useState({}); // Track which semesters are expanded

    if (!semesters || semesters.length === 0) {
        return <div>No semester data available.</div>;
    }

    const handleEdit = (index) => {
        setEditingIndex(index);
        setUpdatedCourses(JSON.parse(JSON.stringify(semesters[index].courses)));
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
                cgpa: parseFloat(course.cgpa.toFixed(2)),
            });
            console.log('Course updated successfully:', courseId);
        } catch (error) {
            console.error('Error updating course:', error);
        }
    };

    const handleUpdate = async (semesterId) => {
        try {
            const userId = semesters[0]?.courses[0].userId;
            for (let courseIndex = 0; courseIndex < updatedCourses.length; courseIndex++) {
                const updatedCourse = updatedCourses[courseIndex];
                const oldCourse = semesters[editingIndex].courses[courseIndex];

                if (updatedCourse._id && (
                    updatedCourse.courseCode !== oldCourse.courseCode ||
                    updatedCourse.cgpa !== oldCourse.cgpa ||
                    updatedCourse.credit !== oldCourse.credit
                )) {
                    await updateCourse(updatedCourse._id, updatedCourse, userId);
                }

                if (!updatedCourse._id && (updatedCourse.courseCode || updatedCourse.cgpa || updatedCourse.credit)) {
                    const response = await axios.post(`${backend}/api/course/addSingleCourse`, {
                        semesterId,
                        userId,
                        courseCode: updatedCourse.courseCode,
                        credit: updatedCourse.credit,
                        cgpa: parseFloat(updatedCourse.cgpa.toFixed(2)),
                    });
                    updatedCourses[courseIndex] = { ...updatedCourse, _id: response.data.savedCourse._id };
                }
            }

            const totalCredits = updatedCourses.reduce((total, course) => total + parseFloat(course.credit || 0), 0);
            const totalGrades = updatedCourses.reduce((total, course) => total + (parseFloat(course.cgpa || 0) * parseFloat(course.credit || 0)), 0);
            const newSGPA = totalGrades / totalCredits || 0;

            await axios.put(`${backend}/api/semester/updateSemester/${semesterId}`, {
                semesterNumber: semesters[editingIndex].semesterNumber,
                sgpa: parseFloat(newSGPA.toFixed(2)),
                courses: updatedCourses,
                totalCredits: totalCredits,
                totalGrades: totalGrades,
            });

            const updatedSemesters = [...semesters];
            updatedSemesters[editingIndex] = {
                ...updatedSemesters[editingIndex],
                sgpa: parseFloat(newSGPA.toFixed(2)),
                courses: updatedCourses,
            };

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

    return (
        <div>
            <h1>Semesters Information</h1>
            <p>Total CGPA: {calculateCGPA().toFixed(2)}</p>

            {semesters.map((semester, index) => (
                <div key={index}>
                    <h3 onClick={() => toggleDropdown(index)}>
                        Semester {index + 1} {dropdowns[index] ? '▲' : '▼'}
                    </h3>

                    {dropdowns[index] && (
                        <div>
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

                            <p>Total SGPA: {semester.sgpa}</p>

                            {editingIndex === index ? (
                                <div>
                                    <button onClick={handleAddCourse}>Add Course</button>
                                    <button onClick={() => handleUpdate(semester._id)}>Update</button>
                                    <button onClick={() => setEditingIndex(null)}>Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => handleEdit(index)}>Edit</button>
                            )}

                            {/* Display Bar Graph for this semester */}
                            <SemesterGraph
                                barChartData={{
                                    labels: semester.courses.map(course => course.courseCode),
                                    datasets: [
                                        {
                                            label: 'CGPA',
                                            data: semester.courses.map(course => course.cgpa),
                                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                        },
                                    ],
                                }}
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Semesters;
