const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diacyxklbvniikuwywdv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYWN5eGtsYnZuaWlrdXd5d2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY3MTc5NywiZXhwIjoyMDczMjQ3Nzk3fQ.DMOvj8-4Rhy_PHJrtWhpW6-C9q6cLqfBaghnwHikq3Y'
);

// 투자 단계 매핑 (DB enum과 일치시키기)
function mapInvestmentStages(stages) {
  const stageMapping = {
    'Seed': 'seed',
    'Pre-A': 'pre_a',
    'Series A': 'series_a',
    'Series B': 'series_b',
    'Series C': 'series_c',
    'Series D': 'series_d',
    'Angel': 'angel'
  };
  
  const mappedStages = [];
  
  // stages가 문자열인 경우 (예: "Seed37개사Series A22개사")
  if (typeof stages === 'string') {
    Object.keys(stageMapping).forEach(key => {
      if (stages.includes(key)) {
        mappedStages.push(stageMapping[key]);
      }
    });
  } else if (Array.isArray(stages)) {
    stages.forEach(stage => {
      Object.keys(stageMapping).forEach(key => {
        if (stage.includes(key)) {
          mappedStages.push(stageMapping[key]);
        }
      });
    });
  }
  
  return [...new Set(mappedStages)]; // 중복 제거
}

// VC 타입 정규화
function normalizeVCType(type) {
  const typeMapping = {
    '벤처캐피탈': 'VC',
    '액셀러레이터': 'Accelerator',
    '기업벤처캐피탈': 'CVC',
    '금융회사': 'Financial Institution',
    'VC': 'VC',
    'Accelerator': 'Accelerator',
    'CVC': 'CVC'
  };
  
  return typeMapping[type] || type;
}

// 홈페이지 URL에서 도메인 추출
async function fetchWebsiteFromProfile(profileUrl) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    await page.goto(profileUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 홈페이지 URL 찾기
    const website = await page.evaluate(() => {
      // 다양한 패턴으로 홈페이지 링크 찾기
      const patterns = [
        'a[href*="ref=thevc"]',
        'a[href^="http"]:not([href*="thevc"]):not([href*="facebook"]):not([href*="linkedin"]):not([href*="twitter"])',
        'a[target="_blank"]'
      ];
      
      for (const pattern of patterns) {
        const links = document.querySelectorAll(pattern);
        for (const link of links) {
          const href = link.href;
          if (href && !href.includes('thevc.kr') && 
              (href.includes('http://') || href.includes('https://'))) {
            return href.replace('?ref=thevc', '');
          }
        }
      }
      return null;
    });
    
    return website;
    
  } catch (error) {
    console.error(`Error fetching website from ${profileUrl}:`, error.message);
    return null;
  } finally {
    await browser.close();
  }
}

