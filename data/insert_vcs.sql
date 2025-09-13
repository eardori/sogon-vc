
INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '해시드',
  'hashed.com',
  ARRAY['seed', 'pre_a', 'series_a']::investment_round[],
  'https://www.hashed.com/',
  '액셀러레이터 / 한국',
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '한화투자증권',
  'hanwhawm.com',
  ARRAY['series_a', 'series_b', 'series_c']::investment_round[],
  'https://www.hanwhawm.com/',
  '금융회사 / 한국',
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '에스오에스벤처스',
  'sosv.com',
  ARRAY['seed', 'pre_a', 'series_a']::investment_round[],
  'https://sosv.com/',
  '벤처캐피탈 / 미국',
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '본엔젤스벤처파트너스',
  'bonangels.net',
  ARRAY['seed', 'pre_a', 'series_a']::investment_round[],
  'http://www.bonangels.net/',
  '벤처캐피탈 / 한국',
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '에스비브이에이',
  NULL,
  ARRAY['pre_a', 'series_a', 'series_b']::investment_round[],
  NULL,
  '벤처캐피탈 / 일본',
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '알토스벤처스',
  NULL,
  ARRAY['series_a', 'series_b', 'series_c']::investment_round[],
  NULL,
  '벤처캐피탈 / 미국',
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '케이비인베스트먼트',
  NULL,
  ARRAY['pre_a', 'series_a', 'series_b']::investment_round[],
  NULL,
  '벤처캐피탈 / 한국',
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '쏠리드엑스',
  NULL,
  ARRAY['seed', 'pre_a', 'series_a']::investment_round[],
  NULL,
  '기업벤처캐피탈 / 한국',
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '그래비티벤처스',
  NULL,
  ARRAY['seed', 'pre_a', 'series_a']::investment_round[],
  NULL,
  '벤처캐피탈 / 한국',
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '스타벤처스',
  NULL,
  ARRAY['seed', 'pre_a', 'series_a']::investment_round[],
  NULL,
  '액셀러레이터 / 한국',
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();