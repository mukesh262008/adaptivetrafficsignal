🚦 **Self-Adaptive Traffic Signal Network**

A Data Structures mini project in C that simulates an adaptive traffic signal system. The system dynamically assigns priority to different junctions based on traffic density, waiting time, and emergency vehicles.

📌 Problem Statement

Traditional traffic signals operate using fixed time intervals, which can cause unnecessary waiting when traffic conditions change.

The Self-Adaptive Traffic Signal Network dynamically determines the priority of traffic junctions based on real-time traffic conditions. Emergency vehicles receive the highest priority, while congested junctions and longer waiting times are given higher priority to improve traffic flow.

🎯 Objectives

- Dynamically calculate traffic priority.
- Give the highest priority to emergency vehicles.
- Identify heavily congested junctions.
- Reduce unnecessary vehicle waiting time.
- Demonstrate practical applications of data structures.
- Simulate automatic traffic signal selection.

🧩 Data Structures Used

Data Structure| Purpose
Queue| Stores vehicles waiting at each junction
Priority-based Selection| Selects the junction with the highest priority
Structure| Stores junction and vehicle information
Graph Concept| Represents connections between multiple traffic junctions

Queue

The vehicle queue follows the FIFO (First In, First Out) principle. Vehicles that arrive first are processed first.

Priority Calculation

The system assigns priority using the following rules:

Condition| Priority
Emergency vehicle present| 3 – Emergency
Cars > 70 AND waiting > 40 sec| 2 – High
Cars > 50 OR waiting > 30 sec| 1 – Medium
Otherwise| 0 – Low

⚙️ How It Works

Traffic Data
     ↓
Create Vehicle Queues
     ↓
Calculate Junction Priority
     ↓
Compare Priorities
     ↓
Select Highest-Priority Junction
     ↓
Green Signal
     ↓
Vehicles Pass

✨ Key Features

- 🚑 Emergency vehicle priority
- 🚗 Congestion-based priority
- ⏱️ Waiting-time analysis
- 🚦 Automatic green-signal selection
- 🔄 FIFO vehicle processing
- 🛣️ Multiple-junction support
- 💻 Simple C implementation

🛠️ Technologies Used

- C Programming
- Data Structures
- Queue
- Structures
- Priority-based decision making

📂 Project Structure

Self-Adaptive-Traffic-Signal-Network/
│
├── traffic_signal.c
├── README.md
└── report/
    └── Project_Report.docx

🚀 Getting Started

1. Clone the Repository

git clone https://github.com/your-username/self-adaptive-traffic-signal-network.git

2. Open the Project

cd self-adaptive-traffic-signal-network

3. Compile

Using GCC:

gcc traffic_signal.c -o traffic_signal

4. Run

./traffic_signal

Windows

traffic_signal.exe

🖥️ Sample

Example traffic condition:

Junction 1
Cars: 87
Emergency Vehicles: 2
Waiting Time: 43 sec

Priority: Emergency Priority

The system selects:

SIGNAL DECISION

Junction 1 gets GREEN SIGNAL
Reason: Emergency Priority

Emergency vehicle detected!

Vehicles are then processed using the queue:

Vehicles passing:

Vehicle 1 passed
Vehicle 2 passed
Vehicle 3 passed

📊 Priority Flow

                Traffic Data
                     │
          ┌──────────┴──────────┐
          │                     │
   Emergency Vehicle?       No Emergency
          │                     │
         Yes              Check Traffic
          │                     │
   Highest Priority       ┌─────┴─────┐
                          │           │
                    High Traffic   Normal
                          │           │
                       Higher      Lower
                       Priority    Priority

🎓 Academic Information

Project: Self-Adaptive Traffic Signal Network
Course: 23AD35C – Data Structures
Department: Artificial Intelligence and Data Science
Name: Mukesh R
Register Number: 25243031

📌 Limitations

- The current implementation uses simulated traffic data entered by the user.
- The queue size is limited by the defined "MAX" value.
- The current C program demonstrates priority selection but does not implement a complete graph traversal algorithm.
- Real-time sensors are not connected.

🤝 Contribution

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Push the branch.
6. Create a Pull Request.

git checkout -b feature/improvement
git add .
git commit -m "Add traffic priority improvement"
git push origin feature/improvement
