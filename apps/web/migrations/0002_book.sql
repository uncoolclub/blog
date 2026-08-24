-- 서평 글은 별도 테이블/타입 컬럼 없이 book이 NULL인지로만 구분한다.
ALTER TABLE posts ADD COLUMN book TEXT;
