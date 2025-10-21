import { createContext, useContext, useState, type ReactNode } from 'react'
import { theme, type Theme } from '@/constants/theme'
import { colorPalettes, type ColorPalette } from '@/constants/color-palettes'

interface ThemeContextType {
  theme: Theme
  currentPalette: ColorPalette
  setColorPalette: (paletteId: string) => void
  availablePalettes: ColorPalette[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentPalette, setCurrentPalette] = useState<ColorPalette>(colorPalettes[1])

  const setColorPalette = (paletteId: string) => {
    const palette = colorPalettes.find((p) => p.id === paletteId)
    if (palette) {
      setCurrentPalette(palette)
    }
  }

  const dynamicTheme: Theme = {
    ...theme,
    colors: currentPalette.colors,
  }

  return (
    <ThemeContext.Provider
      value={{
        theme: dynamicTheme,
        currentPalette,
        setColorPalette,
        availablePalettes: colorPalettes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context.theme
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
