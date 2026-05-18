# 🛰️ GigFlow Dashboard - API Endpoint Documentation

Welcome to the official API documentation for **GigFlow**. All API endpoints are prefixed with `/api` and expect JSON payloads for request bodies (where applicable).

---

## 🔑 Authentication Pipeline

All authentication requests use standard JWT authentication. Upon successful login or registration, a bearer token is returned which must be attached to the `Authorization` header of all protected requests:

`Authorization: Bearer <your_jwt_token>`

### 1. POST `/api/auth/register`
* **Description**: Creates a new user account. Supports normal sales users or administrative users via an admin secret key.
* **Authentication Required**: No
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "password123",
    "adminSecret": "admin_secret_for_creating_admin_users" 
  }
  ```
  *(Note: `adminSecret` is optional. Provide it only if creating an Administrator account).*
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "66487e411b933a388b3941a2",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "admin"
      }
    }
  }
  ```

---

### 2. POST `/api/auth/login`
* **Description**: Authenticates user credentials and issues a session token.
* **Authentication Required**: No
* **Request Body**:
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "password123"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "66487e411b933a388b3941a2",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "admin"
      }
    }
  }
  ```

---

### 3. GET `/api/auth/me`
* **Description**: Retrieves the profile session and role validation of the currently logged-in user.
* **Authentication Required**: **Yes**
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "User retrieved",
    "data": {
      "user": {
        "id": "66487e411b933a388b3941a2",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "role": "admin"
      }
    }
  }
  ```

---

## 💼 Leads Management Pipeline

These endpoints manage sales leads. All leads are scoped to the authenticated user. Sales representatives have access only to leads they create, while admins can manage the broader index depending on system setup.

### 1. POST `/api/leads`
* **Description**: Creates a new lead in the database.
* **Authentication Required**: **Yes**
* **Request Body**:
  ```json
  {
    "name": "Robert Smith",
    "email": "robert@example.com",
    "status": "new",
    "source": "website"
  }
  ```
  *Allowed status values*: `new`, `contacted`, `qualified`, `lost` (Default: `new`)  
  *Allowed source values*: `website`, `instagram`, `referral` (Required)
* **Success Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Lead created successfully",
    "data": {
      "_id": "664883491b933a388b3941bc",
      "name": "Robert Smith",
      "email": "robert@example.com",
      "status": "new",
      "source": "website",
      "userId": "66487e411b933a388b3941a2",
      "createdAt": "2026-05-18T10:28:12.352Z",
      "updatedAt": "2026-05-18T10:28:12.352Z"
    }
  }
  ```

---

### 2. GET `/api/leads`
* **Description**: Retrieves a paginated list of leads with support for text searching, pipeline status/source filtering, and sorting.
* **Authentication Required**: **Yes**
* **Query Parameters**:
  * `page` (default: `1`): The page number.
  * `limit` (default: `10`): Number of records per page.
  * `status` (optional): Filter by lead status (`new`, `contacted`, `qualified`, `lost`).
  * `source` (optional): Filter by lead source (`website`, `instagram`, `referral`).
  * `search` (optional): Substring text search matching `name` or `email` (debounced by 300ms on frontend).
  * `sortBy` (default: `latest`): Sort order (`latest` or `oldest`).
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Leads retrieved",
    "data": [
      {
        "_id": "664883491b933a388b3941bc",
        "name": "Robert Smith",
        "email": "robert@example.com",
        "status": "new",
        "source": "website",
        "userId": "66487e411b933a388b3941a2",
        "createdAt": "2026-05-18T10:28:12.352Z",
        "updatedAt": "2026-05-18T10:28:12.352Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
  ```

---

### 3. GET `/api/leads/:id`
* **Description**: Retrieves details of a single lead by its unique ObjectId.
* **Authentication Required**: **Yes**
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Lead retrieved",
    "data": {
      "_id": "664883491b933a388b3941bc",
      "name": "Robert Smith",
      "email": "robert@example.com",
      "status": "new",
      "source": "website",
      "userId": "66487e411b933a388b3941a2",
      "createdAt": "2026-05-18T10:28:12.352Z",
      "updatedAt": "2026-05-18T10:28:12.352Z"
    }
  }
  ```

---

### 4. PUT `/api/leads/:id`
* **Description**: Updates lead information and status parameters.
* **Authentication Required**: **Yes**
* **Request Body**:
  ```json
  {
    "name": "Robert Smith Jr.",
    "email": "robert.jr@example.com",
    "status": "qualified",
    "source": "website"
  }
  ```
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Lead updated successfully",
    "data": {
      "_id": "664883491b933a388b3941bc",
      "name": "Robert Smith Jr.",
      "email": "robert.jr@example.com",
      "status": "qualified",
      "source": "website",
      "userId": "66487e411b933a388b3941a2",
      "createdAt": "2026-05-18T10:28:12.352Z",
      "updatedAt": "2026-05-18T10:29:45.105Z"
    }
  }
  ```

---

### 5. DELETE `/api/leads/:id`
* **Description**: Permanently deletes a sales lead.
* **Authentication Required**: **Yes**
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Lead deleted successfully",
    "data": null
  }
  ```

---

### 6. GET `/api/leads/export/csv`
* **Description**: Streams and downloads a formatted CSV sheet of all scoped leads matching current filter criteria.
* **Authentication Required**: **Yes**
* **Query Parameters**: Matches query options (`status`, `source`, `search`).
* **Success Response (`200 OK`)**:
  * **Headers**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="leads-export-YYYY-MM-DD.csv"`
  * **Payload**:
    ```csv
    Name,Email,Status,Source,Created At
    "Robert Smith Jr.","robert.jr@example.com","qualified","website","2026-05-18"
    ```

---

### 7. GET `/api/leads/stats/dashboard`
* **Description**: Retrieves aggregated statistical summaries categorized by status metrics for display inside the dashboard KPI analytics cards.
* **Authentication Required**: **Yes**
* **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Dashboard stats retrieved",
    "data": {
      "totalLeads": 1,
      "byStatus": [
        {
          "_id": "qualified",
          "count": 1
        }
      ]
    }
  }
  ```

---

## 🚫 Standard Error Responses

In case of request or processing failures, all endpoints return standard error structures:

### 1. Request Input Validation Error (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 2. Authentication Error (`401 Unauthorized`)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```
*(Or `"Token expired. Please login again."`)*

### 3. Resource Not Found (`404 Not Found`)
```json
{
  "success": false,
  "message": "Lead not found"
}
```
