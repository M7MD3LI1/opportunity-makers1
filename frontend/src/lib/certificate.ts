
import logoSana3 from "../assets/logo-icon.png";

export const generateCertificate = (user: any, doc: any, extraData: any = {}) => {
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) return;

  const date = new Date(doc.createdAt || Date.now()).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const { completedHours = 0, totalScore = 0 } = extraData;

  const config: Record<string, any> = {
    VOLUNTEER_CERT: {
      title: "شهادة تطوع واستحقاق",
      intro: "تتشرف إدارة المؤسسة بمنح هذه الشهادة لـ:",
      text: `تقديراً لعطائكم المتميز وجهودكم المخلصة والمثمرة خلال فترة عملكم التطوعي في لجنة <span class="highlight">(${user.department?.name || 'التطوع المركزي'})</span>. لقد ساهمتم بشكل فعال في إثراء العمل المؤسسي من خلال مهاراتكم والتزامكم الاستثنائي.`,
      statsLabel: "إجمالي الساعات المعتمدة"
    },
    EXPERIENCE_CERT: {
      title: "شهادة خبرة عملية",
      intro: "تشهد مؤسسة صناع الفرص بأن السيد/ة:",
      text: `قد عمل لدى المؤسسة في لجنة <span class="highlight">(${user.department?.name || 'التدريب'})</span>، وأظهر خلال فترة عمله كفاءة مهنية عالية وقدرة متميزة على إنجاز المهام المسندة إليه بكل دقة واحترافية، كما تميز بروح الفريق والالتزام بالمعايير المؤسسية.`,
      statsLabel: "مؤشر الكفاءة المهنية"
    },
    RECOMMENDATION: {
      title: "خطاب توصية وتزكية",
      intro: "إلى من يهمه الأمر، تود المؤسسة تزكية:",
      text: `بناءً على الأداء المتميز والمواقف القيادية التي أظهرها المذكور أعلاه في لجنة <span class="highlight">(${user.department?.name || 'التطوع'})</span>، فإننا نوصي به بشدة لأي دور مستقبلي يتطلب الالتزام والإبداع، مؤكدين أنه كان إضافة حقيقية لفريق عملنا.`,
      statsLabel: "درجة التقييم العام"
    },
    PERFORMANCE_REPORT: {
      title: "تقرير تقييم الأداء",
      intro: "بيان رسمي ببيانات أداء المتطوع/ السيد:",
      text: `يوضح هذا التقرير مخرجات الأداء للمتطوع في لجنة <span class="highlight">(${user.department?.name || 'العمل الميداني'})</span>، حيث تم تقييمه بناءً على مؤشرات الإنجاز، الالتزام، والتفاعل المجتمعي، وقد حقق نتائج متميزة تعكس قدراته العالية.`,
      statsLabel: "مؤشر VPI النهائي"
    },
    COMPREHENSIVE_REPORT: {
      title: "التقرير الشامل لأداء العضو",
      intro: "تقرير تقييمي شامل للسيد/ة:",
      text: `يعكس هذا التقرير المسيرة المهنية والتطوعية للعضو داخل كيان صناع الفرص، متضمناً كافة مؤشرات الأداء، الإنجازات، والالتزام بالمعايير المؤسسية خلال فترة العمل.`,
      statsLabel: "إجمالي النقاط التراكمية"
    }
  };

  const currentConfig = config[doc.type] || config.VOLUNTEER_CERT;


  const logoMinistry = "https://emys.gov.eg/images/logo_min.png";

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${currentConfig.title} - ${user.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700;900&display=swap');
        
        @page { size: landscape; margin: 0; }
        body { margin: 0; padding: 0; background-color: #ffffff; font-family: 'Tajawal', sans-serif; -webkit-print-color-adjust: exact; overflow: hidden; }
        
        .certificate-container { 
          width: 297mm; 
          height: 210mm; 
          position: relative; 
          background: #fff; 
          display: flex; 
          flex-direction: column; 
          box-sizing: border-box;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          height: 280px;
          width: 100%;
        }

        .logos-area {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 60px;
          padding-right: 60px;
          justify-content: flex-end;
        }

        .logo-item {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-img {
          height: 110px;
          object-fit: contain;
          margin-bottom: 8px;
        }

        .logo-label {
          font-size: 12px;
          font-weight: 800;
          color: #1e293b;
          max-width: 180px;
          line-height: 1.3;
        }

        .banner-area {
          width: 320px;
          background: #701b73;
          clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 12px;
          padding-left: 30px;
        }

        .keyword {
          background: white;
          color: #701b73;
          padding: 6px 0;
          border-radius: 40px;
          font-size: 24px;
          font-weight: 900;
          width: 150px;
          text-align: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .content-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 100px;
          margin-top: 20px;
        }

        .org-name-header {
          font-size: 28px;
          font-weight: 900;
          margin-bottom: 10px;
        }

        .doc-title {
          font-family: 'Amiri', serif;
          font-size: 68px;
          color: #c5a059;
          margin: 10px 0;
          line-height: 1;
          font-weight: 700;
        }

        .intro-text {
          font-size: 20px;
          color: #475569;
          margin-top: 15px;
        }

        .recipient-name {
          font-family: 'Amiri', serif;
          font-size: 52px;
          color: #701b73;
          font-weight: 700;
          margin: 15px 0;
          padding-bottom: 5px;
          border-bottom: 2px solid #f1f5f9;
        }

        .description {
          font-size: 18px;
          line-height: 1.8;
          color: #334155;
          max-width: 850px;
          margin: 20px 0;
        }

        .highlight { color: #701b73; font-weight: 800; }

        .performance-stats {
          margin-top: 5px;
          font-size: 14px;
          color: #701b73;
          font-weight: 700;
          background: #701b7305;
          padding: 6px 25px;
          border-radius: 12px;
          border: 1px solid #701b731a;
        }

        .footer-area {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 0 100px 50px;
        }

        .info-group {
          font-size: 13px;
          color: #64748b;
          font-weight: bold;
        }

        .signatures {
          display: flex;
          gap: 80px;
        }

        .sig-item { text-align: center; }
        .sig-line { width: 160px; height: 1px; background: #cbd5e1; margin: 10px 0; }
        .sig-name { font-size: 15px; font-weight: 900; color: #1e293b; }
        .sig-role { font-size: 11px; color: #94a3b8; font-weight: 700; }

        .outer-frame {
          position: absolute;
          inset: 15px;
          border: 1px solid #701b7322;
          pointer-events: none;
        }
        .inner-frame {
          position: absolute;
          inset: 22px;
          border: 2px solid #c5a059;
          pointer-events: none;
        }
      </style>
    </head>
    <body>
      <div class="certificate-container">
        <div class="outer-frame"></div>
        <div class="inner-frame"></div>
        
        <div class="header-section">
          <div class="logos-area">
            <div class="logo-item">
              <img src="${logoSana3}" class="logo-img" />
              <div class="logo-label">مؤسسة صناع الفرص للتنمية والتدريب</div>
            </div>
            <div class="logo-item">
              <img src="${logoMinistry}" class="logo-img" />
              <div class="logo-label">جمهورية مصر العربية<br/>وزارة الشباب والرياضة</div>
            </div>
          </div>
          <div class="banner-area">
            <div class="keyword">إعمل</div>
            <div class="keyword">حاور</div>
            <div class="keyword">تعلم</div>
          </div>
        </div>

        <div class="content-section">
          <div class="org-name-header">مؤسسة صناع الفرص</div>
          <div class="doc-title">${currentConfig.title}</div>
          <div class="intro-text">${currentConfig.intro}</div>
          <div class="recipient-name">${user.name}</div>
          ${doc.type === 'COMPREHENSIVE_REPORT' ? `
            <div style="width: 100%; text-align: right; margin-top: 30px;">
              <h3 style="color: #701b73; border-bottom: 2px solid #701b7322; padding-bottom: 10px; font-size: 20px;">أولاً: تحليل مؤشرات الأداء</h3>
              <div style="display: grid; grid-cols: 2; gap: 20px; margin-top: 15px;">
                <div style="background: #f8fafc; padding: 15px; border-radius: 15px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 12px; color: #64748b; font-weight: 800;">مؤشر VPI الحالي</div>
                  <div style="font-size: 24px; font-weight: 900; color: #701b73;">${extraData.vpiScore || '0.00'} / 4.00</div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 15px; border: 1px solid #e2e8f0;">
                  <div style="font-size: 12px; color: #64748b; font-weight: 800;">التقييم الرقمي التراكمي</div>
                  <div style="font-size: 24px; font-weight: 900; color: #701b73;">${extraData.totalScore || '0'}%</div>
                </div>
              </div>
              
              <h3 style="color: #701b73; border-bottom: 2px solid #701b7322; padding-bottom: 10px; font-size: 20px; margin-top: 30px;">ثانياً: سجل الإنجازات</h3>
              <div style="background: #701b7305; padding: 20px; border-radius: 20px; border: 1px dashed #701b7333; margin-top: 15px;">
                <p style="font-size: 16px; color: #334155;">
                  أتم العضو المذكور ما مجموعه <span style="font-bold; color: #701b73;">${extraData.completedTasks || 0}</span> مهمة رسمية، 
                  وحصل على <span style="font-bold; color: #701b73;">${extraData.badgeCount || 0}</span> أوسمة تميز، 
                  مع إجمالي ساعات تطوعية معتمدة بلغت <span style="font-bold; color: #701b73;">${extraData.completedHours || 0}</span> ساعة.
                </p>
              </div>

              <div style="margin-top: 30px; padding: 20px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 15px;">
                <p style="font-size: 14px; color: #92400e; font-weight: 700;">
                  توصية الإدارة: نظراً للأداء الموضح أعلاه، فإن الإدارة ترى في العضو كفاءة عالية واستعداداً تاماً لتولي مهام قيادية مستقبلية.
                </p>
              </div>
            </div>
          ` : `
            <div class="description">${currentConfig.text}</div>
            ${completedHours > 0 || totalScore > 0 ? `
              <div class="performance-stats">
                ${completedHours > 0 ? `<span>${currentConfig.statsLabel}: ${completedHours} ساعة</span>` : ''}
                ${totalScore > 0 ? `<span style="margin-right: 30px">التقييم العام: ${totalScore}%</span>` : ''}
              </div>
            ` : ''}
          `}
        </div>

        <div class="footer-area">
          <div class="info-group">
            <div>رقم المرجع: ${doc.referenceNo?.toUpperCase() || 'SF-REF-' + Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
            <div style="margin-top: 5px">تاريخ الإصدار: ${date}</div>
          </div>
          <div class="signatures">
            <div class="sig-item"><div class="sig-name">أ/ محمد جمال</div><div class="sig-line"></div><div class="sig-role">رئيس مجلس الإدارة</div></div>
            <div class="sig-item"><div class="sig-name">أ/ سارة عيد</div><div class="sig-line"></div><div class="sig-role">نائب رئيس مجلس الإدارة</div></div>
            <div class="sig-item"><div class="sig-name">أ/ أحمد نادر</div><div class="sig-line"></div><div class="sig-role">نائب رئيس مجلس الإدارة</div></div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() { 
          setTimeout(() => { 
            window.print(); 
            setTimeout(() => window.close(), 500);
          }, 1500); 
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
