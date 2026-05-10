# SkillUp – Learning Management Platform

## 🚀 CI/CD Pipeline Dashboard

| System Health | Frontend | Deployment |
|:---:|:---:|:---:|
| [![Main Aggregator](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-aggregator.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-aggregator.yml) | [![Frontend CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-frontend.yml) | [![CD - Docker Publish](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/cd-publish.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/cd-publish.yml) |

### 🧩 Microservices Build Status

| Core Services | Platform Services | Domain Services |
|:---|:---|:---|
| [![Course CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-course.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-course.yml) <br> [![Formation CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-formation.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-formation.yml) <br> [![Quiz CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-quiz.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-quiz.yml) <br> [![Certificat CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-certificat.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-certificat.yml) <br> [![Resume Parser CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-resume-parser.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-resume-parser.yml) | [![User CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-user.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-user.yml) <br> [![Payment CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-payment.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-payment.yml) <br> [![Config Server CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-config-server.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-config-server.yml) <br> [![Eureka CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-eureka.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-eureka.yml) <br> [![Gateway CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-gateway.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-gateway.yml) | [![EventGestion CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-eventGestion.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-eventGestion.yml) <br> [![Job Offer CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-job-offer.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-job-offer.yml) <br> [![Internship Service CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-internship-service.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-internship-service.yml) <br> [![Entreprise CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-entreprise.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-entreprise.yml) <br> [![Forum CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-forum.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-forum.yml) <br> [![Ticket CI](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-ticket.yml/badge.svg)](https://github.com/Jawher-Bziouech/Team_elevate/actions/workflows/ci-ticket.yml) |

---

## Overview
This project was developed as part of the PIDEV – 4th Year Engineering Program at **Esprit School of Engineering** (Academic Year 2025–2026).

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