async function processVCData() {
  try {
    // 1. 수집된 데이터 읽기
    const dataPath = path.join(__dirname, '..', 'data', 'all_vcs_thevc.json');
    const rawData = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log(`📊 Processing ${data.total_count} VCs...`);
    
    // 2. 각 VC에 대해 홈페이지 URL 수집 및 도메인 추출
    const processedVCs = [];
    
    for (let i = 0; i < data.vcs.length; i++) {
      const vc = data.vcs[i];
      console.log(`\n[${i + 1}/${data.vcs.length}] Processing ${vc.name}...`);
      
      // 이름 정리 (상장/비상장 제거)
      const cleanName = vc.name.replace(/상장|비상장/g, '').trim();
      
      // 홈페이지 URL 가져오기
      let websiteUrl = vc.website;
      if (!websiteUrl && vc.profile_url) {
        console.log(`  Fetching website from profile...`);
        websiteUrl = await fetchWebsiteFromProfile(vc.profile_url);
        
        if (websiteUrl) {
          console.log(`  ✓ Found website: ${websiteUrl}`);
        } else {
          console.log(`  ✗ No website found`);
        }
      }
      
      // 도메인 추출
      let emailDomain = null;
      if (websiteUrl) {
        try {
          const url = new URL(websiteUrl);
          emailDomain = url.hostname.replace('www.', '');
          console.log(`  ✓ Email domain: ${emailDomain}`);
        } catch (e) {
          console.log(`  ✗ Invalid URL: ${websiteUrl}`);
        }
      }
      
      // 투자 단계 매핑
      const stages = mapInvestmentStages(vc.stages);
      
      // 투자 건수 정리 (숫자만 추출)
      const investmentCount = vc.investment_count ? 
        parseInt(vc.investment_count.replace(/[^0-9]/g, '')) : null;
      
      processedVCs.push({
        name: cleanName,
        type: normalizeVCType(vc.type),
        country: vc.country || '한국',
        website: websiteUrl,
        email_domain: emailDomain,
        main_investment_stages: stages,
        investment_count: investmentCount,
        portfolio_count: parseInt(vc.portfolio_count) || null,
        description: `${vc.type} / ${vc.country}`,
        is_active: true
      });
    }
    
    // 3. 처리된 데이터 저장
    const processedPath = path.join(__dirname, '..', 'data', 'processed_vcs.json');
    await fs.writeFile(processedPath, JSON.stringify(processedVCs, null, 2));
    console.log(`\n💾 Processed data saved to: ${processedPath}`);
    
    // 4. 통계 출력
    console.log('\n📈 Processing Statistics:');
    console.log(`Total VCs: ${processedVCs.length}`);
    console.log(`With website: ${processedVCs.filter(vc => vc.website).length}`);
    console.log(`With email domain: ${processedVCs.filter(vc => vc.email_domain).length}`);
    
    // 5. DB에 삽입할 SQL 생성
    console.log('\n🔨 Generating SQL for database insertion...');
    
    const sqlStatements = processedVCs.map(vc => {
      const stages = vc.main_investment_stages.length > 0 ? 
        `ARRAY[${vc.main_investment_stages.map(s => `'${s}'`).join(', ')}]::investment_round[]` : 
        'NULL';
      
      return `
INSERT INTO vcs (name, email_domain, main_investment_stages, website, description, is_active)
VALUES (
  '${vc.name.replace(/'/g, "''")}',
  ${vc.email_domain ? `'${vc.email_domain}'` : 'NULL'},
  ${stages},
  ${vc.website ? `'${vc.website}'` : 'NULL'},
  ${vc.description ? `'${vc.description.replace(/'/g, "''")}'` : 'NULL'},
  true
)
ON CONFLICT (name) DO UPDATE SET
  email_domain = EXCLUDED.email_domain,
  main_investment_stages = EXCLUDED.main_investment_stages,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  updated_at = NOW();`;
    });
    
    const sqlPath = path.join(__dirname, '..', 'data', 'insert_vcs.sql');
    await fs.writeFile(sqlPath, sqlStatements.join('\n'));
    console.log(`\n💾 SQL statements saved to: ${sqlPath}`);
    
    // 6. Supabase에 직접 삽입 시도
    console.log('\n🚀 Inserting data into Supabase...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const vc of processedVCs) {
      try {
        const { data, error } = await supabase
          .from('vcs')
          .upsert({
            name: vc.name,
            email_domain: vc.email_domain,
            main_investment_stages: vc.main_investment_stages,
            website: vc.website,
            description: vc.description,
            is_active: vc.is_active
          }, {
            onConflict: 'name'
          });
        
        if (error) {
          console.error(`  ✗ Error inserting ${vc.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`  ✓ Inserted/Updated ${vc.name}`);
          successCount++;
        }
      } catch (e) {
        console.error(`  ✗ Error with ${vc.name}:`, e.message);
        errorCount++;
      }
    }
    
    console.log('\n✅ Database insertion complete!');
    console.log(`  Success: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);
    
    return processedVCs;
    
  } catch (error) {
    console.error('❌ Error processing VC data:', error);
    throw error;
  }
}

// 스크립트 실행
if (require.main === module) {
  processVCData()
    .then(vcs => {
      console.log(`\n✅ Successfully processed ${vcs.length} VCs!`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Processing failed:', error);
      process.exit(1);
    });
}

module.exports = processVCData;