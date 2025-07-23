import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [holidaysData, setHolidaysData] = useState(null)
  const [selectedReligion, setSelectedReligion] = useState('jewish')
  const [selectedHoliday, setSelectedHoliday] = useState('next')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalDays: 0,
    progress: 0
  })
  const [currentHoliday, setCurrentHoliday] = useState(null)

  // Load holidays data and initialize stable values
  useEffect(() => {
    fetch('/holidays2025.json')
    // code mistake example - missed parse step
      .then(response => response.json())
      // .then(response => response)
      .then(data => {
        setHolidaysData(data)
      })
      .catch(error => console.error('Error loading holidays:', error))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentDate(now)
      if (holidaysData) {
        const holidays = holidaysData[selectedReligion] || []
        let targetHoliday = null
        if (selectedHoliday === 'next') {
          targetHoliday = holidays.find(holiday => {
            const holidayDate = new Date(holiday.start)
            return holidayDate > now
          })
          if (!targetHoliday && holidays.length > 0) {
            targetHoliday = holidays[0]
          }
        } else {
          targetHoliday = holidays.find(holiday => holiday.name === selectedHoliday)
        }
        if (targetHoliday) {
          setCurrentHoliday(targetHoliday)
          const targetDate = new Date(targetHoliday.start)
          const target = targetDate.getTime()
          const difference = target - now.getTime()
          const days = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24))
          const hours = Math.floor((Math.abs(difference) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((Math.abs(difference) % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((Math.abs(difference) % (1000 * 60)) / 1000)
          const maxDays = 30
          let displayProgress = 0
          if (difference > 0) {
            displayProgress = Math.min((days / maxDays) * 100, 100)
          } else {
            displayProgress = 0
          }
          setTimeRemaining({
            days: difference > 0 ? days : 0,
            hours: difference > 0 ? hours : 0,
            minutes: difference > 0 ? minutes : 0,
            seconds: difference > 0 ? seconds : 0,
            totalDays: days,
            progress: Math.max(0, Math.min(displayProgress, 100))
          })
        }
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [holidaysData, selectedReligion, selectedHoliday])

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const religions = [
    { key: 'jewish', label: 'Jewish', emoji: '✡️' },
    { key: 'muslim', label: 'Muslim', emoji: '☪️' },
    { key: 'christian', label: 'Christian', emoji: '✝️' }
  ]

  return (
    <div className="app" id="app-root">
      <div className="container" id="main-container">
        {/* Header with current date */}
        <div className="header" id="header-bar">
          <div className="current-date" id="current-date">
            <div className="date" id="date-string">{formatDate(currentDate)}</div>
            <div className="time" id="time-string">{formatTime(currentDate)}</div>
          </div>
        </div>

        {/* Religion Selection */}
        <div className="religion-selector" id="religion-selector">
          {religions.map(religion => (
            <button
              key={religion.key}
              id={`religion-${religion.key}`}
              className={`religion-btn ${selectedReligion === religion.key ? 'religion-btn-active' : 'religion-btn-unactive'}`}
              data-testid={`religion-btn-${religion.key}`}
              onClick={() => {
                setSelectedReligion(religion.key)
                setSelectedHoliday('next')
              }}
            >
              <span className="emoji" data-testid={`emoji-${religion.key}`}>{religion.emoji}</span>
              <span className="label" data-testid={`label-${religion.key}`}>{religion.label}</span>
            </button>
          ))}
        </div>

        {/* Holiday Selection */}
        <div className="holiday-selector" id="holiday-selector">
          <select
            value={selectedHoliday}
            onChange={(e) => setSelectedHoliday(e.target.value)}
            className="holiday-select"
            id="holiday-select"
            data-testid="holiday-select"
          >
            <option value="next">Next Holiday</option>
            {holidaysData && holidaysData[selectedReligion]?.map((holiday, index) => {
              const holidayDate = new Date(holiday.start);
              const isPast = holidayDate < currentDate;
              return (
                <option
                  key={`${holiday.name}-${holiday.start}-${index}`}
                  value={holiday.name}
                  disabled={isPast}
                  className={isPast ? "holiday-option-past" : "holiday-option-future"}
                  data-testid={`holiday-option-${holiday.name.replace(/\s/g, '')}`}
                >
                  {holiday.name} ({new Date(holiday.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                  {isPast ? ' (Past)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Main Counter */}
        <div className="counter-container" id="counter-container">
          {/* Stable Circle Component */}
          <div className="circular-progress" id="circular-progress" style={{ width: 200, height: 200 }}>
            <svg width={200} height={200} className="progress-ring" id="progress-ring-svg">
              <circle
                cx={100}
                cy={100}
                r={90}
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="10"
              />
              <circle
                cx={100}
                cy={100}
                r={90}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={565.48}
                strokeDashoffset={565.48 - (timeRemaining.progress / 100) * 565.48}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                id="progress-ring"
              />
              <defs>
                <linearGradient id="gradient" gradientTransform="rotate(132.6)">
                  <stop offset="23.3%" stopColor="rgba(71,139,214,1)" />
                  <stop offset="84.7%" stopColor="rgba(37,216,211,1)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="progress-content" id="progress-content">
              <div className="countdown-number" id="countdown-days">{timeRemaining.days}</div>
              <div className="countdown-label" id="countdown-label-days">DAYS</div>
            </div>
          </div>
          
          <div className="holiday-info" id="holiday-info">
            <h2 className="holiday-name" id="holiday-name">
              {currentHoliday ? currentHoliday.name : 'Loading...'}
            </h2>
            <div className="holiday-date" id="holiday-date">
              {currentHoliday && new Date(currentHoliday.start).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Detailed Countdown */}
          <div className="detailed-countdown" id="detailed-countdown">
            <div className="time-unit time-hours" id="time-unit-hours">
              <span className="number" id="countdown-hours">{timeRemaining.hours}</span>
              <span className="label" id="label-hours">Hours</span>
            </div>
            <div className="time-unit time-minutes" id="time-unit-minutes">
              <span className="number" id="countdown-minutes">{timeRemaining.minutes}</span>
              <span className="label" id="label-minutes">Minutes</span>
            </div>
            <div className="time-unit time-seconds" id="time-unit-seconds">
              <span className="number" id="countdown-seconds">{timeRemaining.seconds}</span>
              <span className="label" id="label-seconds">Seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
