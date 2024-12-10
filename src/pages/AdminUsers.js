import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backend } from '../data';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState(null);
  const [sortType, setSortType] = useState('name'); // 'name' or 'cgpa'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSemesters, setActiveSemesters] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${backend}/api/admin/users`);
      const usersWithSemesters = response.data.filter(user => user.semesters && user.semesters.length > 0);
      setUsers(usersWithSemesters);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const calculateCGPA = (semesters) => {
    const totalCredits = semesters.reduce((total, semester) =>
      total + semester.courses.reduce((sum, course) => sum + parseFloat(course.credit || 0), 0), 0
    );

    const totalGrades = semesters.reduce((total, semester) =>
      total + semester.courses.reduce((sum, course) => 
        sum + (parseFloat(course.cgpa || 0) * parseFloat(course.credit || 0)), 0), 0
    );

    return totalCredits > 0 ? (totalGrades / totalCredits).toFixed(2) : '0.00';
  };

  const toggleSort = (type) => {
    if (sortType === type) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(type);
      setSortDirection('asc');
    }
  };

  const toggleSemester = (userId, semIndex) => {
    setActiveSemesters(prev => ({
      ...prev,
      [`${userId}-${semIndex}`]: !prev[`${userId}-${semIndex}`]
    }));
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortType === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      const cgpaA = parseFloat(calculateCGPA(a.semesters));
      const cgpaB = parseFloat(calculateCGPA(b.semesters));
      return sortDirection === 'asc' ? cgpaB - cgpaA : cgpaA - cgpaB;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(1,8,21)] text-white flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(1,8,21)] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="bg-white/5 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-lg md:text-xl font-bold">Active Users: {users.length}</h2>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-sm md:text-base"
              >
                Sort by {sortType === 'name' ? 'Name' : 'CGPA'} <ChevronDown size={14} className="md:w-4 md:h-4" />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-[rgb(1,8,21)] border border-white/10 rounded-lg shadow-lg overflow-hidden z-10"
                    >
                      <button
                        onClick={() => {
                          toggleSort('name');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                          sortType === 'name' ? 'bg-blue-500' : ''
                        }`}
                      >
                        Sort by Name
                      </button>
                      <button
                        onClick={() => {
                          toggleSort('cgpa');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                          sortType === 'cgpa' ? 'bg-blue-500' : ''
                        }`}
                      >
                        Sort by CGPA
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {sortedUsers.map((user) => (
            <div key={user._id} className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-lg">
              <button
                onClick={() => setActiveUser(activeUser === user._id ? null : user._id)}
                className="w-full"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-base md:text-xl font-bold text-blue-400 text-left">{user.name}</h3>
                    <p className="text-xs md:text-sm text-gray-400">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-xl md:text-2xl font-bold text-yellow-400">{calculateCGPA(user.semesters)}</p>
                      <p className="text-xs md:text-sm text-gray-400">CGPA</p>
                    </div>
                    {activeUser === user._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {activeUser === user._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6 space-y-4"
                  >
                    {user.semesters.map((semester, semIndex) => (
                      <div key={semIndex} className="bg-white/5 p-4 rounded-lg">
                        <button
                          onClick={() => toggleSemester(user._id, semIndex)}
                          className="w-full"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm md:font-medium">Semester {semIndex + 1}</h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm md:text-base text-yellow-400 font-bold">SGPA: {semester.sgpa}</span>
                              {activeSemesters[`${user._id}-${semIndex}`] ? 
                                <ChevronUp size={16} /> : 
                                <ChevronDown size={16} />
                              }
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {activeSemesters[`${user._id}-${semIndex}`] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-2 mt-4"
                            >
                              {semester.courses.map((course, courseIndex) => (
                                <div 
                                  key={courseIndex}
                                  className="bg-white/5 p-3 rounded flex justify-between items-center"
                                >
                                  <span className="text-sm md:text-base font-medium text-blue-300">
                                    {course.courseCode}
                                  </span>
                                  <div className="flex space-x-3 md:space-x-6 text-sm md:text-base">
                                    <span>CGPA: {course.cgpa}</span>
                                    <span>Credits: {course.credit}</span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;