import { supabase } from '@/lib/supabase';

/**
 * Supabase Storage에 이미지를 업로드하고 공개 URL을 반환합니다.
 * @param {File} file 업로드할 파일
 * @param {string} bucket 버킷 이름 (기본값: 'zeni-images')
 * @returns {Promise<string>} 공개 이미지 URL
 */
export async function uploadPublicFile(file, bucket = 'zeni-images') {
  if (!file) throw new Error('파일이 제공되지 않았습니다.');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    // 버킷이 아직 없거나 권한 에러 시 Data URL 폴백으로 로컬 미리보기/저장 지원
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl || '';
}

