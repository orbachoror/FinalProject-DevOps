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
    fetch('/holidays2025,json')
      .then(response => response.json())
      .then(data => {
        setHolidaysData(data)
      })
      .catch(error => console.error('Error loading holidays:', error))
  }, [])

    // Single timer that updates all values
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

          // Calculate values regardless of whether the date is in the past or future
          const days = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24))
          const hours = Math.floor((Math.abs(difference) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((Math.abs(difference) % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((Math.abs(difference) % (1000 * 60)) / 1000)

          // Calculate progress based on days remaining (out of 30 days max)
          const maxDays = 30
          let displayProgress = 0
          
          if (difference > 0) {
            // If holiday is in the future, show progress based on days remaining
            // 30+ days = 100%, 0 days = 0%
            displayProgress = Math.min((days / maxDays) * 100, 100)
          } else {
            // If holiday has passed, show 0%
            displayProgress = 0
          }

          setTimeRemaining({
            days: difference > 0 ? days : 0, // Show 0 if the holiday has passed
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
    <div className="app">
      <div className="container">
        {/* Header with current date */}
        <div className="header">
          <div className="current-date">
            <div className="date">{formatDate(currentDate)}</div>
            <div className="time">{formatTime(currentDate)}</div>
          </div>
        </div>

        {/* Religion Selection */}
        <div className="religion-selector">
          {religions.map(religion => (
            <button
              key={religion.key}
              className={`${selectedReligion === religion.key ? 'religion-btn-active' : 'religion-btn-unactive'}`}
              onClick={() => {
                setSelectedReligion(religion.key)
                setSelectedHoliday('next') // Reset to next holiday when changing religion
              }}
            >
              <span className="emoji">{religion.emoji}</span>
              <span className="label">{religion.label}</span>
            </button>
          ))}
        </div>

        {/* Holiday Selection */}
                 <div className="holiday-selector">
           <select
             value={selectedHoliday}
             onChange={(e) => setSelectedHoliday(e.target.value)}
             className="holiday-select"
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
                 >
                   {holiday.name} ({new Date(holiday.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                   {isPast ? ' (Past)' : ''}
                 </option>
               );
             })}
           </select>
         </div>

        {/* Main Counter */}
        <div className="counter-container">
          {/* Stable Circle Component */}
          <div className="circular-progress" style={{ width: 200, height: 200 }}>
            <svg width={200} height={200} className="progress-ring">
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
              />
              <defs>
                <linearGradient id="gradient" gradientTransform="rotate(132.6)">
                  <stop offset="23.3%" stopColor="rgba(71,139,214,1)" />
                  <stop offset="84.7%" stopColor="rgba(37,216,211,1)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="progress-content">
              <div className="countdown-number">{timeRemaining.days}</div>
              <div className="countdown-label">DAYS</div>
            </div>
          </div>
          
          <div className="holiday-info">
            <h2 className="holiday-name">
              {currentHoliday ? currentHoliday.name : 'Loading...'}
            </h2>
            <div className="holiday-date">
              {currentHoliday && new Date(currentHoliday.start).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>

          {/* Detailed Countdown */}
          <div className="detailed-countdown">
            <div className="time-unit">
              <span className="number">{timeRemaining.hours}</span>
              <span className="label">Hours</span>
            </div>
            <div className="time-unit">
              <span className="number">{timeRemaining.minutes}</span>
              <span className="label">Minutes</span>
            </div>
            <div className="time-unit">
              <span className="number">{timeRemaining.seconds}</span>
              <span className="label">Seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
