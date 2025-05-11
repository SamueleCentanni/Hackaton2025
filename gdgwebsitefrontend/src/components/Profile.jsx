import React from 'react';
import { DropdownButton, Dropdown, ButtonGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router';

function ProfileMenu() {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/profile'); // Navigate to the profile page
    };

    const handleSettingsClick = () => {
        navigate('/settings'); // Navigate to settings page
    };

    const handleLogout = () => {
        // Handle the logout logic here (e.g., clearing user data, tokens)
        navigate('/login'); // Navigate to the login page after logout
    };

    return (
        <DropdownButton
            as={ButtonGroup}
            variant="link"
            id="profile-menu"
            drop="under"
            className="text-white position-relative"
            title={
                <i className="bi bi-person-circle fs-1 text-white" style={{ fontSize: '1.5rem' }} />
            }
            flip // This will automatically flip the dropdown to fit within the viewport
        >
            <Dropdown.Item onClick={handleProfileClick}>View Profile</Dropdown.Item>
            <Dropdown.Item onClick={handleSettingsClick}>Settings</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
        </DropdownButton>
    );
}

export {ProfileMenu};