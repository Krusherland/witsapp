const STAR_COLORS = ['#8be9fd', '#ff79c6', '#f1fa8c', '#bd93f9', '#50fa7b']

function createStar(index) {
  return {
    color: STAR_COLORS[index % STAR_COLORS.length],
    delay: `${(index * 0.43) % 3}s`,
    duration: `${7 + (index % 5)}s`,
    size: 2 + (index % 3),
    x: 7 + ((index * 37) % 86),
    y: 6 + ((index * 61) % 88),
  }
}

export default function AuthConstellation({ children, characterCount }) {
  const stars = Array.from({ length: characterCount }, (_, index) => createStar(index))

  return (
    <main className="auth-space">
      <svg className="constellation-lines" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
        {stars.slice(1).map((star, index) => {
          const previousStar = stars[index]
          return (
            <line
              key={`${index}-${index + 1}`}
              x1={previousStar.x}
              y1={previousStar.y}
              x2={star.x}
              y2={star.y}
              style={{ '--line-color': star.color }}
            />
          )
        })}
      </svg>
      <div className="auth-galaxy" aria-hidden="true"><i className="auth-galaxy-arms" /><i className="auth-galaxy-core" /></div>
      <div className="ambient-stars" aria-hidden="true">
        {Array.from({ length: 40 }, (_, index) => {
          const star = createStar(index + 50)
          return (
            <i
              key={index}
              className="ambient-star"
              style={{
                '--star-color': star.color,
                '--star-delay': star.delay,
                '--star-duration': star.duration,
                '--star-size': `${star.size}px`,
                '--star-x': `${star.x}%`,
                '--star-y': `${star.y}%`,
              }}
            />
          )
        })}
      </div>
      <div className="typed-stars" aria-hidden="true">
        {stars.map((star, index) => (
          <i
            key={index}
            className="typed-star"
            style={{
              '--star-color': star.color,
              '--star-delay': star.delay,
              '--star-duration': star.duration,
              '--star-size': `${star.size + 2}px`,
              '--star-x': `${star.x}%`,
              '--star-y': `${star.y}%`,
            }}
          />
        ))}
      </div>
      <div className="auth-content">{children}</div>
    </main>
  )
}