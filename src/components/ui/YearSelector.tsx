/**
 * YearSelector
 *
 * Futuristic sci-fi dashboard year selector with glassmorphism card,
 * animated timeline, glowing SVG indicator, and play/pause animation.
 *
 * Supports both controlled and uncontrolled year state.
 * Zero external dependencies; purely presentational with full interactivity.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import './YearSelector.css'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface YearSelectorProps {
  /** Controlled year value. If omitted, the component manages its own state. */
  year?: number
  onYearChange?: (year: number) => void
  minYear?: number
  maxYear?: number
  /** Specific years to render tick marks and labels for. */
  marks?: number[]
  /** Controlled play state. If omitted, the component manages it internally. */
  playing?: boolean
  onPlayToggle?: () => void
  /** Milliseconds between each year advance when playing. */
  playIntervalMs?: number
  className?: string
  style?: React.CSSProperties
}

// ─── SVG geometry (viewBox units) ─────────────────────────────────────────────

const VW   = 900
const VH   = 68
const ML   = 8
const MR   = 8
const PW   = VW - ML - MR
const TY   = 22   // y-center of the track line
const FONT = 'Avenir Next, Segoe UI, system-ui, sans-serif'

const DEFAULT_MIN  = 1950
const DEFAULT_MAX  = 2070
const DEFAULT_MARKS: readonly number[] = [1950, 1975, 2000, 2025, 2050, 2070]

// ─── Coordinate helpers ───────────────────────────────────────────────────────

function yearToX(year: number, minYear: number, maxYear: number): number {
  return ML + ((year - minYear) / (maxYear - minYear)) * PW
}

function clientXToYear(
  clientX: number,
  svg: SVGSVGElement,
  minYear: number,
  maxYear: number,
): number {
  const rect = svg.getBoundingClientRect()
  const svgX = ((clientX - rect.left) / rect.width) * VW
  const raw  = minYear + ((svgX - ML) / PW) * (maxYear - minYear)
  return Math.max(minYear, Math.min(maxYear, Math.round(raw)))
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 13 13" aria-hidden="true" focusable="false">
      <path d="M3.5 2l8 4.5-8 4.5V2z" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 13 13" aria-hidden="true" focusable="false">
      <rect x="2.5" y="2" width="3" height="9" rx="1.2" fill="currentColor" />
      <rect x="7.5" y="2" width="3" height="9" rx="1.2" fill="currentColor" />
    </svg>
  )
}

// ─── SVG timeline ─────────────────────────────────────────────────────────────

interface TimelineProps {
  year: number
  minYear: number
  maxYear: number
  marks: readonly number[]
  svgRef: React.RefObject<SVGSVGElement>
  onPointerDown: (e: React.PointerEvent<SVGSVGElement>) => void
  onPointerMove: (e: React.PointerEvent<SVGSVGElement>) => void
  onPointerUp: (e: React.PointerEvent<SVGSVGElement>) => void
  onKeyDown: (e: React.KeyboardEvent<SVGSVGElement>) => void
}

