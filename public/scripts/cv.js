(async function () {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) return;

  async function loadImageAsPng(url) {
    const blob = await fetch(url).then((r) => r.blob());
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = URL.createObjectURL(blob);
    });
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  async function generateCV() {
    const lang = localStorage.getItem('lang') || 'en';
    const res = await fetch(`/locales/${lang}.json`);
    const t = await res.json();

    const doc = new jsPDF();
    const imgData = await loadImageAsPng('/photo.webp');

    doc.addImage(imgData, 'PNG', 15, 15, 30, 30);
    doc.setFontSize(16);
    doc.text('Mikel Echeverria', 50, 25);
    doc.setFontSize(12);
    doc.text('mikel@mikeldev.com', 50, 32);

    doc.setFontSize(12);
    doc.text(stripHtml(t.hero.description), 15, 55, { maxWidth: 180 });

    doc.setFontSize(14);
    doc.text(t.section.experience, 15, 75);
    doc.setFontSize(12);

    const order = ['codetec', 'tesicnor_backend', 'camp', 'tesicnor_intern', 'burlada'];
    let y = 85;
    order.forEach((key) => {
      const exp = t.experience[key];
      if (!exp) return;
      doc.text(`${exp.date} - ${exp.title}`, 15, y, { maxWidth: 180 });
      y += 6;
      doc.text(stripHtml(exp.description), 15, y, { maxWidth: 180 });
      y += 10;
    });

    doc.save(`cv-${lang}.pdf`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('download-cv');
    if (btn) {
      btn.addEventListener('click', generateCV);
    }
  });
})();
