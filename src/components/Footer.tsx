import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* About */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center font-bold text-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="text-xl font-black text-white tracking-tight uppercase">
              УКР<span className="text-emerald-400">ТАБ</span>
            </div>
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            Виробництво магнітних наклейок на авто, сувенірних автономерів ЗСУ, адресних табличок на будинок, УФ-друку та пластикових трафаретів з доставкою по всій Україні.
          </p>
          <div className="text-xs text-emerald-400 font-semibold">
            ⚡ Термін виготовлення замовлень: 1-2 дні
          </div>
        </div>

        {/* Catalog Categories Links for SEO Link Juice */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Категорії продукції</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/catalog/magniti-na-avto" className="hover:text-emerald-400 transition">
                Магнітні наклейки на авто
              </Link>
            </li>
            <li>
              <Link href="/catalog/reklamni-magniti" className="hover:text-emerald-400 transition">
                Магнітна реклама на авто
              </Link>
            </li>
            <li>
              <Link href="/catalog/suvenirni-avtonomera" className="hover:text-emerald-400 transition">
                Сувенірні номери на авто
              </Link>
            </li>
            <li>
              <Link href="/catalog/vijskovi-nomeri" className="hover:text-emerald-400 transition">
                Сувенірні номери для військових
              </Link>
            </li>
            <li>
              <Link href="/catalog/adresni-tablichki" className="hover:text-emerald-400 transition">
                Адресні таблички на будинок
              </Link>
            </li>
            <li>
              <Link href="/catalog/tablichki-na-dveri" className="hover:text-emerald-400 transition">
                Таблички на двері та кабінети
              </Link>
            </li>
          </ul>
        </div>

        {/* More Categories & Services */}
        <div>
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Послуги та таблички</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/catalog/informatsijni-tablichki" className="hover:text-emerald-400 transition">
                Інформаційні таблички ПВХ
              </Link>
            </li>
            <li>
              <Link href="/catalog/ritualni-tablichki" className="hover:text-emerald-400 transition">
                Ритуальні таблички з фото
              </Link>
            </li>
            <li>
              <Link href="/catalog/trafareti" className="hover:text-emerald-400 transition">
                Трафарети на замовлення
              </Link>
            </li>
            <li>
              <Link href="/catalog/uf-druk" className="hover:text-emerald-400 transition">
                УФ-друк на пластику та композиті
              </Link>
            </li>
            <li>
              <Link href="/catalog/tablichki-dlya-biznesu" className="hover:text-emerald-400 transition">
                Таблички для офісу та бізнесу
              </Link>
            </li>
            <li>
              <Link href="/catalog/nomeri-dlya-avtosaloniv" className="hover:text-emerald-400 transition">
                Номери для автосалонів та СТО
              </Link>
            </li>
          </ul>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Контакти & Доставка</h4>
          <div className="flex items-start space-x-2 text-xs text-slate-300">
            <Phone className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <a href="tel:+380664418050" className="block hover:text-white transition">+380 (66) 441-80-50</a>
              <a href="tel:+380683677015" className="block hover:text-white transition">+380 (68) 367-70-15</a>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <a href="mailto:mabitzp@gmail.com" className="hover:text-white transition">
              mabitzp@gmail.com
            </a>
          </div>
          <div className="flex items-start space-x-2 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>Україна, м. Дніпро, вул. Миру 2т</span>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <a
              href="viber://chat?number=%2B380664418050"
              target="_blank"
              rel="noopener noreferrer"
              title="Viber"
              aria-label="Viber"
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center hover:opacity-90 transition"
            >
              <svg className="w-full h-full" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                <circle style={{ fill: '#6F3FAA' }} cx="256" cy="256" r="256" />
                <path
                  style={{ fill: '#512D84' }}
                  d="M367.061,140.443c-62.312-15.05-124.735-32.654-188.637-10.288
                  c-41.374,15.515-41.374,60.337-39.65,98.263c0,10.343-12.067,24.135-6.896,36.202c10.343,34.478,18.963,68.956,55.165,86.195
                  c5.172,3.448,0,10.343,3.448,15.515c-1.724,0-5.172,1.724-5.172,3.448c0,8.263,3.708,20.902,1.245,29.05L296.57,508.788
                  c113.09-18.01,201.478-110.068,213.914-224.921L367.061,140.443z"
                />
                <g>
                  <path
                    style={{ fill: '#FFFFFF' }}
                    d="M391.427,179.924l-0.084-0.338c-6.84-27.653-37.678-57.325-65.998-63.498l-0.319-0.066
                    c-45.806-8.738-92.251-8.738-138.047,0l-0.329,0.066c-28.31,6.173-59.149,35.847-65.998,63.498l-0.076,0.338
                    c-8.456,38.617-8.456,77.781,0,116.398l0.076,0.338c6.558,26.472,35.099,54.782,62.362,62.567v30.868
                    c0,11.173,13.615,16.66,21.357,8.597l31.275-32.509c6.784,0.379,13.571,0.591,20.356,0.591c23.057,0,46.125-2.181,69.023-6.549
                    l0.319-0.066c28.32-6.173,59.158-35.847,65.998-63.498l0.084-0.338C399.882,257.705,399.882,218.543,391.427,179.924z
                    M366.676,290.723c-4.567,18.041-27.981,40.469-46.585,44.613c-24.355,4.632-48.904,6.611-73.428,5.932
                    c-0.488-0.014-0.957,0.176-1.296,0.526c-3.481,3.572-22.835,23.442-22.835,23.442l-24.288,24.928
                    c-1.776,1.852-4.896,0.591-4.896-1.964v-51.136c0-0.845-0.603-1.562-1.433-1.726c-0.005-0.002-0.009-0.002-0.014-0.003
                    c-18.604-4.144-42.01-26.572-46.585-44.613c-7.611-34.906-7.611-70.292,0-105.198c4.575-18.041,27.981-40.469,46.585-44.613
                    c42.536-8.09,85.664-8.09,128.191,0c18.613,4.144,42.018,26.572,46.585,44.613C374.296,220.431,374.296,255.817,366.676,290.723z"
                  />
                  <path
                    style={{ fill: '#FFFFFF' }}
                    d="M296.47,314.327c-2.86-0.869-5.585-1.452-8.118-2.501c-26.231-10.883-50.371-24.923-69.492-46.444
                    c-10.874-12.238-19.385-26.055-26.579-40.677c-3.412-6.934-6.287-14.139-9.218-21.299c-2.672-6.528,1.264-13.272,5.408-18.192
                    c3.889-4.617,8.894-8.149,14.314-10.754c4.23-2.032,8.402-0.86,11.492,2.725c6.678,7.752,12.814,15.9,17.78,24.886
                    c3.055,5.527,2.217,12.283-3.32,16.044c-1.346,0.914-2.572,1.988-3.825,3.02c-1.1,0.905-2.134,1.819-2.888,3.044
                    c-1.377,2.241-1.443,4.886-0.557,7.323c6.827,18.761,18.334,33.351,37.219,41.21c3.022,1.257,6.056,2.72,9.538,2.315
                    c5.83-0.681,7.718-7.077,11.804-10.418c3.993-3.265,9.097-3.308,13.398-0.586c4.303,2.724,8.473,5.646,12.619,8.601
                    c4.07,2.9,8.121,5.735,11.874,9.042c3.61,3.179,4.853,7.349,2.82,11.662c-3.72,7.901-9.135,14.472-16.944,18.668
                    C301.59,313.178,298.956,313.561,296.47,314.327z"
                  />
                  <path
                    style={{ fill: '#FFFFFF' }}
                    d="M256.071,165.426c34.309,0.962,62.49,23.731,68.529,57.651c1.029,5.78,1.395,11.688,1.853,17.555
                    c0.193,2.467-1.205,4.811-3.867,4.844c-2.75,0.033-3.987-2.269-4.167-4.734c-0.353-4.882-0.598-9.787-1.271-14.627
                    c-3.551-25.559-23.931-46.704-49.371-51.241c-3.829-0.683-7.745-0.862-11.624-1.269c-2.451-0.257-5.661-0.405-6.204-3.453
                    c-0.455-2.555,1.701-4.589,4.134-4.72C254.742,165.393,255.407,165.424,256.071,165.426z"
                  />
                  <path
                    style={{ fill: '#FFFFFF' }}
                    d="M308.212,233.019c-0.057,0.429-0.086,1.436-0.338,2.384c-0.91,3.444-6.134,3.875-7.335,0.4
                    c-0.357-1.031-0.41-2.205-0.412-3.315c-0.012-7.266-1.591-14.526-5.256-20.849c-3.767-6.499-9.523-11.96-16.272-15.267
                    c-4.082-1.998-8.495-3.241-12.969-3.98c-1.955-0.324-3.931-0.519-5.896-0.793c-2.381-0.331-3.653-1.848-3.539-4.194
                    c0.105-2.198,1.712-3.781,4.108-3.644c7.873,0.446,15.479,2.15,22.48,5.856c14.234,7.539,22.366,19.437,24.74,35.326
                    c0.107,0.721,0.279,1.433,0.334,2.155C307.991,228.88,308.076,230.665,308.212,233.019z"
                  />
                  <path
                    style={{ fill: '#FFFFFF' }}
                    d="M286.872,232.188c-2.87,0.052-4.406-1.538-4.703-4.168c-0.205-1.834-0.369-3.694-0.807-5.48
                    c-0.862-3.517-2.731-6.775-5.689-8.93c-1.396-1.017-2.979-1.758-4.636-2.238c-2.105-0.609-4.293-0.441-6.392-0.955
                    c-2.281-0.559-3.543-2.407-3.184-4.546c0.326-1.948,2.22-3.468,4.349-3.313c13.302,0.96,22.809,7.837,24.166,23.497
                    c0.097,1.105,0.209,2.272-0.036,3.331C289.518,231.193,288.178,232.1,286.872,232.188z"
                  />
                </g>
                <path
                  style={{ fill: '#D1D1D1' }}
                  d="M391.427,179.924l-0.084-0.338c-3.834-15.501-15.212-31.635-29.458-43.911l-19.259,17.068
                  c11.452,9.125,21.264,21.766,24.052,32.78c7.62,34.907,7.62,70.292,0,105.2c-4.567,18.041-27.982,40.469-46.585,44.613
                  c-24.355,4.632-48.904,6.611-73.428,5.932c-0.488-0.014-0.957,0.176-1.296,0.526c-3.481,3.572-22.835,23.442-22.835,23.442
                  l-24.288,24.928c-1.776,1.852-4.896,0.593-4.896-1.964v-51.136c0-0.845-0.603-1.562-1.433-1.726c-0.005,0-0.009-0.002-0.014-0.002
                  c-10.573-2.355-22.692-10.618-32.028-20.621l-19.03,16.863c11.885,12.929,27.214,23.381,42.168,27.651v30.868
                  c0,11.173,13.615,16.66,21.357,8.597l31.275-32.509c6.784,0.379,13.569,0.591,20.356,0.591c23.057,0,46.125-2.181,69.023-6.549
                  l0.319-0.065c28.32-6.173,59.158-35.845,65.998-63.498l0.084-0.338C399.882,257.705,399.882,218.543,391.427,179.924z"
                />
              </svg>
            </a>
            <a
              href="https://t.me/+380664418050"
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram"
              aria-label="Telegram"
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center hover:opacity-90 transition"
            >
              <svg className="w-full h-full" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="url(#footer_tg_linear_gradient)" />
                <path
                  d="M22.9866 10.2088C23.1112 9.40332 22.3454 8.76755 21.6292 9.082L7.36482 15.3448C6.85123 15.5703 6.8888 16.3483 7.42147 16.5179L10.3631 17.4547C10.9246 17.6335 11.5325 17.541 12.0228 17.2023L18.655 12.6203C18.855 12.4821 19.073 12.7665 18.9021 12.9426L14.1281 17.8646C13.665 18.3421 13.7569 19.1512 14.314 19.5005L19.659 22.8523C20.2585 23.2282 21.0297 22.8506 21.1418 22.1261L22.9866 10.2088Z"
                  fill="white"
                />
                <defs>
                  <linearGradient
                    id="footer_tg_linear_gradient"
                    x1="16"
                    y1="2"
                    x2="16"
                    y2="30"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#37BBFE" />
                    <stop offset="1" stopColor="#007DBB" />
                  </linearGradient>
                </defs>
              </svg>
            </a>
            <a
              href="https://wa.me/380664418050"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              aria-label="WhatsApp"
              className="w-8 h-8 flex items-center justify-center hover:opacity-90 transition"
            >
              <svg className="w-full h-full" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M23.993 0 C10.762 0 0 10.765 0 24 C0 29.248 1.693 34.116 4.57 38.067 L1.58 46.984 L10.804 44.036 C14.599 46.547 19.126 48 24.007 48 C37.238 48 48 37.234 48 24 C48 10.766 37.238 0 24.007 0 Z"
                  fill="#67C15E"
                />
                <path
                  d="M17.293 12.191 C16.827 11.076 16.475 11.034 15.77 11.005 C15.53 10.991 15.262 10.978 14.966 10.978 C14.048 10.978 13.089 11.246 12.511 11.838 C11.806 12.558 10.057 14.236 10.057 17.679 C10.057 21.122 12.568 24.452 12.906 24.918 C13.259 25.383 17.801 32.55 24.853 35.471 C30.368 37.757 32.005 37.545 33.26 37.277 C35.094 36.882 37.393 35.527 37.971 33.891 C38.55 32.254 38.55 30.857 38.38 30.561 C38.211 30.265 37.745 30.096 37.04 29.743 C36.335 29.39 32.907 27.697 32.258 27.471 C31.624 27.231 31.017 27.316 30.538 27.993 C29.861 28.939 29.198 29.898 28.662 30.476 C28.239 30.928 27.547 30.985 26.969 30.744 C26.193 30.42 24.021 29.658 21.341 27.273 C19.267 25.425 17.857 23.126 17.448 22.434 C17.039 21.729 17.406 21.32 17.73 20.939 C18.083 20.501 18.421 20.191 18.774 19.782 C19.126 19.373 19.324 19.161 19.55 18.681 C19.79 18.216 19.62 17.736 19.451 17.383 C19.282 17.03 17.871 13.587 17.293 12.191 Z"
                  fill="white"
                />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/ksiusha.feoktistova?igsh=Y3k5cHoxMDU3eHFz&igsi=Y3k5cHoxMDU3eHFz&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:opacity-90 transition shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@ksmagnitovna"
              target="_blank"
              rel="noopener noreferrer"
              title="TikTok"
              aria-label="TikTok"
              className="w-8 h-8 rounded-full bg-black border border-slate-700 text-white flex items-center justify-center hover:bg-slate-800 transition"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
            </a>
          </div>

          <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
            <Link href="/about" className="hover:text-emerald-400">Про нас</Link>
            <span>•</span>
            <Link href="/delivery" className="hover:text-emerald-400">Оплата, доставка та повернення</Link>
            <span>•</span>
            <Link href="/constructor" className="hover:text-emerald-400">Конструктор</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-8 mt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} Укртаб. Виробництво в Україні. Всі права захищено.
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/sitemap.xml" className="hover:text-emerald-400">Карта сайту (Sitemap)</Link>
          <span>•</span>
          <Link href="/google-feed.xml" className="hover:text-emerald-400">Товарний фід Google</Link>
        </div>
      </div>
    </footer>
  );
}
