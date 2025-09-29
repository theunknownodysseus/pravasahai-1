/*
  # Seed Initial Data for Kerala Migrant Health Dashboard

  1. Districts Data
    - All 14 Kerala districts with demographics and risk ratings
  
  2. Sample Hospitals
    - Representative hospitals across different districts
    
  3. Sample Disease Cases
    - Test data for dashboard functionality
*/

-- Insert Kerala districts
INSERT INTO districts (district_name, region, coordinates, demographics, infrastructure, risk_ratings) VALUES
('Thiruvananthapuram', 'South', '{"lat": 8.5241, "lon": 76.9366}', '{"population_2023": 3354534, "total_emigrants_2023": 107917, "migrant_density_per_1000": 32.2}', '{"piped_water_pct": 28.1, "own_well_pct": 52.3, "community_water_pct": 15.2}', '{"water_risk": 7.2, "sanitation_risk": 5.8, "crowding_risk": 3.2, "overall_risk": 5.1}'),
('Kollam', 'South', '{"lat": 8.8932, "lon": 76.6141}', '{"population_2023": 2659431, "total_emigrants_2023": 125234, "migrant_density_per_1000": 47.1}', '{"piped_water_pct": 32.4, "own_well_pct": 48.9, "community_water_pct": 14.7}', '{"water_risk": 6.8, "sanitation_risk": 6.2, "crowding_risk": 4.1, "overall_risk": 5.7}'),
('Pathanamthitta', 'Central', '{"lat": 9.2648, "lon": 76.7870}', '{"population_2023": 1197412, "total_emigrants_2023": 89234, "migrant_density_per_1000": 74.5}', '{"piped_water_pct": 41.2, "own_well_pct": 45.3, "community_water_pct": 10.5}', '{"water_risk": 5.4, "sanitation_risk": 4.9, "crowding_risk": 2.8, "overall_risk": 4.4}'),
('Alappuzha', 'Central', '{"lat": 9.4981, "lon": 76.3388}', '{"population_2023": 2121943, "total_emigrants_2023": 156789, "migrant_density_per_1000": 73.9}', '{"piped_water_pct": 29.8, "own_well_pct": 51.2, "community_water_pct": 16.3}', '{"water_risk": 7.8, "sanitation_risk": 6.5, "crowding_risk": 5.2, "overall_risk": 6.5}'),
('Kottayam', 'Central', '{"lat": 9.5916, "lon": 76.5222}', '{"population_2023": 1974551, "total_emigrants_2023": 142356, "migrant_density_per_1000": 72.1}', '{"piped_water_pct": 38.7, "own_well_pct": 46.8, "community_water_pct": 12.5}', '{"water_risk": 6.1, "sanitation_risk": 5.3, "crowding_risk": 3.7, "overall_risk": 5.0}'),
('Idukki', 'Central', '{"lat": 9.8514, "lon": 76.8267}', '{"population_2023": 1108974, "total_emigrants_2023": 67823, "migrant_density_per_1000": 61.2}', '{"piped_water_pct": 45.3, "own_well_pct": 41.7, "community_water_pct": 11.0}', '{"water_risk": 4.8, "sanitation_risk": 4.2, "crowding_risk": 2.1, "overall_risk": 3.7}'),
('Ernakulam', 'Central', '{"lat": 10.1632, "lon": 76.6413}', '{"population_2023": 3279860, "total_emigrants_2023": 198456, "migrant_density_per_1000": 60.5}', '{"piped_water_pct": 52.1, "own_well_pct": 35.4, "community_water_pct": 10.5}', '{"water_risk": 5.9, "sanitation_risk": 4.8, "crowding_risk": 6.3, "overall_risk": 5.7}'),
('Thrissur', 'Central', '{"lat": 10.5276, "lon": 76.2144}', '{"population_2023": 3121200, "total_emigrants_2023": 167893, "migrant_density_per_1000": 53.8}', '{"piped_water_pct": 43.6, "own_well_pct": 42.8, "community_water_pct": 12.6}', '{"water_risk": 6.3, "sanitation_risk": 5.7, "crowding_risk": 4.9, "overall_risk": 5.6}'),
('Palakkad', 'North', '{"lat": 10.7867, "lon": 76.6548}', '{"population_2023": 2809934, "total_emigrants_2023": 134567, "migrant_density_per_1000": 47.9}', '{"piped_water_pct": 36.2, "own_well_pct": 47.5, "community_water_pct": 14.3}', '{"water_risk": 6.7, "sanitation_risk": 6.1, "crowding_risk": 3.8, "overall_risk": 5.5}'),
('Malappuram', 'North', '{"lat": 11.0510, "lon": 76.0711}', '{"population_2023": 4112920, "total_emigrants_2023": 289345, "migrant_density_per_1000": 70.3}', '{"piped_water_pct": 31.4, "own_well_pct": 49.8, "community_water_pct": 16.8}', '{"water_risk": 7.4, "sanitation_risk": 6.9, "crowding_risk": 5.8, "overall_risk": 6.7}'),
('Kozhikode', 'North', '{"lat": 11.2588, "lon": 75.7804}', '{"population_2023": 3086293, "total_emigrants_2023": 234567, "migrant_density_per_1000": 76.0}', '{"piped_water_pct": 39.8, "own_well_pct": 44.2, "community_water_pct": 14.0}', '{"water_risk": 6.5, "sanitation_risk": 5.9, "crowding_risk": 5.1, "overall_risk": 5.8}'),
('Wayanad', 'North', '{"lat": 11.6054, "lon": 76.0962}', '{"population_2023": 817420, "total_emigrants_2023": 45678, "migrant_density_per_1000": 55.9}', '{"piped_water_pct": 41.7, "own_well_pct": 43.8, "community_water_pct": 12.5}', '{"water_risk": 5.8, "sanitation_risk": 5.2, "crowding_risk": 2.9, "overall_risk": 4.6}'),
('Kannur', 'North', '{"lat": 11.8745, "lon": 75.3704}', '{"population_2023": 2523003, "total_emigrants_2023": 178912, "migrant_density_per_1000": 70.9}', '{"piped_water_pct": 37.4, "own_well_pct": 46.1, "community_water_pct": 14.5}', '{"water_risk": 6.8, "sanitation_risk": 6.3, "crowding_risk": 4.7, "overall_risk": 5.9}'),
('Kasaragod', 'North', '{"lat": 12.4996, "lon": 75.0127}', '{"population_2023": 1307375, "total_emigrants_2023": 89234, "migrant_density_per_1000": 68.2}', '{"piped_water_pct": 35.9, "own_well_pct": 47.8, "community_water_pct": 14.3}', '{"water_risk": 6.9, "sanitation_risk": 6.4, "crowding_risk": 3.5, "overall_risk": 5.6}')
ON CONFLICT (district_name) DO NOTHING;

