# 🔐 SecureCloud - Project Report Documentation

This document contains all the major system diagrams and flow explanations required for the SecureCloud project report. You can use tools like Mermaid Live Editor (https://mermaid.live/) or modern Markdown viewers that support MermaidJS to render and export these diagrams as images for your report.

---

## 🏗️ 1. System Architecture Diagram

The SecureCloud architecture follows a typical MERN stack with specialized services for authentication, AES file encryption, and admin monitoring.

```mermaid
graph TD
    %% Entities
    User((User))
    Admin((Admin))
    
    %% Frontend
    subgraph Frontend [React Application - Client]
        UI[User Interface]
        AuthUI[Auth & OTP Pages]
        Dash[User Dashboard]
        AdminDash[Admin Dashboard]
    end

    %% Backend Server
    subgraph Backend [Node.js + Express API - Server]
        API[API Gateway / Router]
        
        AuthLogic[Auth Controller \n JWT & OTP]
        FileLogic[File Controller \n Multer & Crypto]
        AdminLogic[Admin Controller \n Monitoring]
        
        Middleware[Security Middleware \n Helmet, XSS, RateLimit]
    end

    %% Database
    subgraph Database [MongoDB]
        DB[(MongoDB)]
    end
    
    %% Storage
    subgraph Storage [Local File System]
        LocalUploads[Encrypted /uploads Directory]
    end

    %% Relationships
    User -->|Validates via| AuthUI
    User -->|Upload/Download| Dash
    Admin -->|Monitor Users/Logs| AdminDash

    UI -->|REST HTTP requests| Middleware
    Middleware --> API
    
    API --> AuthLogic
    API --> FileLogic
    API --> AdminLogic

    AuthLogic -->|Read/Write Users| DB
    AdminLogic -->|Read Logs & Users| DB
    FileLogic -->|Store Metadata| DB
    
    FileLogic -->|AES-256-CBC Encrypted Blob| LocalUploads
```

---

## 🌊 2. Data Flow Diagram (DFD)

### Level 0 DFD (Context Diagram)
This diagram shows the high-level interactions between external entities (User/Admin) and the entire SecureCloud System.

```mermaid
graph TD
    User((User)) -->|Credentials, OTP, Files| System[SecureCloud System]
    System -->|JWT Token, Decrypted Files| User
    
    Admin((Admin)) -->|Admin Requests| System
    System -->|System Logs, User Lists| Admin
```

### Level 1 DFD (Process Level)
This breaks down the System into its core sub-processes.

```mermaid
graph TD
    User((User))
    Admin((Admin))
    
    P1((1.0 Handle \nAuthentication))
    P2((2.0 Handle \nFile Upload/Encryption))
    P3((3.0 Manage \nActivity Logs))
    
    DB[(MongoDB)]
    Disk[(Encrypted Storage)]

    %% Auth Flow
    User -->|Login Data| P1
    P1 -->|JWT/OTP Response| User
    P1 -->|Verify/Update User| DB
    
    %% File Flow
    User -->|Upload File| P2
    P2 -->|Save Encrypted File| Disk
    P2 -->|Save Metadata| DB
    P2 -->|Log Upload Action| P3
    
    User -->|Request Download| P2
    Disk -->|Read Encrypted File| P2
    P2 -->|Decrypt & Send File| User
    
    %% Admin Flow
    Admin -->|Request Data| P3
    P3 -->|Query Logs/Users| DB
    P3 -->|Return Report| Admin
```

---

## 🗄️ 3. Entity-Relationship (ER) Diagram

This diagram maps out our MongoDB Models: `User`, `File`, and `ActivityLog`.

```mermaid
erDiagram
    USER ||--o{ ACTIVITY_LOG : "generates"
    USER ||--o{ FILE : "owns"
    
    USER {
        ObjectId _id PK
        String name
        String email "UNIQUE"
        String password "Hashed (bcrypt)"
        String role "user/admin"
        Number failedLoginAttempts
        String lastLoginIP
        String otp
        Date otpExpire
        Date createdAt
    }
    
    FILE {
        ObjectId _id PK
        String originalName
        String filename "Encrypted Name"
        String path "Server Path"
        String mimetype
        Number size
        ObjectId owner FK "Ref: USER._id"
        Date createdAt
    }
    
    ACTIVITY_LOG {
        ObjectId _id PK
        ObjectId userId FK "Ref: USER._id"
        String action "Upload/Login/Logout"
        String ipAddress
        Date timestamp
    }
```

---

## 🛡️ 4. Security Flow (Authentication & 2FA Sequence)

This sequence diagram explains the exact chronological steps of your backend security highlights (bcrypt password comparison, OTP delivery, and JWT verification).

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend
    participant Server as Node API
    participant DB as MongoDB
    
    %% Step 1: Login
    User->>Frontend: Enters Email & Password
    Frontend->>Server: POST /api/auth/login
    
    Server->>DB: Find User by Email
    DB-->>Server: Return User Details + Hashed Password
    
    %% Step 2: Verification & OTP Generation
    Server->>Server: bcrypt.compare(password, hash)
    Server->>Server: generateOTP() + Set 10m Expiry
    Server->>DB: Save OTP payload to User document
    
    Server-->>Frontend: Success (Trigger 2FA screen)
    Note over Server,User: (In a real app, send OTP via Email/SMS here)
    
    %% Step 3: OTP Verification
    Frontend-->>User: Please enter OTP screen
    User->>Frontend: Types 6-digit OTP
    Frontend->>Server: POST /api/auth/verify-otp (Email, OTP)
    
    Server->>DB: Check if OTP matches & not expired
    DB-->>Server: Valid Match
    
    %% Step 4: Issue Core Token
    Server->>DB: Clear OTP fields (otp=undefined)
    Server->>Server: jsonwebtoken.sign(userId, secret)
    
    Server-->>Frontend: Return JWT Token & User Data
    Frontend->>Frontend: Save JWT in localStorage
    Frontend-->>User: Redirect to User Dashboard
```
