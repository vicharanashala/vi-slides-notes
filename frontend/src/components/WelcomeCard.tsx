import logo from '../assets/logo.png'
import './WelcomeCard.css'

interface WelcomeCardProps {
  name?: string
  subtitle: string
}

function WelcomeCard({ name, subtitle }: WelcomeCardProps) {
  return (
    <div className="vi-welcome-card">
      <img src={logo} alt="Vi-Slides" className="vi-welcome-logo" />
      <div className="vi-welcome-text">
        <h1>Welcome{name ? `, ${name}` : ''}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

export default WelcomeCard
