const puppeteer = require('puppeteer');

async function scrapeInnoforest() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('페이지 로딩 중...');
    await page.goto('https://www.innoforest.co.kr/dataroom/investor', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 페이지가 완전히 로드될 때까지 대기
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 투자사 목록이 로드되었는지 확인
    const hasInvestorData = await page.evaluate(() => {
      // 가능한 셀렉터들 시도
      const selectors = [
        '.investor-list',
        '.dataroom-list',
        'table tbody tr',
        '[class*="investor"]',
        '[class*="card"]',
        '.list-item',
        'article',
        '[data-investor]'
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          return {
            found: true,
            selector: selector,
            count: elements.length,
            sample: elements[0].outerHTML.substring(0, 500)
          };
        }
      }
      
      // 페이지 전체 HTML 일부 반환
      return {
        found: false,
        bodyHTML: document.body.innerHTML.substring(0, 2000)
      };
    });
    
    console.log('\n=== 스크래핑 결과 ===');
    console.log(hasInvestorData);
    
    // 페이지 타이틀과 URL 확인
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      hasTable: document.querySelectorAll('table').length > 0,
      hasList: document.querySelectorAll('ul, ol').length > 0,
      divCount: document.querySelectorAll('div').length,
      linkCount: document.querySelectorAll('a').length
    }));
    
    console.log('\n=== 페이지 정보 ===');
    console.log(pageInfo);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'innoforest-investors.png',
      fullPage: true 
    });
    console.log('\n스크린샷 저장: innoforest-investors.png');
    
  } catch (error) {
    console.error('스크래핑 오류:', error);
  } finally {
    await browser.close();
  }
}

// 실행
scrapeInnoforest();