-- Insert sample hospitals
INSERT INTO hospitals (hospital_id, name, district, type, bed_capacity, coordinates, monthly_capacity) VALUES
('THI_H01', 'Government Medical College Hospital', 'Thiruvananthapuram', 'Government Hospital', 1200, '{"lat": 8.5294, "lon": 76.9362}', 2400),
('THI_H02', 'SCTIMST', 'Thiruvananthapuram', 'Specialized Hospital', 300, '{"lat": 8.5447, "lon": 76.9067}', 600),
('KOL_H01', 'Kollam District Hospital', 'Kollam', 'Government Hospital', 800, '{"lat": 8.8932, "lon": 76.6141}', 1600),
('ERN_H01', 'Ernakulam Medical Centre', 'Ernakulam', 'Private Hospital', 500, '{"lat": 10.1632, "lon": 76.6413}', 1000),
('ERN_H02', 'Aster Medcity', 'Ernakulam', 'Private Hospital', 670, '{"lat": 10.0889, "lon": 76.3072}', 1340),
('THR_H01', 'Thrissur District Hospital', 'Thrissur', 'Government Hospital', 600, '{"lat": 10.5276, "lon": 76.2144}', 1200),
('KOZ_H01', 'Kozhikode Medical College', 'Kozhikode', 'Government Hospital', 1000, '{"lat": 11.2588, "lon": 75.7804}', 2000),
('MAL_H01', 'Malappuram District Hospital', 'Malappuram', 'Government Hospital', 750, '{"lat": 11.0510, "lon": 76.0711}', 1500),
('PAL_H01', 'Palakkad District Hospital', 'Palakkad', 'Government Hospital', 650, '{"lat": 10.7867, "lon": 76.6548}', 1300),
('KAN_H01', 'Kannur Medical College', 'Kannur', 'Government Hospital', 900, '{"lat": 11.8745, "lon": 75.3704}', 1800)
ON CONFLICT (hospital_id) DO NOTHING;