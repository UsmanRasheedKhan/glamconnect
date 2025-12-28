-- Update existing services with professional image URLs
-- Run this SQL query in phpMyAdmin or your MySQL client

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop' WHERE service_name = 'Basic Haircut';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop' WHERE service_name = 'Hair Coloring';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=400&fit=crop' WHERE service_name = 'Hair Styling';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop' WHERE service_name = 'Manicure';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&h=400&fit=crop' WHERE service_name = 'Pedicure';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=400&fit=crop' WHERE service_name = 'Nail Art Design';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop' WHERE service_name = 'Makeup Application';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&h=400&fit=crop' WHERE service_name = 'Bridal Makeup';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop' WHERE service_name = 'Facial Treatment';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=400&fit=crop' WHERE service_name = 'Deep Cleansing Facial';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop' WHERE service_name = 'Full Body Massage';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop' WHERE service_name = 'Head & Neck Massage';

-- Alternative: Update all services at once with a default image if exact name match isn't found
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop' 
WHERE (image_url IS NULL OR image_url = '') AND category = 'Hair';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop' 
WHERE (image_url IS NULL OR image_url = '') AND category = 'Nails';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop' 
WHERE (image_url IS NULL OR image_url = '') AND category = 'Makeup';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop' 
WHERE (image_url IS NULL OR image_url = '') AND category = 'Facials';

UPDATE services SET image_url = 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop' 
WHERE (image_url IS NULL OR image_url = '') AND category = 'Massage';

-- If you want a fallback for all remaining services
UPDATE services SET image_url = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop' 
WHERE image_url IS NULL OR image_url = '';
