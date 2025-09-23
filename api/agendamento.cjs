
const express = require('express');
const router = express.Router();
const { supabase } = require('./utils/supabase.cjs');

// Route for /api/agendamento/servicos
router.get('/servicos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('servicos')
      .select('*');

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for /api/agendamento/horarios
router.get('/horarios', async (req, res) => {
  try {
    const { service_id, date } = req.query;

    if (!service_id || !date) {
      return res.status(400).json({ error: 'service_id and date are required' });
    }

    // In a real scenario, you would fetch available time slots from your database
    // based on the service_id and date, considering existing appointments and service duration.
    // For now, let's return some dummy data.

    const dummyTimeSlots = [
      { time: '09:00', available: true },
      { time: '10:00', available: false },
      { time: '11:00', available: true },
      { time: '14:00', available: true },
      { time: '15:00', available: false },
      { time: '16:00', available: true },
    ];

    res.json(dummyTimeSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for POST /api/agendamento - Book an appointment
router.post('/', async (req, res) => {
  try {
    const { service_id, user_name, user_email, start_time, end_time } = req.body;

    if (!service_id || !user_name || !user_email || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .insert([{ service_id, user_name, user_email, start_time, end_time, status: 'confirmed' }])
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for POST /api/agendamento/cancelar - Cancel an appointment
router.post('/cancelar', async (req, res) => {
  try {
    const { appointment_id } = req.body;

    if (!appointment_id) {
      return res.status(400).json({ error: 'appointment_id is required' });
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .update({ status: 'cancelled' })
      .eq('id', appointment_id)
      .select();

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Appointment cancelled successfully', appointment: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
