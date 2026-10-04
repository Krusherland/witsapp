import DemoGalaxy from '../assets/DemoGalaxy'

const UPCOMING_COURSES = [
  { title: 'Reading the Sky: An Intro to Astronomy', blurb: 'Constellations, planets, and how to find them with your own eyes.' },
  { title: 'The Physics of Stars', blurb: 'From nuclear fusion to supernovae — how stars live, shine, and die.' },
  { title: 'Astrology & Archetypes', blurb: 'A cultural history of the zodiac and the symbols behind it.' },
]

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-canvas">
          <DemoGalaxy />
        </div>
        <div className="home-hero-copy">
          <h1>Written in the Stars</h1>
          <p>
            WITS turns the people in your life into a living galaxy — a planet for everyone who
            orbits you, colored by the bond you share and the sign they were born under.
          </p>
        </div>
      </section>

      <section className="home-courses">
        <h2>Upcoming courses about the universe</h2>
        <p className="home-courses-sub">
          We're building a curriculum on astronomy, astrology, and the night sky. Courses launch soon.
        </p>
        <div className="course-grid">
          {UPCOMING_COURSES.map((course) => (
            <div key={course.title} className="course-card course-card-soon">
              <div className="body">
                <span className="soon-badge">Coming soon</span>
                <h3>{course.title}</h3>
                <p>{course.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
