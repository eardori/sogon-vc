const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeAllVCs() {
    console.log('🚀 Starting THE VC scraping process...');
    
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1400, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        // THE VC 투자자 탐색 페이지로 이동
        console.log('📄 Navigating to THE VC investors page...');
        await page.goto('https://thevc.kr/browse/investors', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        // 페이지 로드 대기 - 더 유연하게 처리
        console.log('⏳ Waiting for page to load...');
        try {
            await page.waitForSelector('tbody tr', { timeout: 30000 });
        } catch (error) {
            console.log('⚠️ Table not found immediately, trying alternative selectors...');
            
            // 대체 셀렉터들 시도
            const selectors = ['table', '.table', '[class*="table"]', 'tr', '[role="row"]'];
            let found = false;
            
            for (const selector of selectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 5000 });
                    console.log(`✅ Found content with selector: ${selector}`);
                    found = true;
                    break;
                } catch (e) {
                    // 다음 셀렉터 시도
                }
            }
            
            if (!found) {
                throw new Error('페이지 콘텐츠를 찾을 수 없습니다.');
            }
        }
        
        // 총 페이지 수 계산 (3,827개사 ÷ 10개/페이지)
        const { totalPages, totalVCs } = await page.evaluate(() => {
            // 총 투자자 수 찾기
            let totalVCText = '';
            const vcElements = Array.from(document.querySelectorAll('*'))
                .filter(el => el.textContent.includes('3,827') || el.textContent.includes('3827'));
            
            if (vcElements.length > 0) {
                totalVCText = vcElements[0].textContent.trim();
            }
            
            // 3,827에서 숫자만 추출
            const match = totalVCText.match(/3[,.]?827/);
            const totalVCs = match ? parseInt(match[0].replace(/[,.]/g, '')) : 3827;
            
            // 10개씩 보기이므로 총 페이지 수 계산
            const totalPages = Math.ceil(totalVCs / 10);
            
            return { totalPages, totalVCs };
        });
        
        console.log(`📊 Total VCs: ${totalVCs}, Estimated total pages: ${totalPages}`);
        
        // 첫 번째 페이지에서 실제 데이터가 있는지 확인
        const hasData = await page.evaluate(() => {
            const rows = document.querySelectorAll('tbody tr, table tr, [role="row"]');
            return rows.length > 0;
        });
        
        if (!hasData) {
            throw new Error('페이지에서 데이터를 찾을 수 없습니다.');
        }
        
        console.log('📊 Data found, starting extraction...');
        
        let allVCs = [];
        let currentPage = 1;
        let hasNextPage = true;
        const maxPages = Math.min(totalPages, 500); // 안전장치: 계산된 페이지 수 또는 최대 500페이지
        
        while (hasNextPage && currentPage <= maxPages) {
            console.log(`📖 Processing page ${currentPage} of ${totalPages}...`);
            
            // 현재 페이지의 VC 데이터 추출
            const pageVCs = await page.evaluate(() => {
                const vcs = [];
                
                // 다양한 셀렉터로 행 찾기
                const selectors = ['tbody tr', 'table tr', '[role="row"]', 'tr'];
                let rows = [];
                
                for (const selector of selectors) {
                    rows = document.querySelectorAll(selector);
                    if (rows.length > 0) {
                        console.log(`Found ${rows.length} rows with selector: ${selector}`);
                        break;
                    }
                }
                
                if (rows.length === 0) {
                    console.log('No rows found on this page');
                    return [];
                }
                
                rows.forEach((row, rowIndex) => {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 10) { // 최소 10개 셀이 있어야 유효한 데이터로 간주
                        try {
                            // VC 이름과 링크
                            const nameCell = cells[1];
                            const nameLink = nameCell.querySelector('a');
                            const name = nameLink ? nameLink.textContent.trim() : nameCell.textContent.trim();
                            const profileUrl = nameLink ? nameLink.href : '';
                            
                            // 국가
                            const country = cells[2].textContent.trim();
                            
                            // 유형 (분류)
                            const type = cells[3].textContent.trim();
                            
                            // 인증/자격
                            const certification = cells[4].textContent.trim();
                            
                            // 총 투자 건수
                            const investmentCount = cells[7].textContent.trim();
                            
                            // 최근 투자 날짜
                            const lastInvestmentDate = cells[10].textContent.trim();
                            
                            // 주요 포트폴리오 - 개수 계산
                            const portfolioCell = cells[11];
                            const portfolioBadges = portfolioCell.querySelectorAll('.px-2.py-1, .badge');
                            let portfolioCount = 0;
                            portfolioBadges.forEach(badge => {
                                const count = badge.textContent.match(/\d+/);
                                if (count) {
                                    portfolioCount += parseInt(count[0]);
                                }
                            });
                            
                            // 투자 단계
                            const stagesCell = cells[12];
                            const stageBadges = Array.from(stagesCell.querySelectorAll('.px-2.py-1, .badge'))
                                .map(badge => badge.textContent.trim())
                                .filter(stage => !stage.match(/^\d+개사$/)); // 개수 정보 제외
                            const stages = stageBadges.length > 0 ? stageBadges : [stagesCell.textContent.trim()];
                            
                            // 주요 투자 기술
                            const techCell = cells[13];
                            const techBadges = Array.from(techCell.querySelectorAll('.px-2.py-1, .badge'))
                                .map(badge => badge.textContent.trim())
                                .filter(tech => !tech.match(/^\d+개사$/)); // 개수 정보 제외
                            const technologies = techBadges.length > 0 ? techBadges : [techCell.textContent.trim()];
                            
                            // 주요 투자 분야
                            const sectorCell = cells[14];
                            const sectorBadges = Array.from(sectorCell.querySelectorAll('.px-2.py-1, .badge'))
                                .map(badge => badge.textContent.trim())
                                .filter(sector => !sector.match(/^\d+개사$/)); // 개수 정보 제외
                            const sectors = sectorBadges.length > 0 ? sectorBadges : [sectorCell.textContent.trim()];
                            
                            const vcData = {
                                name: name,
                                type: type,
                                country: country,
                                certification: certification,
                                investment_count: investmentCount,
                                portfolio_count: portfolioCount > 0 ? portfolioCount.toString() : '정보 없음',
                                stages: stages.filter(s => s && s !== '해당 없음'),
                                technologies: technologies.filter(t => t && t !== '해당 없음'),
                                sectors: sectors.filter(s => s && s !== '해당 없음'),
                                last_investment_date: lastInvestmentDate,
                                profile_url: profileUrl,
                                website: '' // 이후 개별 프로필에서 추출 가능
                            };
                            
                            vcs.push(vcData);
                        } catch (error) {
                            console.error('Error parsing VC row:', error);
                        }
                    }
                });
                
                return vcs;
            });
            
            allVCs.push(...pageVCs);
            console.log(`✅ Extracted ${pageVCs.length} VCs from page ${currentPage}. Total so far: ${allVCs.length}`);
            
            // 다음 페이지 확인 및 이동
            hasNextPage = await page.evaluate((currentPageNum) => {
                // 페이지 하단으로 스크롤하여 페이지네이션이 보이도록 함
                window.scrollTo(0, document.body.scrollHeight);
                
                // 잠시 대기
                const paginationContainer = document.querySelector('.flex.items-center.justify-center.space-x-1');
                if (!paginationContainer) {
                    console.log('Pagination container not found');
                    return false;
                }
                
                const buttons = Array.from(paginationContainer.querySelectorAll('button'));
                console.log('Available buttons:', buttons.map(btn => ({
                    text: btn.textContent.trim(),
                    disabled: btn.disabled,
                    className: btn.className
                })));
                
                // 현재 페이지 + 1인 버튼 찾기
                const nextPageNumber = (currentPageNum + 1).toString();
                const nextPageButton = buttons.find(btn => {
                    const text = btn.textContent.trim();
                    return text === nextPageNumber && !btn.disabled;
                });
                
                if (nextPageButton) {
                    console.log(`Clicking page ${nextPageNumber} button`);
                    nextPageButton.click();
                    return true;
                }
                
                // 현재 활성 페이지 확인
                const activeButton = paginationContainer.querySelector('button[aria-current="page"]') ||
                    paginationContainer.querySelector('.bg-blue-600, .bg-primary');
                
                if (activeButton) {
                    const currentActivePage = activeButton.textContent.trim();
                    console.log(`Current active page: ${currentActivePage}`);
                }
                
                console.log(`No next page button found for page ${nextPageNumber}`);
                return false;
            }, currentPage);
            
            if (hasNextPage && currentPage < totalPages) {
                currentPage++;
                // 페이지 로딩 대기
                await page.waitForTimeout(3000);
                
                // 새 페이지 로드 확인
                try {
                    // 페이지 변경을 위해 대기
                    console.log('⏳ Waiting for page transition...');
                    await page.waitForTimeout(3000);
                    
                    // 다양한 셀렉터로 콘텐츠 대기
                    let contentLoaded = false;
                    const selectors = ['tbody tr', 'table tr', '[role="row"]', 'tr'];
                    
                    for (const selector of selectors) {
                        try {
                            await page.waitForSelector(selector, { timeout: 5000 });
                            contentLoaded = true;
                            break;
                        } catch (e) {
                            // 다음 셀렉터 시도
                        }
                    }
                    
                    if (!contentLoaded) {
                        console.log('⚠️ Content not loaded, trying to continue...');
                        await page.waitForTimeout(2000);
                    }
                    
                    // 페이지가 실제로 변경되었는지 확인
                    const newPageNumber = await page.evaluate(() => {
                        const activeButton = document.querySelector('.flex.items-center.justify-center.space-x-1 button[aria-current="page"], .bg-blue-600');
                        return activeButton ? activeButton.textContent.trim() : '1';
                    });
                    
                    console.log(`📄 Moved to page ${newPageNumber}`);
                    
                } catch (error) {
                    console.log('⚠️ Error during page transition, ending scraping...');
                    console.log(error.message);
                    hasNextPage = false;
                }
                
                // 최대 페이지에 도달했는지 확인
                if (currentPage >= totalPages) {
                    console.log(`📄 Reached final page (${currentPage}), ending scraping`);
                    hasNextPage = false;
                }
            } else {
                hasNextPage = false;
            }
        }
        
        console.log(`🎉 Scraping completed! Processed ${currentPage} pages. Total VCs collected: ${allVCs.length}`);
        
        // 데이터 정리 및 검증
        const cleanedVCs = allVCs.filter(vc => vc.name && vc.name !== '');
        
        // 중복 제거 (이름 기준)
        const uniqueVCs = cleanedVCs.reduce((acc, current) => {
            const existing = acc.find(vc => vc.name === current.name);
            if (!existing) {
                acc.push(current);
            }
            return acc;
        }, []);
        
        console.log(`🧹 After cleaning: ${uniqueVCs.length} unique VCs`);
        
        // 데이터 저장
        const outputPath = path.join(__dirname, '..', 'data', 'all_vcs_thevc.json');
        const outputData = {
            scraped_at: new Date().toISOString(),
            source: 'https://thevc.kr/browse/investors',
            total_count: uniqueVCs.length,
            vcs: uniqueVCs
        };
        
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
        console.log(`💾 Data saved to: ${outputPath}`);
        
        // 샘플 데이터 출력
        console.log('\n📊 Sample data (first 3 VCs):');
        uniqueVCs.slice(0, 3).forEach((vc, index) => {
            console.log(`\n${index + 1}. ${vc.name}`);
            console.log(`   Type: ${vc.type}`);
            console.log(`   Country: ${vc.country}`);
            console.log(`   Investment Count: ${vc.investment_count}`);
            console.log(`   Portfolio Count: ${vc.portfolio_count}`);
            console.log(`   Stages: ${vc.stages.slice(0, 3).join(', ')}`);
            console.log(`   Technologies: ${vc.technologies.slice(0, 3).join(', ')}`);
        });
        
        // 통계 정보
        console.log('\n📈 Statistics:');
        const typeStats = {};
        const countryStats = {};
        
        uniqueVCs.forEach(vc => {
            typeStats[vc.type] = (typeStats[vc.type] || 0) + 1;
            countryStats[vc.country] = (countryStats[vc.country] || 0) + 1;
        });
        
        console.log('By Type:');
        Object.entries(typeStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([type, count]) => {
                console.log(`   ${type}: ${count}`);
            });
            
        console.log('By Country:');
        Object.entries(countryStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .forEach(([country, count]) => {
                console.log(`   ${country}: ${count}`);
            });
        
        return uniqueVCs;
        
    } catch (error) {
        console.error('❌ Error during scraping:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// 스크립트 실행
if (require.main === module) {
    scrapeAllVCs()
        .then(vcs => {
            console.log(`\n✅ Successfully scraped ${vcs.length} VCs from THE VC!`);
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Scraping failed:', error);
            process.exit(1);
        });
}

module.exports = scrapeAllVCs;