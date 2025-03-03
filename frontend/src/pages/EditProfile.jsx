import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EditProfile({ userId, token }) {
    const navigate = useNavigate();
    // Main state variables
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [rePassword, setRePassword] = useState('');
    const [isValidChange, setIsValidChange] = useState('');
    const [infoChanged, setInfoChanged] = useState([]);

    // Temporary state variables for modals
    const [tempFirstName, setTempFirstName] = useState('');
    const [tempLastName, setTempLastName] = useState('');
    const [passwordModalOpened, setPasswordModalOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);

    // New state variables for password validation
    const [currentPasswordError, setCurrentPasswordError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [matchError, setMatchError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [deleteMessage, setDeleteMessage] = useState('');

     // Fetch user information on mount
     useEffect(() => {
        const fetchUserDetails = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`https://personalized-learning-dashboard.onrender.com/user?userId=${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setFirstName(data.firstname || '');
                    setLastName(data.lastname || '');
                    setTempFirstName(data.firstname || '');
                    setTempLastName(data.lastname || '');
                } else {
                    console.error('Failed to fetch user data:', await response.json());
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserDetails();
    }, [userId]);

    useEffect(() => {
        const isNameChanged = tempFirstName !== firstName || tempLastName !== lastName;
        setIsValidChange(isNameChanged);
    }, [tempFirstName, tempLastName, firstName, lastName]);

    const passwordValidator = () => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError(
                '*Your password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character'
            );
            return false;
        } else {
            setPasswordError('');
            return true;
        }
    };

    const passwordMatchValidator = () => {
        if (newPassword !== rePassword) {
            setMatchError('*Passwords do not match');
            return false;
        } else {
            setMatchError('');
            return true;
        }
    };

    const handlePasswordChange = async () => {
        const isPasswordValid = passwordValidator();
        const isMatching = passwordMatchValidator();
        setCurrentPasswordError('');
        if (isPasswordValid && isMatching && password && newPassword) {
            try {
                const requestData = {
                    currentPassword: password,
                    newPassword: newPassword,
                };
                const response = await fetch(`https://personalized-learning-dashboard.onrender.com/user/${userId}/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestData),
                });

                const data = await response.json();

                if (response.ok) {
                    setSuccessMessage('Password successfully updated!');
                    setTimeout(() => {
                        setSuccessMessage('');
                        setPasswordModalOpened(false);
                        setPassword('');
                        setNewPassword('');
                        setRePassword('');
                    }, 2000);
                } else {
                    setNewPassword('');
                    setRePassword('');
                    if (data.sameMessage) {
                        setPasswordError(data.sameMessage);
                    } else {
                        setCurrentPasswordError(data.message);
                    }
                }
            } catch (error) {
                console.error('Error updating password:', error);
                setCurrentPasswordError('An error occurred while updating password.');
            }
        }
    };

    const handleNameChange = async (infoName, newValue) => {
        const isNameChanged = infoName === 'firstname' ? newValue.trim() !== firstName : newValue.trim() !== lastName;
        if (newValue && isNameChanged) {
            try {
                const requestData = {
                    info: newValue
                };
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userID');
                const response = await fetch(`https://personalized-learning-dashboard.onrender.com/user/${userId}?infoName=${infoName}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestData),
                });

                const data = await response.json();
                if (response.ok) {
                    if (infoName === 'firstname') {
                        setFirstName(newValue);
                    } else if (infoName === 'lastname') {
                        setLastName(newValue);
                    }
                } else {
                    console.log(data);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        const requestData = {
            userId: userId,
        };
        try {
            const response = await fetch(`https://personalized-learning-dashboard.onrender.com/user`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                localStorage.removeItem("token");
                localStorage.removeItem("userID");
                setDeleteMessage('Your account has been deleted successfully!');
                setTimeout(() => {
                    setDeleteModalOpened(false);
                    navigate('/login');
                }, 2000);
            } else {
                const data = await response.json();
                console.error(data.message);
            }
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    // Modal for changing password
    const passwordChangeModal = (
        <div className="password_modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-[90vw] md:w-1/4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-800">
                    Current Password:
                </label>
                <input
                    type="password"
                    id="current_password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="mt-1 w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {currentPasswordError && <p className="mt-1 error_message text-red-700 text-[10px]">{currentPasswordError}</p>}
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-800 mt-4">
                    New Password:
                </label>
                <input
                    type="password"
                    id="new_password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="mt-1 w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {passwordError && <p className="mt-1 error_message text-red-700 text-[10px]">{passwordError}</p>}
                <label htmlFor="re_new_password" className="block text-sm font-medium text-gray-800 mt-4">
                    Confirm New Password:
                </label>                
                <input
                    type="password"
                    id="re_new_password"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="mt-1 w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                {matchError && <p className="mt-1 error_message text-red-700 text-[10px]">{matchError}</p>}
                {successMessage && (
                    <p className="text-center bg-gray-100 text-gray-700 mt-4 py-2 px-4 rounded-lg">
                        {successMessage}
                    </p>
                )}
                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => {setPasswordModalOpened(false); setCurrentPasswordError(""); setMatchError(""); setPasswordError(""); setPassword(""); setNewPassword(""); setRePassword("")}}
                        className="bg-gray-600 text-white text-sm md:text-base px-2 py-1 md:px-4 md:py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2">
                        Cancel
                    </button>
                    <button
                        data-testid="save-password"
                        onClick={handlePasswordChange}
                        className="bg-gray-600 text-white text-sm md:text-base px-2 py-1 md:px-4 md:py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );

    // Modal for deleting the profile
    const deleteProfileModal = (
        <div className="delete_modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-[90vw] md:w-1/4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Profile</h3>
                <p className="text-sm font-semibold text-gray-700 mb-4">Are you sure you want to delete your profile? This action cannot be undone.</p>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={() => setDeleteModalOpened(false)}
                        className="bg-gray-600 text-white text-sm md:text-base px-2 py-1 md:px-4 md:py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2">
                        Cancel
                    </button>
                    <button
                        data-testid="delete-profile"
                        onClick={handleDelete}
                        className="bg-gray-600 text-white text-sm md:text-base px-2 py-1 md:px-4 md:py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                        Delete
                    </button>
                </div>
                {deleteMessage && (
                    <p className="text-center bg-gray-100 text-gray-700 mt-4 py-2 px-4 rounded-lg">
                        {deleteMessage}
                    </p>
                )}  
            </div>
        </div>
    );

    return (
        <div className="flex-1 p-4 bg-gray-100 w-screen md:w-full overflow-x-hidden">
            <div className="grid grid-cols-1 gap-4 mb-4 text-center md:text-left">
                <div>
                    <label htmlFor="first_name" className="md:block text-sm font-medium text-gray-800 mr-1 mb-1 md:mb-0">
                        First Name:
                    </label>
                    <input
                        type="text"
                        id="first_name"
                        value={tempFirstName}
                        onChange={(e) => {
                            const updatedFirstName = e.target.value.replace(/\s+/g, ' ');
                            setTempFirstName(updatedFirstName);
                            setInfoChanged(['firstname', updatedFirstName]);
                        }}
                        placeholder="Enter your first name"
                        className="mt-1 w-1/4 px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                </div>
                <div>
                    <label htmlFor="last_name" className="md:block text-sm font-medium text-gray-800 mr-1 mb-1 md:mb-0">
                        Last Name:
                    </label>
                    <input
                        type="text"
                        id="last_name"
                        value={tempLastName}
                        onChange={(e) => {
                            const updatedLastName = e.target.value.replace(/\s+/g, ' ');
                            setTempLastName(updatedLastName);
                            setInfoChanged(['lastname', updatedLastName]);
                        }}
                        placeholder="Enter your last name"
                        className="mt-1 w-1/4 px-2 py-1 md:px-3 md:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center md:justify-start items-center gap-2 sm:gap-4">
                <button
                    data-testid="name-save"
                    onClick={() => {
                        setIsValidChange(false);
                        handleNameChange(infoChanged[0], infoChanged[1]);
                    }}
                    disabled={!isValidChange} 
                    className={`w-32 md:w-auto px-3 py-1 md:px-4 md:py-2 rounded-md text-xs md:text-base focus:outline-none focus:ring-2 ${isValidChange ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-300 text-gray-500 cursor-default'}`}
                >
                    Save
                </button>
                <button
                    onClick={() => setPasswordModalOpened(true)}
                    className="w-32 md:w-auto px-3 py-1 md:px-4 md:py-2 bg-gray-600 text-xs md:text-base text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                    Update Password
                </button>
                <button
                    onClick={() => setDeleteModalOpened(true)}
                    className="w-32 md:w-auto px-3 py-1 md:px-4 md:py-2 bg-gray-600 text-xs md:text-base text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
                    Delete Profile
                </button>
            </div>
            {passwordModalOpened && passwordChangeModal}
            {deleteModalOpened && deleteProfileModal}
        </div>
    );
}    

export default EditProfile;
