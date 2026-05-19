# 🛰️ GigFlow Dashboard — API Endpoint Documentation

Welcome to the official API reference for **GigFlow**. All API endpoints are prefixed with `/api` and expect JSON payloads where applicable.

---

## 🔑 Authentication

All protected routes require a JWT bearer token returned on login or registration:

```
Authorization: Bearer <your_jwt_token>
```

---

### 1. `POST /api/auth/register`

**Description**: Creates a new user account. Optionally captures profile metadata (phone, title, company) at registration time. Supports granting Admin role via a secret key.

**Auth Required**: No

**Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "password123",
  "adminSecret": "admin_secret_for_creating_admin_users",
  "phone": "(555) 019-2834",
  "title": "Lead Sales Director",
  "company": "ServiceHive Inc"
}
```

> `adminSecret`, `phone`, `title`, and `company` are all **optional**.  
> Allowed roles: `sales_user` (default) | `admin` (requires valid `adminSecret`).

**Success Response `201 Created`**:
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
      "role": "sales_user",
      "phone": "(555) 019-2834",
      "title": "Lead Sales Director",
      "company": "ServiceHive Inc"
    }
  }
}
```

---

### 2. `POST /api/auth/login`

**Description**: Authenticates user credentials and issues a session token.

**Auth Required**: No

**Request Body**:
```json
{
  "email": "jane.doe@example.com",
  "password": "password123"
}
```

**Success Response `200 OK`**:
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
      "role": "admin",
      "phone": "(555) 019-2834",
      "title": "Lead Sales Director",
      "company": "ServiceHive Inc"
    }
  }
}
```

---

### 3. `GET /api/auth/me`

**Description**: Returns the full profile of the currently authenticated user.

**Auth Required**: Yes

**Success Response `200 OK`**:
```json
{
  "success": true,
  "message": "User retrieved",
  "data": {
    "user": {
      "id": "66487e411b933a388b3941a2",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "admin",
      "phone": "(555) 019-2834",
      "title": "Lead Sales Director",
      "company": "ServiceHive Inc",
      "avatar": null
    }
  }
}
```

---

### 4. `PUT /api/auth/profile`

**Description**: Updates the authenticated user's profile fields. All fields are optional — only provided fields are updated. Supply `password` to change the current password.

**Auth Required**: Yes

**Request Body**:
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "(555) 999-8888",
  "title": "VP of Sales",
  "company": "GigFlow Corp",
  "password": "newSecurePassword123"
}
```

**Success Response `200 OK`**:
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "user": {
      "id": "66487e411b933a388b3941a2",
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "role": "admin",
      "phone": "(555) 999-8888",
      "title": "VP of Sales",
      "company": "GigFlow Corp"
    }
  }
}
```

---

## 💼 Leads Management Pipeline

All lead endpoints are scoped to the authenticated user. Sales reps access only their own leads; admin users can access the full index.

---

### 1. `POST /api/leads`

**Description**: Creates a new lead in the database.

**Auth Required**: Yes

**Request Body**:
```json
{
  "name": "Robert Smith",
  "email": "robert@example.com",
  "status": "new",
  "source": "website",
  "company": "Acme Corporation",
  "value": 45000,
  "phone": "(415) 555-0100",
  "title": "CEO",
  "nextAction": "Schedule Discovery Call"
}
```

| Field | Type | Required | Allowed Values |
|---|---|---|---|
| `name` | string | ✅ | 2–100 characters |
| `email` | string | ✅ | Valid email format |
| `status` | string | No | `new` · `contacted` · `qualified` · `won` · `lost` (default: `new`) |
| `source` | string | ✅ | `website` · `instagram` · `referral` |
| `company` | string | No | Free text |
| `value` | number | No | Positive number |
| `phone` | string | No | Free text |
| `title` | string | No | Free text |
| `nextAction` | string | No | Free text |

**Success Response `201 Created`**:
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
    "company": "Acme Corporation",
    "value": 45000,
    "phone": "(415) 555-0100",
    "title": "CEO",
    "nextAction": "Schedule Discovery Call",
    "userId": "66487e411b933a388b3941a2",
    "createdAt": "2026-05-18T10:28:12.352Z",
    "updatedAt": "2026-05-18T10:28:12.352Z"
  }
}
```

---

### 2. `GET /api/leads`

**Description**: Returns a paginated list of leads with filtering and sorting support.

**Auth Required**: Yes

**Query Parameters**:

| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `10` | Records per page |
| `status` | — | Filter: `new` · `contacted` · `qualified` · `won` · `lost` |
| `source` | — | Filter: `website` · `instagram` · `referral` |
| `search` | — | Substring match on `name` or `email` (debounced 300ms on frontend) |
| `sortBy` | `latest` | Sort order: `latest` or `oldest` |

**Success Response `200 OK`**:
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
      "company": "Acme Corporation",
      "value": 45000,
      "phone": "(415) 555-0100",
      "title": "CEO",
      "nextAction": "Schedule Discovery Call",
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

