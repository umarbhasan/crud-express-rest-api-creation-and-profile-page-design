-- Create a new database named 'assignment2'
CREATE DATABASE assignment2;

-- Use the newly created database
USE assignment2;

-- Create a table named 'users' to store user information
CREATE TABLE users (
    first_name VARCHAR(255) NOT NULL,            -- First name of the user, cannot be null
    last_name VARCHAR(255) NOT NULL,             -- Last name of the user, cannot be null
    gender ENUM('Male', 'Female') NOT NULL,      -- Gender of the user, must be either 'Male' or 'Female'
    date_of_birth DATE NOT NULL,                 -- Date of birth of the user, cannot be null
    email VARCHAR(255) NOT NULL UNIQUE,          -- Email address of the user, must be unique and cannot be null
    password VARCHAR(255) NOT NULL,              -- Password for user account, cannot be null
    profile_image_url VARCHAR(255)               -- URL to the profile image of the user, can be null
);
