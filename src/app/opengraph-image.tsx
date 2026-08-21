import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Укртаб — Виробництво магнітів, наліпок на авто та адресних табличок в Україні';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #064e3b 100%)',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Top bar with badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              }}
            >
              🛡️
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                УКР<span style={{ color: '#34d399' }}>ТАБ</span>
              </span>
              <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 600 }}>
                ukrtab.com.ua • Запоріжжя • Дніпро
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1.5px solid rgba(52, 211, 153, 0.3)',
              color: '#34d399',
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            ⚡ Доставка 1-2 дні по Україні
          </div>
        </div>

        {/* Center Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: 'auto 0' }}>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              maxWidth: '980px',
              color: '#ffffff',
            }}
          >
            Магніти на авто, сувенірні номери ЗСУ та адресні таблички
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#cbd5e1',
              maxWidth: '860px',
              lineHeight: 1.4,
            }}
          >
            Власне виробництво з потовщеного вінілу 0.8 мм та композиту. Прямий японський УФ-друк, стійкий до сонця, дощу та автомийок.
          </div>
        </div>

        {/* Bottom Feature Tags */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            '🧲 Посилений магніт 0.8 мм',
            '🖨️ Прямий УФ-друк 3+ роки',
            '🇺🇦 Номери для військових',
            '🏡 Адресні таблички',
            '🎨 Безкоштовний макет',
          ].map((tag, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 20px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '17px',
                fontWeight: 600,
                color: '#f1f5f9',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
