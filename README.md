
# Countdown Timer Component

This React component implements a countdown timer with days, hours, minutes, and seconds. It allows users to start, pause, and reset the timer.

## Features

* Displays a countdown timer in days, hours, minutes, and seconds.
* Allows users to input initial values for the countdown.
* Start/Pause button toggles the timer.
* Reset button resets the timer to its initial values.
* Uses `lucide-react` for icons.
* Styled with Tailwind CSS.
* Use webps instead of pngs for storage optimization.


## Installation

1. Install the required dependencies:

```bash
npm install lucide-react tailwindcss autoprefixer postcss
# or
yarn add lucide-react tailwindcss autoprefixer postcss
```

2. Configure Tailwind CSS (follow the Tailwind CSS installation instructions for your project).

## Usage

set timers 
## Props

| Prop             | Type   | Description                                     | Default |
|-----------------|--------|-------------------------------------------------|---------|
| `initialDays`   | number | Initial number of days.                        | `0`     |
| `initialHours`  | number | Initial number of hours.                       | `0`     |
| `initialMinutes`| number | Initial number of minutes.                     | `0`     |
| `initialSeconds`| number | Initial number of seconds.                     | `0`     |

## Component Structure

* **State:** Uses `useState` to manage `days`, `hours`, `minutes`, `seconds`, and `isRunning`.
* **useEffect:** Implements the timer logic using `setInterval` and `clearInterval`.  Clears the interval on unmount or dependency change to prevent memory leaks.
* **JSX:** Renders the timer display, input fields for setting initial values, and control buttons (Start/Pause, Reset).
* **Styling:** Uses Tailwind CSS for styling.
* **Icons:** Uses `lucide-react` for icons (Clock, Play, Pause, Refresh).


## License

MIT
