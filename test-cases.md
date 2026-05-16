# Test Cases

---
## Test Case 1

## Scenario A: Basic Mixed Workload (Normal Case)

### Purpose
This scenario tests a normal workload with multiple processes having different arrival times, burst times, and priorities.
It verifies that both algorithms work correctly under standard conditions.

## Preconditions:

Simulator is opened successfully.
User is on scheduling page.

## Steps:

Select Priority Scheduling.
Enter process data for P1, P2, P3, and P4.
Click Run Simulation

### Input

| PID | Arrival Time | Burst Time | Priority |
|-----|-------------|------------|----------|
| P1  | 0           | 6          | 2        |
| P2  | 1           | 4          | 1        |
| P3  | 2           | 2          | 3        |
| P4  | 3           | 5          | 2        |

---

### Expected Behavior

#### Priority Scheduling
- P1 starts first at time 0.
- When P2 arrives, it has higher priority (1), so it preempts P1.
- Remaining processes are executed based on priority order.

#### SRTF Scheduling
- The algorithm always chooses the shortest remaining burst time.
- New shorter processes may preempt currently running processes.

---

### Expected Output

#### Priority Scheduling Gantt Chart
P1 | P2 | P1 | P4 | P3

#### Priority Scheduling — Per-Process Metrics

| PID | Arrival | Burst | Priority | Finish | WT    | TAT   | RT   |
|-----|---------|-------|----------|--------|-------|-------|------|
| P1  | 0       | 6     | 2        | 10     | 4     | 10    | 0    |
| P2  | 1       | 4     | 1        | 5      | 0     | 4     | 0    |
| P3  | 2       | 2     | 3        | 17     | 13    | 15    | 13   |
| P4  | 3       | 5     | 2        | 15     | 7     | 12    | 7    |
| **Average** | | | |        | **6.00** | **10.25** | **5.00** |

---

#### SRTF Scheduling Gantt Chart
P1 | P2 | P3 | P2 | P1 | P4

#### SRTF Scheduling — Per-Process Metrics

| PID | Arrival | Burst | Finish | WT    | TAT   | RT   |
|-----|---------|-------|--------|-------|-------|------|
| P1  | 0       | 6     | 12     | 6     | 12    | 0    |
| P2  | 1       | 4     | 7      | 2     | 6     | 0    |
| P3  | 2       | 2     | 4      | 0     | 2     | 0    |
| P4  | 3       | 5     | 17     | 9     | 14    | 9    |
| **Average** | | |        | **4.25** | **8.50** | **2.25** |

## Actual Result:
Output matched expected result.

Status: Pass

------------------------------------------------------------------------------------------------------------


## Test Case 2

## Scenario B: Conflict Between Priority and Burst Time

### Purpose
This scenario creates a conflict between process priority and burst time.
It demonstrates the behavioral difference between Priority Scheduling and SRTF.

## Preconditions:

Simulator is opened successfully.
User is on scheduling page.

## Steps:

Select Priority Scheduling.
Enter process data for P1, P2, P3, and P4.
Click Run Simulation

### Input

| PID | Arrival Time | Burst Time | Priority |
|-----|-------------|------------|----------|
| P1  | 0           | 10         | 1        |
| P2  | 1           | 2          | 4        |
| P3  | 2           | 3          | 3        |
| P4  | 3           | 1          | 2        |

---

### Expected Behavior

#### Priority Scheduling
- P1 has highest priority, so it keeps CPU despite long burst time.
- Shorter jobs wait.

#### SRTF Scheduling
- P2 and P4 preempt P1 because they have shorter burst times.

---

### Expected Output

#### Priority Scheduling Gantt Chart
P1 | P4 | P3 | P2

#### Priority Scheduling — Per-Process Metrics

| PID | Arrival | Burst | Priority | Finish | WT    | TAT   | RT   |
|-----|---------|-------|----------|--------|-------|-------|------|
| P1  | 0       | 10    | 1        | 10     | 0     | 10    | 0    |
| P2  | 1       | 2     | 4        | 16     | 13    | 15    | 13   |
| P3  | 2       | 3     | 3        | 14     | 9     | 12    | 9    |
| P4  | 3       | 1     | 2        | 11     | 7     | 8     | 7    |
| **Average** | | | |        | **7.25** | **11.25** | **7.25** |

## Actual Result:
Output matched expected result.

Status: Pass

---

#### SRTF Scheduling Gantt Chart
P1 | P2 | P4 | P3 | P1

