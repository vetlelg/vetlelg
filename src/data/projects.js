const projects = [
  {
    id: 'deepflow',
    title: 'DeepFlow',
    description:
      'Real-time data pipeline monitor that visualizes streaming events as an interactive node graph. Supports Kafka and RabbitMQ sources with configurable alerting thresholds.',
    technologies: ['React', 'D3.js', 'Node.js', 'WebSocket', 'Kafka'],
    liveUrl: 'https://deepflow.example.com',
    githubUrl: 'https://github.com/vetlelg/deepflow',
  },
  {
    id: 'nordlys',
    title: 'Nordlys',
    description:
      'Weather dashboard for northern Norway with aurora borealis forecasting. Combines meteorological data with solar wind measurements to predict viewing conditions.',
    technologies: ['Next.js', 'Python', 'FastAPI', 'Chart.js', 'Tailwind'],
    liveUrl: 'https://nordlys.example.com',
    githubUrl: 'https://github.com/vetlelg/nordlys',
  },
  {
    id: 'terravox',
    title: 'TerraVox',
    description:
      'Collaborative terrain editor that turns elevation data into 3D-printable models. Users sculpt landscapes in the browser and export STL files for printing.',
    technologies: ['Three.js', 'WebGL', 'Rust', 'WASM', 'IndexedDB'],
    liveUrl: 'https://terravox.example.com',
    githubUrl: 'https://github.com/vetlelg/terravox',
  },
  {
    id: 'pulseboard',
    title: 'PulseBoard',
    description:
      'Open-source team health check tool inspired by the Spotify squad health model. Anonymous surveys with trend visualization and export to common formats.',
    technologies: ['SvelteKit', 'SQLite', 'Docker', 'Vitest', 'OAuth'],
    liveUrl: 'https://pulseboard.example.com',
    githubUrl: 'https://github.com/vetlelg/pulseboard',
  },
]

export default projects
