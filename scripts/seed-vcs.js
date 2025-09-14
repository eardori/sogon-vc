const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://diacyxklbvniikuwywdv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYWN5eGtsYnZuaWlrdXd5d2R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY3MTc5NywiZXhwIjoyMDczMjQ3Nzk3fQ.DMOvj8-4Rhy_PHJrtWhpW6-C9q6cLqfBaghnwHikq3Y'
)

async function seedVCs() {
  try {
    console.log('Reading VC data...')
    
    // processed_vcs.json 파일 읽기
    const vcDataPath = path.join(__dirname, '..', 'data', 'processed_vcs.json')
    const vcData = JSON.parse(fs.readFileSync(vcDataPath, 'utf8'))
    
    console.log(`Found ${vcData.length} VCs to insert`)
    
    // 기존 데이터 삭제 (선택사항)
    console.log('Clearing existing VCs...')
    const { error: deleteError } = await supabase
      .from('vcs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 모든 행 삭제
    
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('Error clearing VCs:', deleteError)
    }
    
    // VC 데이터 변환 및 삽입
    const vcsToInsert = vcData.map(vc => ({
      name: vc.name,
      website: vc.website,
      email_domain: vc.email_domain,
      main_investment_stages: vc.main_investment_stages || [],
      description: vc.description,
      is_active: vc.is_active !== false // 기본값 true
      // investment_count와 portfolio_count는 테이블에 없는 필드이므로 제거
    }))
    
    console.log('Inserting VCs...')
    
    // 배치로 삽입 (한 번에 10개씩)
    const batchSize = 10
    for (let i = 0; i < vcsToInsert.length; i += batchSize) {
      const batch = vcsToInsert.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('vcs')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        console.log(`Inserted batch ${i / batchSize + 1}: ${data.length} VCs`)
      }
    }
    
    // 결과 확인
    const { data: allVcs, count } = await supabase
      .from('vcs')
      .select('*', { count: 'exact' })
    
    console.log(`\nTotal VCs in database: ${count}`)
    console.log('Sample VCs:', allVcs?.slice(0, 3).map(vc => vc.name))
    
  } catch (error) {
    console.error('Seed error:', error)
  }
}

// 스크립트 실행
seedVCs().then(() => {
  console.log('Seeding completed!')
  process.exit(0)
}).catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})