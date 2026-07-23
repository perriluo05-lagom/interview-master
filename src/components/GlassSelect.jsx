import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

function GlassSelect({ options, value, onChange, label, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition)
    }
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  const handleToggle = () => {
    if (!isOpen) {
      updatePosition()
    }
    setIsOpen(!isOpen)
  }

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 99999
      }}
      className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => {
            onChange(option.value)
            setIsOpen(false)
          }}
          className={`w-full px-4 py-3 text-left font-zhongsong transition-colors flex items-center ${
            option.value === value
              ? 'bg-purple-500/25 text-purple-300'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          } ${index !== options.length - 1 ? 'border-b border-white/5' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className={`relative w-full ${className}`}>
      <label className="block text-white/60 text-sm mb-2 font-zhongsong">
        {label}
      </label>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="w-full px-4 py-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl text-white font-zhongsong flex items-center justify-between hover:bg-black/30 hover:border-white/20 transition-all focus:outline-none focus:border-purple-500/50"
      >
        <span>{selectedOption?.label || value}</span>
        <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  )
}

export default GlassSelect