#### SRTF Scheduling — Per-Process Metrics

| PID | Arrival | Burst | Finish | WT    | TAT   | RT   |
|-----|---------|-------|--------|-------|-------|------|
| P1  | 0       | 10    | 17     | 7     | 17    | 0    |
| P2  | 1       | 2     | 5      | 2     | 4     | 0    |
| P3  | 2       | 3     | 8      | 3     | 6     | 3    |
| P4  | 3       | 1     | 4      | 0     | 1     | 0    |
| **Average** | | |        | **3.00** | **7.00** | **0.75** |

------------------------------------------------------------------------------------------------------------


## Test Case 3 

## Scenario C: Starvation-Sensitive Case

### Purpose
This scenario demonstrates starvation in Priority Scheduling.
A low-priority long process waits while higher-priority processes continue arriving.

## Preconditions:

Simulator is opened successfully.
User is on scheduling page.

## Steps:

Select Priority Scheduling.
Enter process data for P1, P2, P3, and P4.
Click Run Simulation

### Input

| PID | Arrival Time | Burst Time | Priority |
|-----|-------------|------------|----------|
| P1  | 0           | 15         | 5        |
| P2  | 1           | 3          | 1        |
| P3  | 2           | 2          | 1        |
| P4  | 3           | 4          | 1        |

---

### Expected Behavior

#### Priority Scheduling
- P1 starts first.
- Higher priority processes arrive and repeatedly preempt P1.
- P1 waits significantly longer.

#### SRTF Scheduling
- Processes are selected based on shortest remaining time.
- Starvation effect is reduced compared to Priority.

---

### Expected Output

#### Priority Scheduling Gantt Chart
P1 | P2 | P3 | P4 | P1

#### Priority Scheduling — Per-Process Metrics

| PID | Arrival | Burst | Priority | Finish | WT    | TAT   | RT   |
|-----|---------|-------|----------|--------|-------|-------|------|
| P1  | 0       | 15    | 5        | 24     | 9     | 24    | 0    |
| P2  | 1       | 3     | 1        | 4      | 0     | 3     | 0    |
| P3  | 2       | 2     | 1        | 6      | 2     | 4     | 2    |
| P4  | 3       | 4     | 1        | 10     | 3     | 7     | 3    |
| **Average** | | | |        | **3.50** | **9.50** | **1.25** |

---

#### SRTF Scheduling Gantt Chart
P1 | P2 | P3 | P2 | P4 | P1

#### SRTF Scheduling — Per-Process Metrics

| PID | Arrival | Burst | Finish | WT    | TAT   | RT   |
|-----|---------|-------|--------|-------|-------|------|
| P1  | 0       | 15    | 24     | 9     | 24    | 0    |
| P2  | 1       | 3     | 6      | 2     | 5     | 0    |
| P3  | 2       | 2     | 4      | 0     | 2     | 0    |
| P4  | 3       | 4     | 10     | 3     | 7     | 3    |
| **Average** | | |        | **3.50** | **9.50** | **0.75** |


## Actual Result:
Output matched expected result.

Status: Pass

------------------------------------------------------------------------------------------------------------


## Test Case 4

## Scenario D: Invalid Input Validation

### Purpose
This scenario tests the system's input validation by providing invalid data.
It verifies that the scheduler correctly detects and reports errors before running.

## Preconditions:

Simulator is opened successfully.
User is on scheduling page.

## Steps:

Select Priority Scheduling.
Enter process data for P1, P2, P3, and P4.
Click Run Simulation

### Input

| PID | Arrival Time | Burst Time | Priority |
|-----|-------------|------------|----------|
| P1  | 0           | 4          | 0        |
| P1  | 2           | 3          | 2        |
| P3  | -1          | 5          | 1        |
| P4  | 3           | 6          | 3        |

---

### Expected Behavior

#### Priority Scheduling
- Row 1 [P1]: Priority value is 0 — system rejects it because priority must be ≥ 1.
- Row 2 [P1]: PID is duplicated — system rejects it because PIDs must be unique.
- Row 3 [P3]: Arrival time is negative — system rejects it because arrival must be ≥ 0.
- Scheduler does **not** run until all errors are fixed.

#### SRTF Scheduling
- Row 2 [P1]: Duplicate PID "P1" — PIDs must be unique.
- Row 3 [P3]: Arrival time cannot be negative (got -1) — must be ≥ 0.
- Scheduler does **not** run until all errors are fixed.

---

## Actual Result:
Output matched expected result.

Status: Pass


