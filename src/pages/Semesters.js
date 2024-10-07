import React from 'react';
import { useLocation } from 'react-router-dom';

const Semesters = () => {
    const location = useLocation();
    
    // Access the state passed during navigation
    const { semesters } = location.state || {};

    // Check if semesters were passed
    if (!semesters || semesters.length === 0) {
        return <div>No semester data available.</div>;
    }

    return (
        <div>
            <h1>Semesters Information</h1>

            {semesters.map((semester, index) => (
                <div key={index} >
                    <h3>Semester {index + 1}</h3>

                    <table >
                        <thead>
                            <tr>
                                <th>Course Code</th>
                                <th>CGPA</th>
                                <th>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {semester.courses.map((course, courseIndex) => (
                                <tr key={courseIndex}>
                                    <td>{course.courseCode}</td>
                                    <td>{course.cgpa}</td>
                                    <td>{course.credit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div>
                        <p>Total SGPA: {semester.sgpa}</p>
                        <p>Total CGPA: {semester.cgpa}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Semesters;
