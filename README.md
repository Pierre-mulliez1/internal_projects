# Devoteam Projects & Recruitment Platform (Proof of Concept)

## Project Description

This project is a single-page, responsive website designed as a Proof of Concept (POC) for an internal platform at Devoteam. Its primary purpose is to serve as a dynamic showcase for internal projects, company culture, and open contribution roles. The entire website is built within a single `index.html` file, utilizing modern, dependency-free HTML, CSS, and JavaScript.

## Intended Use

The platform is intended to be a central hub for both internal employees and external candidates to:

  * Discover and learn about innovative internal projects like Ask\!, Smart Factory, and Cyberlake.
  * Explore open contribution opportunities in an interactive way.
  * Provide a modern, visually appealing "front door" for Devoteam's  internal innovation efforts.

## Status

**This website is a Proof of Concept (POC).** It is not connected to a live database and is intended for demonstration and development purposes only. All content is currently hardcoded within JavaScript objects in the `index.html` file to simulate a data-driven front-end application.

## How to Update Content

One of the key features of this POC is its ease of maintenance. You do not need to be a developer to update the main content of the site. All content for  roles, projects, and the other involvment section is managed in json "data" variables inside the `<script>` tag at the bottom of the `index.html` file.

To update the content, simply open `index.html` in a text editor, scroll to the bottom, and modify the specified variables.

### Updating Open Roles

All job listings are managed by the `jobsData` variable. It is an array of objects, where each object represents one job card. To add, remove, or edit a job, simply modify the objects in this array.

**Structure of a Job Object:**

```javascript
{
    title: 'Full Stack Developer',              // The title of the job role
    location: 'Lyon, France',                   // The location of the role
    department: 'Application Development Practice', // The relevant department
    imageUrl: 'https://source.unsplash.com/your-image-id', // URL for the card's image
    description: 'A brief, one-paragraph summary of the role and its responsibilities.'
}
```

### Updating Projects

All projects in the "Our Projects" section are managed by the `projectsData` variable.

**Structure of a Project Object:**

```javascript
{
    id: 'project-ask', // A unique ID used for the navigation anchor (e.g., #project-ask)
    title: 'Ask!',     // The main title of the project
    subtitle: 'An innovative solution that radically simplifies data interaction.', // Subtitle shown in the hero
    buttons: [
        { text: 'View Demo', class: 'primary', link: '#' },
        { text: 'Read Documentation', class: 'secondary', link: '#' }
    ],
    images: [
        'https://url-for-image-1.com', // URL for the left image
        'https://url-for-image-2.com'  // URL for the right image
    ],
    features: {
        heading: 'Advantages of Ask! for Your Business', // Heading for the features list
        subheading: 'Measurable results from the first day.', // Subheading for the features list
        items: [
            {
                title: 'Productivity Gain (💡)',
                description: 'A short description of the feature or benefit.'
            },
            // You can have up to 6 feature items
        ]
    }
}
```

### Updating "About Us" Cards

The visually rich cards in the "About Us" section are managed by the `aboutData` variable.

**Structure of an "About Us" Card Object:**

```javascript
{
    title: 'Our Process', // The main title on the card
    subtitle: 'How we turn ideas into reality.', // The subtitle text
    label: 'Methodology', // The text inside the button/label
    labelLink: '#', // The URL the button will redirect to
    infoIcon: '<svg>...</svg>', // An SVG string for the small icon in the info line
    infoText: 'Agile sprints, weekly demos', // The text next to the small icon
    backgroundImage: 'https://url-for-background-image.com' // The URL for the card's background
}
```

## How to Run Locally

Since this is a static website with no server-side dependencies, you can run it by simply opening the `index.html` file in any modern web browser.

## Technologies Used

  - HTML5
  - CSS3 (with CSS Variables for easy theming)
  - Vanilla JavaScript (ES6+) (No external libraries or frameworks)