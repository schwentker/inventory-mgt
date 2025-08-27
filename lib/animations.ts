"use client"

// Animation utilities that respect user preferences
export const getAnimationClass = (baseClass: string, reducedMotionClass?: string) => {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return reducedMotionClass || ""
  }
  return baseClass
}

export const animationClasses = {
  // Fade animations
  fadeIn: "animate-in fade-in duration-300",
  fadeOut: "animate-out fade-out duration-200",

  // Slide animations
  slideInFromTop: "animate-in slide-in-from-top-2 duration-300",
  slideInFromBottom: "animate-in slide-in-from-bottom-2 duration-300",
  slideInFromLeft: "animate-in slide-in-from-left-2 duration-300",
  slideInFromRight: "animate-in slide-in-from-right-2 duration-300",

  // Scale animations
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-150",

  // Bounce animations
  bounceIn: "animate-in zoom-in-50 duration-300 ease-out",

  // Hover transitions
  hoverScale: "transition-transform duration-200 hover:scale-105",
  hoverLift: "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
  hoverGlow: "transition-all duration-200 hover:shadow-md hover:shadow-primary/20",

  // Loading animations
  pulse: "animate-pulse",
  spin: "animate-spin",
  bounce: "animate-bounce",

  // Micro-interactions
  buttonPress: "transition-all duration-100 active:scale-95",
  cardHover: "transition-all duration-200 hover:shadow-md hover:border-primary/20",
  inputFocus: "transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary",
}

// Stagger animation utility for lists
export const getStaggerDelay = (index: number, baseDelay = 50) => ({
  animationDelay: `${index * baseDelay}ms`,
})

// Spring animation configurations
export const springConfig = {
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
}
