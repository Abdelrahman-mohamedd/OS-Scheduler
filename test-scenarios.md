# Test Scenarios

---

## Scenario 1: Basic Mixed Workload (Normal Case)

### Purpose
This scenario tests a normal workload with multiple processes having different arrival times, burst times, and priorities.
It verifies that both algorithms work correctly under standard conditions.

### Input

| PID | Arrival Time | Burst Time | Priority |
|---|---|---|---|
| P1 | 0 | 6 | 2 |
| P2 | 1 | 4 | 1 |
| P3 | 2 | 2 | 3 |
| P4 | 3 | 5 | 2 |

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

#### SRTF Scheduling Gantt Chart
P1 | P2 | P3 | P2 | P4 | P1

---

### Result
- Gantt chart displayed successfully
- Average Waiting Time calculated
- Average Turnaround Time calculated

---

## Scenario 2: Conflict Between Priority and Burst Time

### Purpose
This scenario creates a conflict between process priority and burst time.
It demonstrates the behavioral difference between Priority Scheduling and SRTF.

### Input

| PID | Arrival Time | Burst Time | Priority |
|---|---|---|---|
| P1 | 0 | 10 | 1 |
| P2 | 1 | 2 | 4 |
| P3 | 2 | 3 | 3 |
| P4 | 3 | 1 | 2 |

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

#### SRTF Scheduling Gantt Chart
P1 | P2 | P4 | P3 | P1

---

### Result
- Clear difference observed between both algorithms
- Priority favors importance
- SRTF favors shorter execution time

---

## Scenario 3: Starvation-Sensitive Case

### Purpose
This scenario demonstrates starvation in Priority Scheduling.
A low-priority long process waits while higher-priority processes continue arriving.

### Input

| PID | Arrival Time | Burst Time | Priority |
|---|---|---|---|
| P1 | 0 | 15 | 5 |
| P2 | 1 | 3 | 1 |
| P3 | 2 | 2 | 1 |
| P4 | 3 | 4 | 1 |

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

#### SRTF Scheduling Gantt Chart
P1 | P2 | P3 | P4 | P1

---

### Result
- Long waiting time observed for P1
- Starvation behavior visible in Priority Scheduling
- Comparison metrics generated successfully