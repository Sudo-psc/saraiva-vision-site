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

                const originalSchedule = json?.schedule;
                let perDayOverrides = {};

                if (originalSchedule && Array.isArray(originalSchedule.weekdays)) {
                    originalSchedule.weekdays.forEach(day => {
                        const dayKey = day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace('-feira', '');
                        if (dayKey === 'sabado') {
                            perDayOverrides[dayKey] = { open: '08:00', close: '12:00' };
                        } else if (dayKey !== 'domingo') {
                            perDayOverrides[dayKey] = { open: originalSchedule.open, close: originalSchedule.close };
                        } else {
                            perDayOverrides[dayKey] = { open: null, close: null };
                        }
                    });
                }

                setData({ schedule: { ...originalSchedule, perDayOverrides } });
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
