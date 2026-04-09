# MotoCare Service Tracker - Test Plan

## Covered test cases

### Authentication - UI

1. Register with valid credentials succeeds.
2. Register with duplicate credentials is rejected.
3. Register with missing required fields is rejected.
4. Register with invalid email is rejected.
5. Register with invalid password is rejected.
6. Login with valid credentials succeeds.
7. Login with invalid credentials is rejected.
8. Login with missing required fields is rejected.
9. Session / authenticated access behavior is covered.
10. Protected session behavior for unauthenticated users is covered.

### Bikes - UI

1. Empty bikes state is shown when no bikes exist.
2. Add bike with valid data succeeds.
3. Add bike with missing required fields is rejected.
4. Add bike with invalid field values is rejected.
5. Edit bike with valid data succeeds.
6. Edit bike with invalid field values is rejected.
7. Delete bike succeeds.
8. Bike list updates correctly after create, edit, and delete actions.

### Jobs - UI

1. Empty jobs state is shown when no jobs exist.
2. Add job with valid data succeeds.
3. Add job with missing required fields is rejected.
4. Add job with invalid field values is rejected.
5. Edit job with valid data succeeds.
6. Edit job with invalid field values is rejected.
7. Delete job succeeds.
8. Job list updates correctly after create, edit, and delete actions.
9. Jobs remain associated with the correct bike.
10. Status / workflow-related job behavior is covered.

### Session - UI

1. Logged-in session persistence is covered.
2. Logout behavior is covered.
3. Protected routes / screens require authentication.
4. Session state updates correctly after auth actions.

### Authentication - API

1. Register with valid credentials returns success.
2. Register with duplicate credentials is rejected.
3. Register with invalid payload is rejected.
4. Login with valid credentials returns success.
5. Login with invalid credentials is rejected.
6. Login with missing required fields is rejected.
7. Auth response handling is covered.

### Bikes - API

1. Create bike with valid payload succeeds.
2. Create bike with invalid payload is rejected.
3. Read bikes succeeds.
4. Update bike with valid payload succeeds.
5. Update bike with invalid payload is rejected.
6. Delete bike succeeds.
7. Bike ownership / access behavior is covered.

### Jobs - API

1. Create job with valid payload succeeds.
2. Create job with invalid payload is rejected.
3. Read jobs succeeds.
4. Update job with valid payload succeeds.
5. Update job with invalid payload is rejected.
6. Delete job succeeds.
7. Job ownership / access behavior is covered.
8. Job-to-bike association behavior is covered.
