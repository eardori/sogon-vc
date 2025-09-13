const puppeteer = require('puppeteer');
const fs = require('fs').promises;

async function scrapeTheVC() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    console.log('THE VC 페이지 로딩 중...');
    await page.goto('https://thevc.kr/browse/investors', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // 페이지 로드 대기
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 스크롤하여 더 많은 데이터 로드
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // VC 데이터 추출
    const vcData = await page.evaluate(() => {
      const investors = [];
      
      // 테이블 행 찾기
      const rows = document.querySelectorAll('table tbody tr');
      
      rows.forEach(row => {
        try {
          // 각 셀 데이터 추출
          const cells = row.querySelectorAll('td');
          if (cells.length < 2) return;
          
          // VC 이름과 링크
          const nameElement = cells[1].querySelector('a');
          const name = nameElement?.innerText?.trim() || '';
          const link = nameElement?.href || '';
          
          // 타입 (VC, 액셀러레이터 등)
          const typeElement = cells[1].querySelector('.type-text') || 
                             cells[1].querySelector('[class*="type"]') ||
                             cells[1].querySelector('span');
          const type = typeElement?.innerText?.trim() || '';
          
          // 추가 정보 (포트폴리오 수, 투자 건수 등)
          const stats = [];
          cells.forEach((cell, index) => {
            if (index > 1) {
              const text = cell.innerText?.trim();
              if (text && text !== '-') {
                stats.push(text);
              }
            }
          });
          
          if (name) {
            investors.push({
              name: name.replace(/\n/g, ' ').trim(),
              type: type,
              link: link,
              stats: stats
            });
          }
        } catch (e) {
          console.error('행 파싱 오류:', e);
        }
      });
      
      return investors;
    });
    
    console.log(`\n총 ${vcData.length}개의 VC/투자사 정보 수집`);
    
    // 상위 10개 미리보기
    console.log('\n=== 수집된 데이터 샘플 (상위 10개) ===');
    vcData.slice(0, 10).forEach((vc, index) => {
      console.log(`${index + 1}. ${vc.name}`);
      console.log(`   타입: ${vc.type || '정보없음'}`);
      console.log(`   통계: ${vc.stats.join(', ') || '정보없음'}`);
      console.log(`   링크: ${vc.link}`);
    });
    
    // JSON 파일로 저장
    const filename = `vc_data_thevc_${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(filename, JSON.stringify(vcData, null, 2));
    console.log(`\n데이터 저장 완료: ${filename}`);
    
    // 각 VC 상세 페이지에서 추가 정보 수집 (상위 5개만 테스트)
    console.log('\n=== 상세 정보 수집 (테스트: 상위 5개) ===');
    const detailedVCs = [];
    
    for (let i = 0; i < Math.min(5, vcData.length); i++) {
      const vc = vcData[i];
      if (!vc.link) continue;
      
      try {
        console.log(`\n${vc.name} 상세 정보 수집 중...`);
        await page.goto(vc.link, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const details = await page.evaluate(() => {
          const getTextByLabel = (label) => {
            const elements = document.querySelectorAll('dt, .label, strong');
            for (const el of elements) {
              if (el.innerText?.includes(label)) {
                const nextEl = el.nextElementSibling || el.parentElement?.querySelector('dd, .value, span');
                return nextEl?.innerText?.trim() || '';
              }
            }
            return '';
          };
          
          return {
            설립일: getTextByLabel('설립') || getTextByLabel('Founded'),
            홈페이지: document.querySelector('a[href*="http"]')?.href || '',
            이메일: document.querySelector('a[href*="mailto"]')?.href?.replace('mailto:', '') || '',
            운용자산: getTextByLabel('운용') || getTextByLabel('AUM'),
            투자단계: getTextByLabel('투자') || getTextByLabel('Stage'),
            주소: getTextByLabel('주소') || getTextByLabel('Address'),
            대표: getTextByLabel('대표') || getTextByLabel('CEO')
          };
        });
        
        detailedVCs.push({
          ...vc,
          details: details
        });
        
        console.log('  설립일:', details.설립일 || '정보없음');
        console.log('  홈페이지:', details.홈페이지 || '정보없음');
        console.log('  이메일:', details.이메일 || '정보없음');
        
      } catch (error) {
        console.error(`  ${vc.name} 상세 정보 수집 실패:`, error.message);
      }
    }
    
    // 상세 정보 포함 데이터 저장
    if (detailedVCs.length > 0) {
      const detailFilename = `vc_detailed_thevc_${new Date().toISOString().split('T')[0]}.json`;
      await fs.writeFile(detailFilename, JSON.stringify(detailedVCs, null, 2));
      console.log(`\n상세 데이터 저장 완료: ${detailFilename}`);
    }
    
    return vcData;
    
  } catch (error) {
    console.error('스크래핑 오류:', error);
  } finally {
    await browser.close();
  }
}

// 실행
scrapeTheVC().then(() => {
  console.log('\n스크래핑 완료!');
});