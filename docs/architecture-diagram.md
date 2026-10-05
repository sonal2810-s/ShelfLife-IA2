# ShelfLife — Architecture Diagram & Data Flow

This document provides visual diagrams detailing the ShelfLife Library Management System architecture, component relationships, and key transactional flows.

## 1. High-Level Multi-Tier Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Edge & Client Tier"]
        Client["React + TypeScript SPA (Admin / Librarian)"]
        CDN["Global Content Delivery Network (Static Assets)"]
    end

    subgraph GatewayLayer["Ingress & Balancing"]
        LB["Application Load Balancer (HTTPS / TLS Termination)"]
    end

    subgraph ServiceLayer["Stateless Compute Tier"]
        API1["Express API Instance 1"]
        API2["Express API Instance 2"]
        APIN["Express API Instance N"]
    end

    subgraph CacheLayer["Fast State & In-Memory"]
        Redis[("Redis Cluster\n- Catalog Cache\n- Invalidation PubSub")]
    end

    subgraph DatabaseLayer["Primary Data Store"]
        MongoRouter["MongoS Query Router"]
        ConfigServer["Config Server (Metadata & Chunk Mappings)"]
        Shard1[("Shard 1\nCampuses 001–125")]
        Shard2[("Shard 2\nCampuses 126–250")]
        Shard3[("Shard 3\nCampuses 251–375")]
        Shard4[("Shard 4\nCampuses 376–500")]
    end

    subgraph WorkerLayer["Asynchronous Processing"]
        Queue[("Message Queue\n(BullMQ / Redis Streams)")]
        Worker1["Background Worker (Overdue Checks)"]
        Worker2["Background Worker (Notification Dispatch)"]
    end

    Client --> CDN
    CDN --> LB
    LB --> API1
    LB --> API2
    LB --> APIN

    API1 --> Redis
    API2 --> Redis
    APIN --> Redis

    API1 --> MongoRouter
    API2 --> MongoRouter
    APIN --> MongoRouter

    MongoRouter --> ConfigServer
    MongoRouter --> Shard1
    MongoRouter --> Shard2
    MongoRouter --> Shard3
    MongoRouter --> Shard4

    API1 --> Queue
    API2 --> Queue
    APIN --> Queue
    Queue --> Worker1
    Queue --> Worker2
```

---

## 2. Issue Book Atomic Transaction & Concurrency Flow

The sequence below illustrates how race conditions are eliminated when issuing the last available copy of a book under concurrent requests:

```mermaid
sequenceDiagram
    autonumber
    actor LibrarianA as Librarian A (Client 1)
    actor LibrarianB as Librarian B (Client 2)
    participant API as Express API Server
    participant DB as MongoDB (Book & BorrowRecord)

    Note over LibrarianA,LibrarianB: Both attempt to issue the single remaining copy (availableCopies: 1)
    LibrarianA->>API: POST /api/borrow { bookId, memberId }
    LibrarianB->>API: POST /api/borrow { bookId, memberId }

    critical Atomic Conditional Execution
        API->>DB: findOneAndUpdate({ _id: bookId, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } })
        Note over DB: Evaluates atomically using document-level write lock
        DB-->>API: Match found! Returns updated Book (availableCopies: 0)
        API->>DB: BorrowRecord.create({ book, member, issueDate, dueDate, status: 'issued' })
        DB-->>API: BorrowRecord created
        API-->>LibrarianA: HTTP 201 Created { success: true, data: BorrowRecord }
    end

    critical Second Request Concurrent Attempt
        API->>DB: findOneAndUpdate({ _id: bookId, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } })
        Note over DB: Condition availableCopies > 0 FAILS (count is now 0)
        DB-->>API: null (No document matched)
        API-->>LibrarianB: HTTP 400 Bad Request { success: false, message: "Book is currently unavailable for borrowing" }
    end
```

---

## 3. Return Book Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Librarian as Librarian
    participant API as Express API Server
    participant DB as MongoDB

    Librarian->>API: POST /api/return/:borrowId
    API->>DB: Find BorrowRecord by ID
    alt Record Not Found
        API-->>Librarian: HTTP 404 { success: false, message: "Borrow record not found" }
    else Already Returned (status === 'returned')
        API-->>Librarian: HTTP 400 { success: false, message: "Book has already been returned" }
    else Active Loan (status === 'issued' or 'overdue')
        API->>DB: Update BorrowRecord: returnDate = now, status = 'returned'
        API->>DB: Update Book: $inc: { availableCopies: +1 }
        API-->>Librarian: HTTP 200 { success: true, message: "Book returned successfully", data: updatedRecord }
    end
```
