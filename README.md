# Todo List Application - Backend Implementation

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Additional Libraries**:
  - cors: For handling Cross-Origin Resource Sharing
  - json2csv: For exporting data to CSV format
  - nodemon: For development environment (auto-reload)

## Setup and Running the Application

1. **Prerequisites**:
   - Node.js installed
   - MongoDB installed and running
   - npm or yarn package manager

2. **Installation**:
   ```bash
   # Install dependencies
   npm install
   ```

3. **Running the Application**:
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

4. **Environment Setup**:
   - The application runs on port 5000 by default
   - MongoDB connection is handled through the config/db.js file

## Design Decisions and Assumptions

1. **API Structure**:
   - RESTful API design following standard conventions
   - Separation of concerns with routes, controllers, and models
   - Error handling middleware for consistent error responses

2. **Data Model**:
   - User and Todo entities with appropriate relationships
   - Support for notes on todos
   - Tag system for todo categorization

3. **Security**:
   - CORS enabled for cross-origin requests
   - JSON parsing middleware for request body handling

## API Documentation

### User Endpoints

1. **GET /api/users**
   - Get all users
   - This will be used for user switching in the frontend
   - Response includes user ID, name, and email

### Todo Endpoints

1. **GET /api/todos**
   - Get all todos for the current user
   - Query Parameters:
     - `user`: Filter by user ID
     - `tag`: Filter by tag
     - `status`: Filter by completion status
     - `page`: Page number for pagination
     - `limit`: Number of items per page
     - `sort`: Sort field (createdAt, updatedAt, title)
     - `order`: Sort order (asc, desc)

2. **GET /api/todos/:id**
   - Get a specific todo by ID
   - Return detailed information including tags, notes, and assigned users
   - Parameters:
     - `id`: Todo ID

3. **POST /api/todos**
   - Create a new todo
   - Required fields:
     - `title`: Todo title
     - `user`: User ID
   - Optional fields:
     - `description`: Todo description
     - `tags`: Array of tag names
     - `priority`: Priority level

4. **PUT /api/todos/:id**
   - Update an existing todo
   - Support partial updates
   - Parameters:
     - `id`: Todo ID
   - Request body can include any todo fields

5. **DELETE /api/todos/:id**
   - Delete a todo
   - Parameters:
     - `id`: Todo ID

### Note Endpoints

1. **POST /api/todos/:id/notes**
   - Add a note to a specific todo
   - Parameters:
     - `id`: Todo ID
   - Required fields:
     - `content`: Note content
     - `user`: User ID

### Export Endpoint

1. **GET /api/todos/export**
   - Export all todos for the current user
   - Query Parameters:
     - `format`: Export format (json, csv)
     - `user`: User ID to filter by
     - `tag`: Tag to filter by
     - `status`: Status to filter by

## Additional Features

1. **CSV Export**:
   - Ability to export todos to CSV format
   - Useful for data backup and analysis

2. **Tag System**:
   - Categorization of todos using tags
   - Easy filtering and organization

3. **Notes**:
   - Support for adding notes to todos
   - Enhanced todo management capabilities

## Implementation Requirements

1. **User Management**
   - Pre-created users in database:
     - John Doe (john@example.com)
     - Jane Smith (jane@example.com)
     - Bob Wilson (bob@example.com)
     - Alice Brown (alice@example.com)
     - Charlie Davis (charlie@example.com)
   - User switching via query parameter: `?user=<user_id>`

2. **Input Validation**
   - Required field validation for todos and notes
   - Date format validation for due dates
   - Tag format validation
   - User existence validation

3. **Error Handling**
   - Standard error response format:
   - Common error codes:
     - 400: Bad Request
     - 404: Not Found
     - 500: Internal Server Error

