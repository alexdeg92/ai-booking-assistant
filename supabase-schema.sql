-- ===============================================
-- BookIA - Supabase Database Schema
-- AI Booking Assistant Backend
-- ===============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- ===============================================
-- SERVICES TABLE
-- ===============================================
CREATE TABLE services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'coupe', 'coloration'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price_cents INTEGER NOT NULL, -- store in cents to avoid float precision issues
    icon VARCHAR(10) DEFAULT '✂️',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- STAFF TABLE
-- ===============================================
CREATE TABLE staff (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'marie', 'julien'
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    specialty VARCHAR(255),
    avatar_emoji VARCHAR(10) DEFAULT '👨‍💼',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- STAFF_SERVICES (Many-to-Many relationship)
-- ===============================================
CREATE TABLE staff_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(staff_id, service_id)
);

-- ===============================================
-- CUSTOMERS TABLE
-- ===============================================
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- AVAILABILITY TABLE (Staff working hours/schedule)
-- ===============================================
CREATE TABLE availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(staff_id, day_of_week, start_time)
);

-- ===============================================
-- BOOKINGS TABLE
-- ===============================================
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_reference VARCHAR(10) UNIQUE NOT NULL, -- Short booking ref like "BK001234"
    customer_id UUID NOT NULL REFERENCES customers(id),
    service_id UUID NOT NULL REFERENCES services(id),
    staff_id UUID REFERENCES staff(id), -- NULL if "any staff" preference
    assigned_staff_id UUID REFERENCES staff(id), -- Actually assigned staff
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price_cents INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    customer_name VARCHAR(255) NOT NULL, -- Denormalized for quick access
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    notes TEXT,
    reminder_sent_24h BOOLEAN DEFAULT false,
    reminder_sent_1h BOOLEAN DEFAULT false,
    email_confirmation_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- BLOCKED_TIMES TABLE (For breaks, holidays, etc.)
-- ===============================================
CREATE TABLE blocked_times (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staff_id UUID REFERENCES staff(id), -- NULL for business-wide blocks
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT, -- RRULE format for recurring blocks
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- EMAIL_CONFIRMATIONS TABLE (Email tracking)
-- ===============================================
CREATE TABLE email_confirmations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL, -- 'confirmation', 'reminder_24h', 'reminder_1h', 'cancellation'
    recipient_email VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced'))
);

-- ===============================================
-- INDEXES for Performance
-- ===============================================
CREATE INDEX idx_bookings_date_time ON bookings(booking_date, booking_time);
CREATE INDEX idx_bookings_staff_date ON bookings(assigned_staff_id, booking_date);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_availability_staff_day ON availability(staff_id, day_of_week);
CREATE INDEX idx_blocked_times_staff_datetime ON blocked_times(staff_id, start_datetime, end_datetime);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

-- ===============================================
-- AUTO-UPDATE TRIGGERS
-- ===============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply auto-update triggers to all tables with updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocked_times_updated_at BEFORE UPDATE ON blocked_times
    FOR EACH ROW EXECUTE FUNCTION update_blocked_times_updated_at_column();

-- ===============================================
-- UTILITY FUNCTIONS
-- ===============================================

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
DECLARE
    ref TEXT;
    counter INTEGER;
BEGIN
    -- Get current count of bookings today
    SELECT COUNT(*) INTO counter 
    FROM bookings 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Generate reference: BK + YYYYMMDD + counter
    ref := 'BK' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD((counter + 1)::text, 3, '0');
    
    -- Ensure uniqueness
    WHILE EXISTS(SELECT 1 FROM bookings WHERE booking_reference = ref) LOOP
        counter := counter + 1;
        ref := 'BK' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD((counter + 1)::text, 3, '0');
    END LOOP;
    
    RETURN ref;
END;
$$ language 'plpgsql';