function Timeline({
  year, minYear, maxYear, marks, svgRef,
  onPointerDown, onPointerMove, onPointerUp, onKeyDown,
}: TimelineProps) {
  const cx        = yearToX(year, minYear, maxYear)
  const fillWidth = Math.max(0, cx - ML)

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      className="ysl__timeline"
      role="slider"
      aria-label="Línea de tiempo de años"
      aria-valuemin={minYear}
      aria-valuemax={maxYear}
      aria-valuenow={year}
      aria-valuetext={`Año ${year}`}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <defs>
        <linearGradient id="ysl-track-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(54,217,224,0.04)" />
          <stop offset="45%"  stopColor="rgba(54,217,224,0.18)" />
          <stop offset="100%" stopColor="rgba(54,217,224,0.04)" />
        </linearGradient>

        <linearGradient id="ysl-fill-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(54,217,224,0.35)" />
          <stop offset="100%" stopColor="rgba(54,217,224,0.7)" />
        </linearGradient>

        {/* Soft halo behind the indicator */}
        <filter id="ysl-halo" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Crisp glow for marks and core indicator */}
        <filter id="ysl-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Track base */}
      <rect
        x={ML} y={TY - 1} width={PW} height={2}
        rx={1}
        fill="url(#ysl-track-grad)"
      />

      {/* Elapsed fill */}
      <rect
        x={ML} y={TY - 1.5} width={fillWidth} height={3}
        rx={1.5}
        fill="url(#ysl-fill-grad)"
      />

      {/* Tick marks and year labels */}
      {marks.map((m) => {
        const mx      = yearToX(m, minYear, maxYear)
        const isPast  = m < year
        const isNow   = m === year
        const opacity = isNow ? 1 : isPast ? 0.5 : 0.18

        return (
          <g key={m}>
            <line
              x1={mx} y1={TY - 9} x2={mx} y2={TY + 9}
              stroke="#36d9e0"
              strokeWidth={isNow ? 1.5 : 0.75}
              opacity={opacity}
              filter={isNow ? 'url(#ysl-glow)' : undefined}
            />
            <text
              x={mx} y={TY + 26}
              textAnchor="middle"
              style={{
                fontSize: 10,
                fontFamily: FONT,
                letterSpacing: '0.06em',
                fill: '#36d9e0',
                opacity,
                fontWeight: isNow ? 700 : 400,
              }}
            >
              {m}
            </text>
          </g>
        )
      })}

      {/* Indicator outer halo */}
      <circle
        cx={cx} cy={TY} r={16}
        fill="rgba(54,217,224,0.05)"
        filter="url(#ysl-halo)"
      />

      {/* Indicator ring */}
      <circle
        cx={cx} cy={TY} r={10}
        fill="rgba(54,217,224,0.1)"
        stroke="rgba(54,217,224,0.55)"
        strokeWidth={1}
        filter="url(#ysl-glow)"
      />

      {/* Indicator core */}
      <circle
        cx={cx} cy={TY} r={6}
        fill="#36d9e0"
        filter="url(#ysl-glow)"
      />

      {/* Indicator center highlight */}
      <circle cx={cx} cy={TY} r={2.5} fill="#fff" />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function YearSelector({
  year: yearProp,
  onYearChange,
  minYear        = DEFAULT_MIN,
  maxYear        = DEFAULT_MAX,
  marks          = DEFAULT_MARKS,
  playing: playingProp,
  onPlayToggle,
  playIntervalMs = 120,
  className,
  style,
}: YearSelectorProps) {
  const [internalYear, setInternalYear]       = useState(yearProp ?? 2025)
  const [internalPlaying, setInternalPlaying] = useState(false)

  const svgRef     = useRef<SVGSVGElement>(null)
  const isDragging = useRef(false)
  const yearRef    = useRef(internalYear)

  const isYearControlled = yearProp !== undefined
  const isPlayControlled = playingProp !== undefined
  const year    = isYearControlled ? yearProp    : internalYear
  const playing = isPlayControlled ? playingProp : internalPlaying

  // Keep ref in sync so the RAF loop reads the latest value without stale closure
  useEffect(() => { yearRef.current = year }, [year])

  const setYear = useCallback((y: number) => {
    if (!isYearControlled) setInternalYear(y)
    onYearChange?.(y)
  }, [isYearControlled, onYearChange])

  const togglePlay = useCallback(() => {
    if (!isPlayControlled) setInternalPlaying((p) => !p)
    onPlayToggle?.()
  }, [isPlayControlled, onPlayToggle])

  // Auto-advance RAF loop
  useEffect(() => {
    if (!playing) return

    let frameId: number
    let lastTick = 0

    const tick = (now: number) => {
      if (now - lastTick >= playIntervalMs) {
        lastTick = now
        const next = yearRef.current + 1
        if (next > maxYear) {
          setYear(minYear)
          if (!isPlayControlled) setInternalPlaying(false)
          onPlayToggle?.()
          return
        }
        setYear(next)
      }
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [playing, playIntervalMs, maxYear, minYear, setYear, isPlayControlled, onPlayToggle])

  // Pointer events on the SVG timeline
  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return
    isDragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    setYear(clientXToYear(e.clientX, svgRef.current, minYear, maxYear))
  }, [minYear, maxYear, setYear])

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging.current || !svgRef.current) return
    setYear(clientXToYear(e.clientX, svgRef.current, minYear, maxYear))
  }, [minYear, maxYear, setYear])

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setYear(Math.min(maxYear, year + 1)) }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); setYear(Math.max(minYear, year - 1)) }
    if (e.key === ' ')          { e.preventDefault(); togglePlay() }
  }, [year, minYear, maxYear, setYear, togglePlay])

  const rootClass = ['ysl', className].filter(Boolean).join(' ')

  return (
    <figure className={rootClass} style={style} role="group" aria-label="Selector de año">

      {/* ── Decorative top edge light ─────────────────────────────────────── */}
      <span className="ysl__edge-glow" aria-hidden="true" />

      {/* ── Header: label + year value + chevron ──────────────────────────── */}
      <div className="ysl__header">
        <span className="ysl__label">Año</span>
        <div className="ysl__year-row">
          <span className="ysl__year">{year}</span>
          <svg
            className="ysl__chevron"
            width={16} height={16}
            viewBox="0 0 16 16"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M4 6.5l4 4 4-4"
              stroke="currentColor"
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* ── Controls: play button + timeline ──────────────────────────────── */}
      <div className="ysl__controls">

        <button
          className={`ysl__play-btn${playing ? ' ysl__play-btn--active' : ''}`}
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pausar animación' : 'Reproducir animación de años'}
          aria-pressed={playing}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
          {playing && <span className="ysl__pulse" aria-hidden="true" />}
        </button>

        <Timeline
          year={year}
          minYear={minYear}
          maxYear={maxYear}
          marks={marks}
          svgRef={svgRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onKeyDown={handleKeyDown}
        />

      </div>
    </figure>
  )
}
