# SkillUp – Learning Management Platform

## Overview
This project was developed as part of the PIDEV – 3rd Year Engineering Program at **Esprit School of Engineering** (Academic Year 2025–2026).

SkillUp is a full-stack microservices web application that enables teams to manage formations, quizzes, events, payments, job offers, ticketing, forum discussions, and gamification.

## Features
- 🎓 Formation & Course management
- 📝 Quiz & Certification system
- 🗓️ Event management with calendar
- 💳 Payment processing
- 💼 Job offers & applications
- 💬 Forum & community discussion
- 🏆 Gamification & badge system
- 🎫 Support ticket system
- 📊 Admin back-office dashboard

## Tech Stack

### Frontend
- Angular 18
- Bootstrap 5
- Tailwind CSS
- ng-bootstrap / Chart.js

### Backend
- Spring Boot 4 (Microservices Architecture)
- Spring Cloud (Eureka, API Gateway, Config Server)
- MySQL / JPA / Hibernate
- Lombok

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| `eureka-server` | 8761 | Service discovery |
| `gateway` | 8222 | API Gateway |
| `config-server` | 8888 | Centralized config |
| `user` | 8089 | Authentication & users |
| `eventGestion` | 8082 | Event management |
| `Payment` | 8075 | Payment processing |
| `Course` | - | Course management |
| `Formation` | - | Formation management |
| `Quiz` | - | Quiz & certifications |
| `Ticket` | - | Support tickets |
| `forum` | - | Forum discussions |
| `job-offer` | - | Job offers |

## Contributors
| Name | Role |
|------|------|
| Jawher Bziouech | Full-stack Developer |
| wassim hamouda | Full-stack Developer |
| rania regai | Full-stack Developer |
| hadir ghallabi | Full-stack Developer |
| malek maaroufi | Full-stack Developer |
| mehdi chebbi | Full-stack Developers |

## Academic Context
Developed at **Esprit School of Engineering** – Tunisia
PIDEV – 4sae11 | 2025–2026

## Getting Started

### Prerequisites
- Java 17+, Node.js 18+, MySQL 8+, Maven

### Backend
```bash
# Start in this order:
cd backEnd/microservices/eureka-server && mvn spring-boot:run
cd backEnd/microservices/config-server && mvn spring-boot:run
cd backEnd/microservices/gateway && mvn spring-boot:run
# Then start other microservices
```

### Frontend
```bash
cd skillup_front
npm install
ng serve
# Open http://localhost:4200
```

## Acknowledgments
**Esprit School of Engineering** – PIDEV 2025–2026
