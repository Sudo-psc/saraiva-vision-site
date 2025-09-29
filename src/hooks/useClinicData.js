// src/hooks/useClinicData.js
import { useEffect, useState } from "react";
import { getWeekdays } from "@/lib/date";

export function useClinicData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                // Mocked data
                const json = {
                    schedule: {
                        weekdays: getWeekdays(),
                        open: "08:00",
                        close: "18:00"
                    }
                };
                if (!active) return;
                const schedule = json?.schedule && Array.isArray(json.schedule.weekdays)
                    ? json.schedule
                    : { weekdays: undefined };
                setData({ schedule });
            } catch (e) {
                setData({ schedule: { weekdays: undefined } });
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    return { data, loading };
}
