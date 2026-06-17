const projects = [
  {
    id: 'iipax-case',
    title: 'iipax Case',
    year: '2025',
    organization: 'Decisive — Ida Infront',
    description:
      'Consulting at Ida Infront, working on upgrades, installation, and maintenance of the iipax case management and archiving system for the Swedish public sector.',
    technologies: ['Java', 'JEE', 'WildFly', 'Linux', 'Jira'],
    githubUrl: null,
    featured: true,
  },
  {
    id: 'nav-frikort',
    title: 'NAV — Exemption Card',
    year: '2025',
    organization: 'Decisive — NAV',
    description:
      'Developed microservices for automatic handling of health reimbursements at NAV. Event-driven architecture with a focus on observability and CI/CD.',
    technologies: ['Kotlin', 'Spring', 'Microservices', 'Docker', 'Kubernetes', 'Grafana'],
    githubUrl: null,
    featured: true,
  },
  {
    id: 'bachelor',
    title: "Bachelor's Project",
    year: 'Spring 2025',
    organization: 'Oslo Metropolitan University',
    description:
      'Push-based message distribution for event-driven architecture. Evaluated R2DBC, long polling, and server-sent events to replace a pull-based HTTP solution.',
    technologies: ['Kotlin', 'Spring WebFlux', 'PostgreSQL', 'R2DBC', 'Docker'],
    githubUrl: null,
    featured: true,
  },
  {
    id: '3d-world',
    title: '3D World',
    year: 'Fall 2023',
    organization: 'Oslo Metropolitan University',
    description:
      'An open 3D world built in Unity, exploring terrain generation, player mechanics, and 3D game development.',
    technologies: ['Unity', 'C#'],
    githubUrl: 'https://github.com/vetlelg/3D-World',
  },
  {
    id: 'top-down-shooter',
    title: 'Top Down Shooter',
    year: 'Fall 2023',
    organization: 'Oslo Metropolitan University',
    description:
      'A 2D top-down shooter game made with Unity.',
    technologies: ['Unity', 'C#'],
    githubUrl: 'https://github.com/vetlelg/TopDownShooter',
  },
  {
    id: 'web-applications',
    title: 'Web Applications',
    year: 'Fall 2024',
    organization: 'Oslo Metropolitan University',
    description:
      'Map application for registering markers with location data, images, and comments. Full-stack with React, ASP.NET Web API, Google Maps, and cookie-based auth.',
    technologies: ['React', 'ASP.NET', 'C#', 'EF Core', 'SQLite'],
    githubUrl: 'https://github.com/vetlelg/ITPE3200-Web-Applications',
    featured: true,
  },
  {
    id: 'app-development',
    title: 'App Development',
    year: 'Fall 2024',
    organization: 'Oslo Metropolitan University',
    description:
      'Android apps including math exercises, birthday management with automatic SMS, and a map marker app using the Google Maps Android SDK.',
    technologies: ['Java', 'Android', 'Google Maps SDK'],
    githubUrl: 'https://github.com/vetlelg/DAVE3600-App-Development',
    featured: true,
  },
  {
    id: 'vetlelg-com',
    title: 'vetlelg.com',
    year: '2023',
    organization: 'Personal Project',
    description:
      'Previous iteration of my personal website. Built with React and Bootstrap, hosted on Azure with automatic deployment via GitHub Actions.',
    technologies: ['React', 'Bootstrap', 'JavaScript', 'Azure'],
    githubUrl: 'https://github.com/vetlelg/vetlelg-frontend',
  },
  {
    id: 'networking',
    title: 'Networking',
    year: 'Spring 2024',
    organization: 'Oslo Metropolitan University',
    description:
      'File transfer application implementing TCP-like reliability over UDP. Features a three-way handshake, Go-Back-N sliding window protocol, and graceful connection termination.',
    technologies: ['Python', 'Socket Programming'],
    githubUrl: 'https://github.com/vetlelg/DATA2410-DRTP',
    featured: true,
  },
  {
    id: 'webprogramming',
    title: 'Web Programming',
    year: 'Spring 2023',
    organization: 'Oslo Metropolitan University',
    description:
      'Full-stack web development projects with Java Spring Boot. Covered input validation, error handling, logging, cookie-based authentication, and password hashing.',
    technologies: ['Java', 'Spring Boot', 'SQLite', 'JavaScript', 'Bootstrap'],
    githubUrl: 'https://github.com/vetlelg/DATA1700-Webprogramming',
  },
  {
    id: 'inclusive-web-design',
    title: 'Inclusive Web Design',
    year: 'Fall 2022',
    organization: 'Oslo Metropolitan University',
    description:
      'Web development project focused on inclusive design principles, accessibility, and WCAG compliance.',
    technologies: ['HTML', 'CSS'],
    githubUrl: 'https://github.com/vetlelg/final-assignment',
  },
  {
    id: 'fountain-of-objects',
    title: 'The Fountain of Objects',
    year: '2022',
    organization: 'Personal Project',
    description:
      'A console-based adventure game created while learning C#, based on challenges from "The C# Player\'s Guide" by RB Whitaker.',
    technologies: ['C#'],
    githubUrl: 'https://github.com/vetlelg/csharpplayersguide/tree/main/bossbattles/TheFountainOfObjects',
  },
  {
    id: 'snake',
    title: 'Snake',
    year: '2020',
    organization: 'Personal Project',
    description:
      'A classic Snake game — my first object-oriented programming project, created while learning C++ with the SFML graphics library.',
    technologies: ['C++', 'SFML'],
    githubUrl: 'https://github.com/vetlelg/sfml-snake',
  },
]

export default projects
