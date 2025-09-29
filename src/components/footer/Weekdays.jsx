// src/components/footer/Weekdays.jsx
import React from "react";
import { getWeekdays } from "@/lib/date";

export const WeekdaysList = () => {
    const weekdays = getWeekdays();
    return (
        <ul>
            {weekdays.map((d) => (
                <li key={d}>{d}</li>
            ))}
        </ul>
    );
};
