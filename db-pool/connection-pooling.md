# Connection Pooling

## What is a database connection?

A database connection is a live communication channel between an application server and a database.

Creating a connection can involve TCP/TLS setup, authentication, and database session initialization, so creating and destroying one for every request is expensive.

```text
HTTP Request
     |
     v
Application
     |
     | open connection
     v
 Database
     |
     | query
     v
Application
     |
     | close connection
     v
```

## What is connection pooling?

A connection pool keeps a set of already-open database connections and reuses them.

```text
                 Application Server
                 +----------------+
Request A ------>|                |
Request B ------>| Connection     |
Request C ------>| Pool           |
                 | [C1] [C2] [C3] |
                 | [C4] [C5]      |
                 +---|---|---|----+
                     |   |   |
                     v   v   v
                 +----------------+
                 |    Database    |
                 +----------------+
```

The request **borrows** a connection, uses it, and **returns** it to the pool. Returning it normally does not destroy the underlying connection.

## Request lifecycle

```text
Request
   |
   v
Connection Pool
   |
   | acquire
   v
C1 -> BUSY
   |
   | execute query
   v
Database
   |
   | result
   v
C1 -> IDLE
   |
   | release
   v
Pool
```

Another request can now reuse C1:

```text
Request A --> C1 --> query --> release C1
Request B --> C1 --> query --> release C1
Request C --> C1 --> query --> release C1
```

## Why do we need pooling?

Without pooling, 1,000 requests could potentially create 1,000 database connections:

```text
1000 Requests
      |
      v
1000 DB Connections
      |
      v
   DATABASE
```

A pool limits this:

```text
1000 Requests
      |
      v
+----------------+
| Connection Pool|
|    max = 10    |
+----------------+
      |
      v
10 DB Connections
      |
      v
   DATABASE
```

If all connections are busy, new requests wait for a connection to become available.

```text
C1 -> BUSY
C2 -> BUSY
C3 -> BUSY

Request D -> WAIT
Request E -> WAIT
```

So a pool also provides a form of **concurrency control/backpressure**.

## Pool size is per application instance

This is one of the most important production concepts.

If you have 10 backend servers and each has a pool of 10:

```text
Server 1  -> Pool(10)
Server 2  -> Pool(10)
Server 3  -> Pool(10)
...
Server 10 -> Pool(10)
```

Potential maximum:

```text
10 servers × 10 connections = 100 DB connections
```

Therefore, when horizontally scaling, always consider the total number of connections across **all application instances**.

## Pool vs connection

```text
Connection Pool
       |
       +---- Connection 1
       +---- Connection 2
       +---- Connection 3
       +---- Connection 4
       +---- Connection 5
```

- **Connection** = one actual communication channel/session with the database.
- **Pool** = manager of multiple reusable connections.

Think of it like a taxi stand:

```text
Taxi stand = Connection Pool
Taxi       = Connection
Passenger  = Database request
```

The passenger uses an existing taxi and returns it instead of creating a new taxi for every trip.

## Connection pooling in Node.js

A database driver or ORM generally manages the pool.

Example using PostgreSQL's `pg` driver:

```ts
import { Pool } from "pg";

const pool = new Pool({
  max: 10,
});

const result = await pool.query(
  "SELECT * FROM users WHERE id = $1",
  [userId]
);
```

Conceptually:

```text
Node.js Process
      |
      v
Connection Pool
  |  |  |  |  |
 C1 C2 C3 C4 C5
      |
      v
 PostgreSQL
```

## Prisma

Prisma also manages database connections through its query engine.

Conceptually:

```text
Node.js Application
        |
        v
   Prisma Client
        |
        v
 Connection Pool
  |  |  |  |  |
 C1 C2 C3 C4 C5
        |
        v
   PostgreSQL
```

When you write:

```ts
const users = await prisma.user.findMany();
```

you normally do not manually open a TCP connection for that query. Prisma manages the database connection lifecycle.

## Pool exhaustion

A connection should not be held longer than necessary.

Bad pattern:

```ts
const client = await pool.connect();

await client.query("SELECT ...");

await doSomethingVerySlow();

client.release();
```

If many requests do this:

```text
C1 -> BUSY
C2 -> BUSY
C3 -> BUSY
...

No connections available
        |
        v
Requests wait
        |
        v
Latency increases
        |
        v
Timeouts / cascading failure
```

A good rule is:

> Acquire a connection as late as practical and release it as soon as the database work is finished.

## Transactions

Transactions normally need to stay on the same connection because transaction state belongs to the database session.

```ts
const client = await pool.connect();

try {
  await client.query("BEGIN");
  await client.query("UPDATE accounts ...");
  await client.query("INSERT INTO transactions ...");
  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
}
```

Conceptually:

```text
Same Connection (C1)
        |
       BEGIN
        |
     UPDATE
        |
      INSERT
        |
      COMMIT
        |
      RELEASE
```

You don't want different connections for different steps of the same transaction.

## The mental model

```text
                 MANY REQUESTS
              /      |       \
             /       |        \
            v        v         v
       +---------------------------+
       |       APPLICATION         |
       |                           |
       |     CONNECTION POOL       |
       |                           |
       |  C1  C2  C3  C4  C5 ...  |
       +-------------+-------------+
                     |
                     v
                +---------+
                | DATABASE|
                +---------+
```

Remember:

1. **Connection** = one communication channel/session with the DB.
2. **Pool** = manager of reusable connections.
3. **Acquire** = borrow a connection.
4. **Release** = return it to the pool, usually without destroying it.
5. **Pool size** = per application instance.
6. **Total possible connections** = application instances × pool max.

### Interview answer

> Connection pooling is a mechanism where an application maintains a pool of reusable database connections instead of opening and closing a new connection for every request. A request borrows an available connection, executes its database work, and releases the connection back to the pool. This reduces connection-establishment overhead and limits concurrent database connections. In a horizontally scaled system, the pool is generally per application instance, so total database connections must be considered across all instances.
