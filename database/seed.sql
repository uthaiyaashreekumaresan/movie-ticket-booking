INSERT INTO genres(name) VALUES ('Sci-Fi'),('Drama'),('Mystery'),('Action') ON CONFLICT(name) DO NOTHING;
INSERT INTO movies(title,synopsis,language,duration_minutes,release_date,poster_url,rating,status,featured) VALUES
('The Last Horizon','An expedition follows a signal beyond the edge of known space.','English',128,current_date-2,'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=700&q=85',8.7,'now_showing',true),
('Neon Afterglow','Two strangers find a second chance in a city that never sleeps.','English',116,current_date-8,'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=85',8.2,'now_showing',false),
('The Quiet Wild','A missing-person case leads home to a forest full of secrets.','Tamil',142,current_date-12,'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=700&q=85',9.1,'now_showing',false),
('A Sky of Stories','A family discovers that every constellation holds a memory.','Tamil',133,current_date+24,'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=700&q=85',8.6,'coming_soon',false)
ON CONFLICT(title) DO NOTHING;
INSERT INTO movie_genres(movie_id,genre_id)
SELECT m.id,g.id FROM movies m CROSS JOIN genres g
WHERE (m.title='The Last Horizon' AND g.name='Sci-Fi') OR (m.title='Neon Afterglow' AND g.name='Drama')
   OR (m.title='The Quiet Wild' AND g.name='Mystery') OR (m.title='A Sky of Stories' AND g.name='Drama')
ON CONFLICT DO NOTHING;
INSERT INTO theatres(name,city,address) VALUES ('INOX · EA Cinemas','Chennai','Express Avenue Mall, Whites Road, Royapettah') ON CONFLICT(name,city) DO NOTHING;
INSERT INTO screens(theatre_id,name) SELECT id,'Screen 04' FROM theatres WHERE name='INOX · EA Cinemas' AND city='Chennai' ON CONFLICT(theatre_id,name) DO NOTHING;
INSERT INTO seats(screen_id,row_label,seat_number,category)
SELECT sc.id,chr(64+r),n,CASE WHEN r<=2 THEN 'premium' ELSE 'regular' END
FROM screens sc CROSS JOIN generate_series(1,5) r CROSS JOIN generate_series(1,10) n
WHERE sc.name='Screen 04' ON CONFLICT(screen_id,row_label,seat_number) DO NOTHING;
INSERT INTO shows(movie_id,screen_id,starts_at,ends_at)
SELECT m.id,sc.id,(current_date+1)+v.show_time,(current_date+1)+v.show_time+make_interval(mins=>m.duration_minutes+20)
FROM movies m CROSS JOIN screens sc CROSS JOIN (VALUES (time '10:30'),(time '14:00'),(time '18:30'),(time '21:45')) v(show_time)
WHERE m.status='now_showing' AND sc.name='Screen 04'
AND NOT EXISTS (SELECT 1 FROM shows sh WHERE sh.movie_id=m.id AND sh.screen_id=sc.id AND sh.starts_at=(current_date+1)+v.show_time);
INSERT INTO show_seat_prices(show_id,seat_id,price_minor)
SELECT sh.id,s.id,CASE WHEN s.category='premium' THEN 35000 ELSE 25000 END
FROM shows sh JOIN seats s ON s.screen_id=sh.screen_id WHERE sh.status='scheduled' ON CONFLICT DO NOTHING;
