import html2pdf from 'html2pdf.js';

export const downloadHtmlAsPdf = (htmlString, filename, options = {}) => {
  return new Promise((resolve) => {
    const isLandscape = options.orientation === 'landscape';
    const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.cssText = `
      position: fixed; left: 0; top: 0;
      width: ${isLandscape ? '297mm' : '210mm'};
      height: ${isLandscape ? '210mm' : '297mm'};
      z-index: -1; pointer-events: none; border: none;
    `;
    iframe.src = url;
    document.body.appendChild(iframe);

    const cleanup = () => {
      if (iframe.parentNode) document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    };

    const waitForImages = (doc) => {
      const images = Array.from(doc.querySelectorAll('img'));
      if (images.length === 0) return Promise.resolve();
      return Promise.all(
        images.map(
          (img) =>
            new Promise((res) => {
              if (img.complete) return res();
              img.onload = res;
              img.onerror = res;
              setTimeout(res, 5000);
            })
        )
      );
    };

    iframe.onload = async () => {
      try {
        const doc = iframe.contentDocument;
        await new Promise((r) => setTimeout(r, 300));
        await waitForImages(doc);

        const body = doc.body;
        const opt = {
          margin: 0,
          filename,
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            windowWidth: isLandscape ? 1122 : 794,
            windowHeight: isLandscape ? 794 : 1122,
          },
          jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: isLandscape ? 'landscape' : 'portrait',
          },
        };

        await html2pdf().set(opt).from(body).save();
      } finally {
        cleanup();
        resolve();
      }
    };
  });
};
