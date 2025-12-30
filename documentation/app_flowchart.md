flowchart TD
    Start[Visitor Arrives at whoami] --> AuthCheck{User Logged In}
    AuthCheck -->|No| Auth[Show Login or Signup]
    Auth --> AuthCheck
    AuthCheck -->|Yes| Dashboard[User Dashboard]
    Dashboard --> PageBuilder[Page Builder]
    Dashboard --> Content[Content Management]
    Dashboard --> Ecommerce[Ecommerce Panel]
    Dashboard --> Marketing[Marketing Automation]
    Dashboard --> Analytics[Analytics Dashboard]
    Dashboard --> Domains[Custom Domain Settings]
    Dashboard --> Coach[Coach Platform]
    Dashboard --> AdminCheck{Admin Role}
    AdminCheck -->|Yes| AdminPanel[Admin Interface]
    AdminPanel --> End[End]
    AdminCheck -->|No| End[End]