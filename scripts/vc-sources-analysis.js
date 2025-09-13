const puppeteer = require('puppeteer');

// 국내 VC 정보 수집 가능한 주요 사이트들
const vcDataSources = [
  {
    name: 'KVCA DIVA (한국벤처캐피탈협회 전자공시시스템)',
    url: 'http://diva.kvca.or.kr/div/cmn/DivDisclsMainInq',
    description: 'VC 공식 공시 정보, 투자실적, 재무제표 등',
    official: true
  },
  {
    name: 'THE VC (더브이씨)',
    url: 'https://thevc.kr/browse/investors',
    description: '한국 스타트업 투자 데이터베이스',
    official: false
  },
  {
    name: '벤처투자종합포털',
    url: 'https://www.vcs.go.kr/',
    description: '중소벤처기업부 운영 포털',
    official: true
  },
  {
    name: '이노포레스트',
    url: 'https://www.innoforest.co.kr/dataroom/investor',
    description: '스타트업 성장분석 플랫폼',
    official: false
  }
];

async function analyzeVCSource(source) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log(`\n=== ${source.name} 분석 중... ===`);
    console.log(`URL: ${source.url}`);
    
    await page.goto(source.url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 페이지 분석
    const analysis = await page.evaluate(() => {
      // VC 관련 키워드가 포함된 요소 찾기
      const vcKeywords = ['투자사', '벤처캐피털', 'VC', '투자회사', 'investor', 'capital'];
      const elements = [];
      
      // 테이블 찾기
      const tables = document.querySelectorAll('table');
      if (tables.length > 0) {
        elements.push({
          type: 'table',
          count: tables.length,
          sample: tables[0].outerHTML.substring(0, 300)
        });
      }
      
      // 리스트 찾기
      const lists = document.querySelectorAll('ul, ol');
      let vcLists = 0;
      lists.forEach(list => {
        const text = list.innerText || '';
        if (vcKeywords.some(keyword => text.includes(keyword))) {
          vcLists++;
        }
      });
      if (vcLists > 0) {
        elements.push({
          type: 'list',
          count: vcLists
        });
      }
      
      // 카드 형태 찾기
      const cards = document.querySelectorAll('[class*="card"], [class*="item"], article');
      if (cards.length > 0) {
        elements.push({
          type: 'card',
          count: cards.length
        });
      }
      
      // 링크 분석
      const links = document.querySelectorAll('a');
      const vcLinks = [];
      links.forEach(link => {
        const href = link.href || '';
        const text = link.innerText || '';
        if (vcKeywords.some(keyword => 
          text.toLowerCase().includes(keyword.toLowerCase()) || 
          href.toLowerCase().includes(keyword.toLowerCase())
        )) {
          vcLinks.push({
            text: text.substring(0, 50),
            href: href
          });
        }
      });
      
      return {
        title: document.title,
        hasData: elements.length > 0,
        elements: elements,
        vcLinksCount: vcLinks.length,
        sampleVCLinks: vcLinks.slice(0, 5)
      };
    });
    
    console.log('분석 결과:', JSON.stringify(analysis, null, 2));
    
    // 스크린샷 저장
    const filename = source.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.png';
    await page.screenshot({ 
      path: filename,
      fullPage: false 
    });
    console.log(`스크린샷 저장: ${filename}`);
    
    return { source: source.name, ...analysis };
    
  } catch (error) {
    console.error(`${source.name} 분석 오류:`, error.message);
    return { source: source.name, error: error.message };
  } finally {
    await browser.close();
  }
}

async function analyzeAllSources() {
  console.log('=== 국내 VC 정보 수집 가능 사이트 분석 ===\n');
  
  const results = [];
  for (const source of vcDataSources) {
    const result = await analyzeVCSource(source);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
  }
  
  console.log('\n=== 최종 분석 결과 ===');
  console.log(JSON.stringify(results, null, 2));
  
  // 추천 사이트 결정
  console.log('\n=== 추천 ===');
  console.log('1. KVCA DIVA: 공식 공시 정보로 가장 신뢰할 수 있음');
  console.log('2. THE VC: 사용자 친화적이고 정보가 잘 정리되어 있음');
  console.log('3. 벤처투자종합포털: 정부 공식 사이트로 신뢰성 높음');
}

// 실행
analyzeAllSources();