'use client'

import Timer from "./components/Timer";
import BackgroundSelector from "./components/Background";
import Settings from "./components/Settings";
import { useState } from "react";

export default function Home() {
  const [durations, setDurations] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 10 * 60,
  });

  return (
<>
      <BackgroundSelector />
      <Settings setDurations={setDurations} />
      <Timer durations={durations} />

</>
  );
}
