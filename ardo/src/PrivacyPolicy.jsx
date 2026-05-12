import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Üst Kısım (Header) */}
        <div className="bg-indigo-600 px-8 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Gizlilik Politikası
          </h1>
          <p className="mt-4 text-indigo-200 font-medium">
            Son Güncelleme Tarihi: Mayıs 2026
          </p>
        </div>

        {/* İçerik Kısmı */}
        <div className="px-8 py-12 md:px-12 text-slate-600 space-y-10 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              1. Giriş
            </h2>
            <p>
              <strong>Arda Güner</strong>olarak, gizliliğinize saygı duyuyor ve kişisel verilerinizi korumayı taahhüt ediyorum. Bu Gizlilik Politikası, mobil uygulamalarımızı, oyunlarımızı ve <span className="text-indigo-600 font-semibold">ardaguner.com</span> web sitemizi kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı ve paylaştığımızı açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              2. Topladığımız Bilgiler
            </h2>
            <p className="mb-4">Uygulamalarımızı kullandığınızda aşağıdaki türde bilgileri toplayabiliriz:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-slate-800">Cihaz Bilgileri:</strong> Cihaz modeli, işletim sistemi sürümü, benzersiz cihaz tanımlayıcıları (ör. reklam kimlikleri) ve mobil ağ bilgileri.</li>
              <li><strong className="text-slate-800">Kullanım Verileri:</strong> Uygulama içindeki etkileşimleriniz, oynama süreleriniz, tıklanan bağlantılar ve hata/çökme raporları.</li>
              <li><strong className="text-slate-800">Kullanıcı Tarafından Sağlanan Veriler:</strong> İsim, e-posta adresi, kullanıcı adı gibi sizin isteyerek verdiğiniz bilgiler (kayıt özellikleri kullanılıyorsa).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              3. Üçüncü Taraf Hizmetleri
            </h2>
            <p className="mb-4">Uygulamamız, işlevselliği artırmak, analiz yapmak ve reklam göstermek amacıyla aşağıdaki üçüncü taraf hizmetlerini kullanabilir:</p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Google Play Services</li>
                <li>Google Analytics for Firebase</li>
                <li>Google AdMob</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              4. Bilgilerin Kullanımı
            </h2>
            <p className="mb-4">Topladığımız bilgileri temel olarak şu amaçlarla kullanırız:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Uygulamalarımızın düzgün çalışmasını sağlamak ve iyileştirmek.</li>
              <li>Karşılaşılan teknik sorunları tespit edip çözmek.</li>
              <li>Kullanıcı deneyimini kişiselleştirmek ve geliştirmek.</li>
              <li>Eğer kullanılıyorsa, size uygun reklamlar sunmak.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              5. Bilgilerin Paylaşımı
            </h2>
            <p>
              Kullanıcı verilerini kesinlikle satmıyoruz. Ancak, yukarıda belirtilen üçüncü taraf analiz ve reklam ortaklarımızla (sadece uygulamanın çalışması ve reklam gösterimi amacıyla) anonimleştirilmiş veriler paylaşılabilir. Bunun dışında verileriniz yalnızca yasal bir zorunluluk olduğunda (örneğin mahkeme kararı) yetkili mercilerle paylaşılır.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              6. İletişim
            </h2>
            <p className="mb-4">Bu Gizlilik Politikası veya veri işleme uygulamalarımız hakkında sorularınız varsa, bizimle iletişime geçebilirsiniz:</p>
            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div>
                <span className="block text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-1">E-posta</span>
                <a href="mailto:ardaguner2000@gmail.com" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  ardaguner2000@gmail.com
                </a>
              </div>
              <div>
                <span className="block text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-1">Web Sitesi</span>
                <a href="https://ardaguner.com" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                  https://ardaguner.com
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;