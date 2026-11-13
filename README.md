# AgentShield AI
### Your AI Agent's Firewall Against Manipulation.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.0+-EA4C89.svg?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![SQLite](https://img.shields.io/badge/SQLite3-Database-003B57.svg?logo=sqlite&logoColor=white)](https://sqlite.org)
[![Pytest](https://img.shields.io/badge/Pytest-9.2+-0A9EDC.svg?logo=pytest&logoColor=white)](https://docs.pytest.org)

**AgentShield AI** is an enterprise-grade AI Agent Security Gateway and Firewall engineered for national and international hackathons. It prevents malicious instruction manipulation, direct and indirect prompt injections, unauthorized tool usurpation, IDOR cross-tenant data leaks, and sensitive credential exposure by enforcing security **at the backend layer**, rather than relying merely on system prompt suggestions.

---

## 🎯 The Core Differentiator

> **"Security is enforced at the backend, not merely suggested through an AI prompt."**

Most current agent systems rely on fragile system prompts (e.g. *"You are a helpful assistant and must never delete records or reveal secret keys"*). Attackers bypass these easily via jailbreaks, hidden comments, or delimiter stuffing.

AgentShield AI introduces an **architectural firewall**:
- Every tool invocation and model input routes strictly through the **Python FastAPI Security Gateway**.
- **Role-Based Access Control (RBAC)** verifies caller clearances in backend code.
- **Direct tool endpoint attacks** receive an immediate `403 Forbidden` (`SecurityGatewayException`) regardless of frontend state.
- **PII Scrubbing** automatically redacts credit cards, SSNs, JWTs, and API keys before responses reach the caller.
- **Forensic Audit Logging** commits immutable records to an SQLite database with streaming CSV export.

---

## 🎨 Premium Visual Storytelling & Design

- **Futuristic Cybersecurity SaaS Interface**: Deep obsidian and dark navy canvas with electric cyan, electric blue, and violet neon accents.
- **Spacious & Immersive Experience**: Generous whitespace, large typography, elegant glassmorphism (`backdrop-blur-xl`), and delicate gradient borders.
- **Animated 3D Security Shield**: Interactive central SVG shield surrounded by rotating cryptographic telemetry rings, pulse waves, floating particles, and glowing AI core.
- **Interactive Architecture Flow**: Visualizes `USER INPUT ➔ AI AGENT ➔ SECURITY GATEWAY ➔ POLICY ENGINE ➔ APPROVED TOOLS ➔ AUDIT LOGS` with the **separate blocked pathway** highlighted in crimson.
- **Live Attack vs. Defence Demo**: Real-time interactive sandbox allowing users to compare Unprotected Simulation against Protected Mode with live FastAPI backend execution.

---

## 🗺️ 10 Complete Working Pages & Sections

### Public SaaS Landing Page
- **Hero Section**: Full-screen immersive showcase with animated shield, digital particles, and primary CTAs.
- **Section A — The Problem**: 4 deep-dive cards covering Direct Prompt Injection, Malicious Retrieved Documents, Unauthorised Tool Calls, and Sensitive Data Exposure / IDOR.
- **Section B — Our Solution**: Interactive architecture illustration featuring active security controls at each stage and an isolated blocked pathway.
- **Section C — Core Features**: 7 spacious feature cards covering Prompt Injection Detection, RBAC, PII Scrubbing, Policy Engine, Threat Explorer, Audit Logging, and Security Evaluation.
- **Section D — Attack vs Defence**: Hands-on interactive sandbox with 3 live scenarios toggling between Unprotected Simulation and Protected Mode.
- **Section E — Technology Stack**: React 18, TypeScript, Tailwind CSS, Python 3.14, FastAPI, SQLite3, and Pytest.
- **Section F — Team**: Large, spacious profile cards for the engineering team with working LinkedIn links.
- **Section G — Final CTA**: *"Build Powerful AI Agents. Keep Them Secure."*
- **Section H — Enterprise Footer**: Brand logo, tagline, governance links, and project information.

### Dedicated Application Dashboard (Console)
1. **Overview Dashboard (`/dashboard`)**: Database-backed statistics, Recharts Threat Category breakdown, Security Activity Timeline, Recent Alerts, and Audit Feed.
2. **AI Agent Playground (`/playground`)**: Interactive NovaSupport AI demo, role clearance switcher (Public, Tier 1, Supervisor, Admin), real-time Gateway Trace Inspector, and Human-in-the-Loop approval workflows.
3. **Attack Simulation Lab (`/attack-lab`)**: 8 rigorous security scenarios + benign baselines with individual test execution, batch runner, protected vs. unprotected mode toggles, and forensic output inspection.
4. **Security Gateway (`/gateway`)**: 7-layer architecture inspector + Live Direct Tool Sandbox proving that hitting backend tool endpoints directly cannot bypass security policies.
5. **Security Policy Centre (`/policies`)**: Database-backed policy manager allowing real-time edits to tool enable states, role clearance thresholds, confirmation token requirements, and PII filters.
6. **Threat Explorer (`/threats`)**: Real-time forensic threat browser with search and multi-criteria filters for severity, attack category, and status.
7. **Audit Logs (`/audit`)**: Tamper-evident forensic ledger with request UUIDs, latencies, policy citations, search filters, and one-click RFC 4180 CSV export.
8. **Evaluation & Benchmarking (`/benchmark`)**: Empirical metrics computed strictly from executed SQLite test runs: Blocking Rate, False-Positive Rate, Precision, Recall, F1 Score, comparison charts, and JSON report downloads.
9. **Team Page (`/team`)**: Cyber-themed profile cards for team members with functional LinkedIn links.

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- **Python**: 3.10+ (Tested on Python 3.14)
- **Node.js**: v18+ (Tested on Node v24)
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/agentshield-ai.git
cd agentshield-ai
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
FastAPI Swagger documentation is live at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
Open your browser at: `http://127.0.0.1:5173/`

---

## 🧪 Testing Guide

### Running Backend Unit & Security Tests
AgentShield includes an automated test suite verifying prompt injection detection, RBAC clearance enforcement, PII scrubbing, and direct bypass prevention:

```bash
cd backend
.\venv\Scripts\python.exe -m pytest
```
*Expected Result: 9 passed, 0 failed.*

### Verifying Direct Bypass Prevention
Verify that hitting tool endpoints directly from outside the agent cannot bypass security:
```bash
curl -X POST http://127.0.0.1:8000/api/gateway/test-direct \
  -H "Content-Type: application/json" \
  -d '{"tool_name": "dump_user_credentials", "arguments": {"user_id": "cust_001"}, "user_role": "public", "protected_mode": true}'
```
*Expected Result: HTTP 403 Forbidden with `SecurityGatewayException`.*

---

## 👥 Hackathon Engineering Team

- **Priyanshu Kumar Sinha** — *Haldia Institute of Technology* (Lead Architect & Full-Stack Engineer)
  - [LinkedIn Profile](https://www.linkedin.com/in/)
- **Muskan Bharti** — *Central University of Punjab, Bathinda* (Cybersecurity & Threat Researcher)
  - [LinkedIn Profile](https://www.linkedin.com/in/muskan-bharti-b8000a380/)
- **Vishesh** — *SVNIT Surat* (Systems & Benchmark Engineer)
  - [LinkedIn Profile](https://www.linkedin.com/in/vishesh-ruparel-744a8b36a/)

---

## 📜 License
Licensed under the Apache License, Version 2.0.
