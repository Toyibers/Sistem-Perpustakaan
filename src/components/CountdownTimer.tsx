import { useState, useEffect } from "react";
import { isPast, differenceInSeconds } from "date-fns";
import { cn } from "../utils/cn";

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
  isFrozen?: boolean;
  frozenAtDate?: string | null;
}

export default function CountdownTimer({ targetDate, className, isFrozen, frozenAtDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLate: false,
    rawDiff: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // If frozen and we have a specific frozen date, calculate relative to that
      const referenceDate = (isFrozen && frozenAtDate) ? new Date(frozenAtDate) : new Date();
      const difference = differenceInSeconds(new Date(targetDate), referenceDate);
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLate: true, rawDiff: difference });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (24 * 60 * 60)),
        hours: Math.floor((difference / (60 * 60)) % 24),
        minutes: Math.floor((difference / 60) % 60),
        seconds: Math.floor(difference % 60),
        isLate: false,
        rawDiff: difference,
      });
    };

    calculateTimeLeft(); // Initial calculation
    
    if (!isFrozen) {
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    }
  }, [targetDate, isFrozen, frozenAtDate]);

  if (timeLeft.isLate) {
    if (isFrozen && timeLeft.rawDiff < 0) {
      // If it's frozen BUT was returned late, meaning rawDiff is negative, compute lateness
      const absDiff = Math.abs(timeLeft.rawDiff);
      const lateDays = Math.floor(absDiff / (24 * 60 * 60));
      const lateHours = Math.floor((absDiff / (60 * 60)) % 24);
      const lateMinutes = Math.floor((absDiff / 60) % 60);
      const lateSeconds = Math.floor(absDiff % 60);

      return (
        <span className={cn("font-bold text-red-600 font-mono tracking-tight", className)}>
          - {lateDays > 0 ? `${lateDays}h ` : ''}
          {lateHours.toString().padStart(2, '0')}:
          {lateMinutes.toString().padStart(2, '0')}:
          {lateSeconds.toString().padStart(2, '0')}
        </span>
      );
    }
    
    return (
      <span className={cn("font-bold text-red-500", className)}>
        {isFrozen ? "0h 00:00:00" : "Terlambat"}
      </span>
    );
  }

  return (
    <span className={cn("font-mono font-bold tracking-tight", isFrozen ? "text-blue-600" : "text-emerald-600", className)}>
      {timeLeft.days > 0 && `${timeLeft.days}h `}
      {timeLeft.hours.toString().padStart(2, '0')}:
      {timeLeft.minutes.toString().padStart(2, '0')}:
      {timeLeft.seconds.toString().padStart(2, '0')}
    </span>
  );
}
