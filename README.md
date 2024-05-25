# CRUD Express REST API and Profile Page

This project consists of two main components: a CRUD (Create, Read, Update, Delete) REST API built using Express.js and a profile page designed with HTML and CSS. The REST API enables users to register, login, update their profile information (such as first name, last name, gender, date of birth, and password), upload a profile image, and delete their account. The profile page provides a user-friendly interface for interacting with the API.

## Getting Started

To get started with this project, follow these steps:

### Prerequisites

- Node.js installed on your machine
- MySQL installed on your machine (or you can use a remote MySQL server)

### Installation

1. Clone the repository to your local machine:

```bash
git clone https://github.com/umarbhasan/crud-express-rest-api-creation-and-profile-page-design.git
```

2. Navigate to the project directory:

```bash
cd crud-express-rest-api-creation-and-profile-page-design
```

3. Install dependencies:

```bash
npm install
```

4. Set up the MySQL database:

- Create a new MySQL database (e.g., `assignment2`).
- Update the MySQL connection details in `index.js` to match your database configuration.

5. Start the server:

```bash
npm start
```

6. Access the application in your web browser:

- The profile page can be accessed at `http://localhost:3000`.
- The API endpoints are available at `http://localhost:3000/api`.

## Features

### REST API Endpoints

- **POST /api/register**: Register a new user.
- **POST /api/login**: Login with email and password.
- **GET /api/profile**: Get user profile information.
- **PUT /api/profile**: Update user profile information.
- **DELETE /api/profile**: Delete user account.
- **POST /api/profile/image**: Upload a new profile image.
- **PUT /api/profile/password**: Update user password.

### Profile Page

- View and update profile information.
- Upload a profile image.
- Change password.
- Delete account.

## Technologies Used

- **Express.js**: Web framework for building the REST API.
- **MySQL**: Database management system for storing user data.
- **bcrypt**: Library for hashing passwords securely.
- **jsonwebtoken**: Library for handling JSON Web Tokens (JWT) for authentication.
- **Multer**: Middleware for handling file uploads.
- **HTML/CSS**: Frontend technologies for designing the profile page.

## License

This project is licensed under the GPLv3 License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- This project was inspired by the need for a simple CRUD REST API with user authentication and a profile page.
- Special thanks to [OpenAI](https://openai.com) for providing the AI assistant that helped create this documentation.