-- Function to check staff availability
CREATE OR REPLACE FUNCTION is_staff_available(
    p_staff_id UUID,
    p_date DATE,
    p_start_time TIME,
    p_duration_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    day_of_week INTEGER;
    end_time TIME;
    working_today BOOLEAN := false;
    conflicting_bookings INTEGER;
    blocked_periods INTEGER;
BEGIN
    day_of_week := EXTRACT(DOW FROM p_date); -- 0=Sunday, 6=Saturday
    end_time := p_start_time + (p_duration_minutes || ' minutes')::INTERVAL;
    
    -- Check if staff works this day of week
    SELECT EXISTS(
        SELECT 1 FROM availability 
        WHERE staff_id = p_staff_id 
        AND day_of_week = day_of_week 
        AND is_active = true
        AND p_start_time >= start_time 
        AND end_time <= end_time
    ) INTO working_today;
    
    IF NOT working_today THEN
        RETURN false;
    END IF;
    
    -- Check for conflicting bookings
    SELECT COUNT(*) INTO conflicting_bookings
    FROM bookings
    WHERE assigned_staff_id = p_staff_id
    AND booking_date = p_date
    AND status IN ('confirmed')
    AND (
        (booking_time <= p_start_time AND (booking_time + (duration_minutes || ' minutes')::INTERVAL)::TIME > p_start_time)
        OR
        (booking_time < end_time AND booking_time >= p_start_time)
    );
    
    IF conflicting_bookings > 0 THEN
        RETURN false;
    END IF;
    
    -- Check for blocked times
    SELECT COUNT(*) INTO blocked_periods
    FROM blocked_times
    WHERE (staff_id = p_staff_id OR staff_id IS NULL)
    AND p_date::TIMESTAMP + p_start_time::TIME BETWEEN start_datetime AND end_datetime;
    
    IF blocked_periods > 0 THEN
        RETURN false;
    END IF;
    
    RETURN true;
END;
$$ language 'plpgsql';

-- ===============================================
-- SAMPLE DATA (Based on current frontend)
-- ===============================================

-- Insert Services
INSERT INTO services (code, name, description, duration_minutes, price_cents, icon) VALUES
('coupe', 'Coupe femme', 'Coupe de cheveux pour femmes', 45, 5500, '✂️'),
('coloration', 'Coloration complète', 'Coloration complète des cheveux', 90, 12000, '🎨'),
('meches', 'Mèches / Balayage', 'Mèches ou balayage professionnel', 120, 15000, '✨'),
('brushing', 'Brushing', 'Séchage et coiffage', 30, 3500, '💇'),
('soin', 'Soin capillaire', 'Soin hydratant pour cheveux', 60, 8000, '💆'),
('barbe', 'Taille de barbe', 'Taille et entretien de barbe', 20, 2500, '🧔');

-- Insert Staff
INSERT INTO staff (code, name, specialty, avatar_emoji) VALUES
('marie', 'Marie L.', 'Coloriste', '👩‍🎨'),
('julien', 'Julien D.', 'Coiffeur senior', '💇‍♂️'),
('sophie', 'Sophie R.', 'Spécialiste soins', '💆‍♀️');

-- Get staff and service IDs for relationships
DO $$ 
DECLARE
    marie_id UUID;
    julien_id UUID;
    sophie_id UUID;
    coupe_id UUID;
    coloration_id UUID;
    meches_id UUID;
    brushing_id UUID;
    soin_id UUID;
    barbe_id UUID;
BEGIN
    SELECT id INTO marie_id FROM staff WHERE code = 'marie';
    SELECT id INTO julien_id FROM staff WHERE code = 'julien';
    SELECT id INTO sophie_id FROM staff WHERE code = 'sophie';
    
    SELECT id INTO coupe_id FROM services WHERE code = 'coupe';
    SELECT id INTO coloration_id FROM services WHERE code = 'coloration';
    SELECT id INTO meches_id FROM services WHERE code = 'meches';
    SELECT id INTO brushing_id FROM services WHERE code = 'brushing';
    SELECT id INTO soin_id FROM services WHERE code = 'soin';
    SELECT id INTO barbe_id FROM services WHERE code = 'barbe';
    
    -- Marie (Coloriste) - Specializes in coloration and hair services
    INSERT INTO staff_services (staff_id, service_id) VALUES
    (marie_id, coloration_id),
    (marie_id, meches_id),
    (marie_id, coupe_id),
    (marie_id, soin_id);
    
    -- Julien (Coiffeur senior) - All services including men's
    INSERT INTO staff_services (staff_id, service_id) VALUES
    (julien_id, coupe_id),
    (julien_id, brushing_id),
    (julien_id, barbe_id),
    (julien_id, coloration_id);
    
    -- Sophie (Spécialiste soins) - Hair care and treatments
    INSERT INTO staff_services (staff_id, service_id) VALUES
    (sophie_id, soin_id),
    (sophie_id, brushing_id),
    (sophie_id, coupe_id);
    
    -- Set up standard working hours (Tuesday to Saturday, 9AM-6PM)
    -- Marie
    FOR day_num IN 2..6 LOOP -- Tuesday to Saturday
        INSERT INTO availability (staff_id, day_of_week, start_time, end_time) 
        VALUES (marie_id, day_num, '09:00'::TIME, '18:00'::TIME);
    END LOOP;
    
    -- Julien
    FOR day_num IN 2..6 LOOP -- Tuesday to Saturday
        INSERT INTO availability (staff_id, day_of_week, start_time, end_time) 
        VALUES (julien_id, day_num, '09:00'::TIME, '18:00'::TIME);
    END LOOP;
    
    -- Sophie (part-time: Tuesday, Thursday, Friday, Saturday)
    INSERT INTO availability (staff_id, day_of_week, start_time, end_time) VALUES
    (sophie_id, 2, '09:00'::TIME, '17:00'::TIME), -- Tuesday
    (sophie_id, 4, '09:00'::TIME, '17:00'::TIME), -- Thursday
    (sophie_id, 5, '09:00'::TIME, '17:00'::TIME), -- Friday
    (sophie_id, 6, '10:00'::TIME, '16:00'::TIME); -- Saturday
    
END $$;

-- ===============================================
-- ROW LEVEL SECURITY (Optional - for multi-tenant)
-- ===============================================

-- Enable RLS on sensitive tables
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Example policy (customize based on your auth system)
-- CREATE POLICY "Users can view their own bookings" ON bookings
-- FOR SELECT USING (auth.email() = customer_email);

-- ===============================================
-- COMMENTS for Documentation
-- ===============================================

COMMENT ON TABLE services IS 'Available services offered by the business';
COMMENT ON TABLE staff IS 'Staff members who can provide services';
COMMENT ON TABLE staff_services IS 'Many-to-many relationship between staff and services they can provide';
COMMENT ON TABLE customers IS 'Customer information';
COMMENT ON TABLE availability IS 'Staff working schedule by day of week';
COMMENT ON TABLE bookings IS 'Customer bookings/appointments';
COMMENT ON TABLE blocked_times IS 'Time periods when staff are unavailable (breaks, holidays, etc.)';
COMMENT ON TABLE email_confirmations IS 'Tracking of email notifications sent';

COMMENT ON COLUMN bookings.booking_reference IS 'Short human-readable booking reference (e.g., BK20260214001)';
COMMENT ON COLUMN bookings.staff_id IS 'Preferred staff member (NULL for no preference)';
COMMENT ON COLUMN bookings.assigned_staff_id IS 'Actually assigned staff member';
COMMENT ON COLUMN bookings.price_cents IS 'Price in cents to avoid floating point precision issues';
COMMENT ON COLUMN availability.day_of_week IS '0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday';

-- ===============================================
-- END OF SCHEMA
-- ===============================================