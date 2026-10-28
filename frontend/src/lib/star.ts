// The five-point star from the logo, as an SVG path in a 100 x 100 box.
function starPath(outer = 44, inner = 18, cx = 50, cy = 50) {
  const points = Array.from({ length: 10 }, (_, k) => {
    const radius = k % 2 === 0 ? outer : inner
    const angle = ((-90 + k * 36) * Math.PI) / 180
    return `${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`
  })
  return `M${points.join('L')}Z`
}

export const STAR_PATH = starPath()