### 3. `GET /api/leads/:id`

**Description**: Retrieves a single lead by its MongoDB ObjectId.

**Auth Required**: Yes

**Success Response `200 OK`**:
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
    "company": "Acme Corporation",
    "value": 45000,
    "phone": "(415) 555-0100",
    "title": "CEO",
    "nextAction": "Schedule Discovery Call",
    "userId": "66487e411b933a388b3941a2",
    "createdAt": "2026-05-18T10:28:12.352Z",
    "updatedAt": "2026-05-18T10:28:12.352Z"
  }
}
```

---

### 4. `PUT /api/leads/:id`

**Description**: Updates lead fields. All fields are optional — only included fields are patched.

**Auth Required**: Yes

**Request Body**:
```json
{
  "name": "Robert Smith Jr.",
  "email": "robert.jr@example.com",
  "status": "qualified",
  "source": "referral",
  "company": "Acme Corp Ltd",
  "value": 55000,
  "phone": "(415) 555-0199",
  "title": "Board Chairman",
  "nextAction": "Send follow-up contract"
}
```

**Success Response `200 OK`**:
```json
{
  "success": true,
  "message": "Lead updated successfully",
  "data": {
    "_id": "664883491b933a388b3941bc",
    "name": "Robert Smith Jr.",
    "email": "robert.jr@example.com",
    "status": "qualified",
    "source": "referral",
    "company": "Acme Corp Ltd",
    "value": 55000,
    "phone": "(415) 555-0199",
    "title": "Board Chairman",
    "nextAction": "Send follow-up contract",
    "userId": "66487e411b933a388b3941a2",
    "createdAt": "2026-05-18T10:28:12.352Z",
    "updatedAt": "2026-05-18T10:29:45.105Z"
  }
}
```

---

### 5. `DELETE /api/leads/:id`

**Description**: Permanently deletes a lead from the database.

**Auth Required**: Yes

**Success Response `200 OK`**:
```json
{
  "success": true,
  "message": "Lead deleted successfully",
  "data": null
}
```

---

### 6. `GET /api/leads/export/csv`

**Description**: Streams and downloads a formatted CSV of all matching leads.

**Auth Required**: Yes

**Query Parameters**: Same as `GET /api/leads` (`status`, `source`, `search`).

**Success Response `200 OK`**:
- **Headers**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="leads-export-YYYY-MM-DD.csv"`
- **Body**:
  ```csv
  Name,Email,Status,Source,Company,Value,Phone,Title,Created At
  "Robert Smith Jr.","robert.jr@example.com","qualified","referral","Acme Corp Ltd","55000","(415) 555-0199","Board Chairman","2026-05-18"
  ```

---

### 7. `GET /api/leads/stats/dashboard`

**Description**: Returns aggregated KPI statistics grouped by pipeline status for the dashboard stat cards.

**Auth Required**: Yes

**Success Response `200 OK`**:
```json
{
  "success": true,
  "message": "Dashboard stats retrieved",
  "data": {
    "totalLeads": 5,
    "byStatus": [
      { "_id": "new",       "count": 2 },
      { "_id": "contacted", "count": 1 },
      { "_id": "qualified", "count": 1 },
      { "_id": "won",       "count": 1 }
    ]
  }
}
```

---

## 🚫 Standard Error Responses

### `400 Bad Request` — Validation Failed
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email",  "message": "Please provide a valid email" },
    { "field": "source", "message": "Source must be one of: website, instagram, referral" }
  ]
}
```

### `401 Unauthorized` — Missing or Expired Token
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```
*(Or: `"Token expired. Please login again."`)*

### `404 Not Found`
```json
{
  "success": false,
  "message": "Lead not found"
}
```

### `409 Conflict` — Duplicate Resource
```json
{
  "success": false,
  "message": "Email is already registered"
}
```

### `500 Internal Server Error`
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📐 Data Schema Reference

### User Object
| Field | Type | Notes |
|---|---|---|
| `id` | string | MongoDB ObjectId |
| `name` | string | Display name |
| `email` | string | Unique, normalized |
| `role` | string | `sales_user` or `admin` |
| `phone` | string | Optional |
| `title` | string | Job title, optional |
| `company` | string | Company name, optional |
| `avatar` | string \| null | URL or null |

### Lead Object
| Field | Type | Notes |
|---|---|---|
| `_id` | string | MongoDB ObjectId |
| `name` | string | Contact name |
| `email` | string | Contact email |
| `status` | string | `new` · `contacted` · `qualified` · `won` · `lost` |
| `source` | string | `website` · `instagram` · `referral` |
| `company` | string | Optional |
| `value` | number | Deal value in USD, optional |
| `phone` | string | Contact phone, optional |
| `title` | string | Contact job title, optional |
| `nextAction` | string | Scheduled follow-up text, optional |
| `userId` | string | Owner's ObjectId |
| `createdAt` | ISO 8601 | Creation timestamp |
| `updatedAt` | ISO 8601 | Last modification timestamp |
